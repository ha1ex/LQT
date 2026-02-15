import { put, head, del } from '@vercel/blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const RATINGS_FILE = 'lqt-data/ratings.json';
const AUTH_PASSWORD = process.env.APP_PASSWORD;

// Rate limiting
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 60;
const requestCounts = new Map<string, { count: number; resetAt: number }>();

const isRateLimited = (ip: string): boolean => {
  const now = Date.now();
  const entry = requestCounts.get(ip);
  if (!entry || now > entry.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
};

// Простая проверка авторизации
const isAuthorized = (req: VercelRequest): boolean => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  const token = authHeader.substring(7);
  return token === AUTH_PASSWORD;
};

// Получить данные из Blob
const getRatings = async (): Promise<Record<string, unknown>> => {
  try {
    const blob = await head(RATINGS_FILE);
    if (blob) {
      const response = await fetch(blob.url);
      return await response.json();
    }
  } catch {
    // Файл не существует
  }
  return {};
};

// Сохранить данные в Blob
const saveRatings = async (data: Record<string, unknown>): Promise<void> => {
  // Удаляем старый файл если есть
  try {
    await del(RATINGS_FILE);
  } catch {
    // Игнорируем если файла нет
  }

  // Создаём новый
  await put(RATINGS_FILE, JSON.stringify(data), {
    access: 'public',
    addRandomSuffix: false,
  });
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || 'https://lqt.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Rate limiting
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(clientIp)) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  // Проверка авторизации
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    switch (req.method) {
      case 'GET': {
        const ratings = await getRatings();
        return res.status(200).json(ratings);
      }

      case 'POST': {
        const { ratings } = req.body;

        if (!ratings || typeof ratings !== 'object') {
          return res.status(400).json({ error: 'Invalid ratings data' });
        }

        // Получаем текущие данные и мержим
        const existingRatings = await getRatings();
        const mergedRatings = { ...existingRatings, ...ratings };

        // Сохраняем
        await saveRatings(mergedRatings);

        return res.status(200).json({
          success: true,
          message: 'Ratings saved',
          count: Object.keys(mergedRatings).length
        });
      }

      case 'DELETE': {
        const { id } = req.query;

        if (!id || typeof id !== 'string') {
          return res.status(400).json({ error: 'Rating ID required' });
        }

        const existingRatings = await getRatings();

        if (existingRatings[id]) {
          delete existingRatings[id];
          await saveRatings(existingRatings);
          return res.status(200).json({ success: true, message: 'Rating deleted' });
        }

        return res.status(404).json({ error: 'Rating not found' });
      }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
