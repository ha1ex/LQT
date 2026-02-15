import { put, head, del } from '@vercel/blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const DATA_FILE = 'lqt-data/all-data.json';
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

const isAuthorized = (req: VercelRequest): boolean => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  const token = authHeader.substring(7);
  return token === AUTH_PASSWORD;
};

// Получить все данные из Blob
const getAllData = async (): Promise<Record<string, unknown>> => {
  try {
    const blob = await head(DATA_FILE);
    if (blob) {
      const response = await fetch(blob.url);
      return await response.json();
    }
  } catch {
    // Файл не существует
  }
  return {};
};

// Сохранить все данные в Blob
const saveAllData = async (data: Record<string, unknown>): Promise<void> => {
  try {
    await del(DATA_FILE);
  } catch {
    // Игнорируем
  }

  await put(DATA_FILE, JSON.stringify(data), {
    access: 'public',
    addRandomSuffix: false,
  });
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || 'https://lqt.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Rate limiting
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(clientIp)) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    switch (req.method) {
      case 'GET': {
        const allData = await getAllData();
        return res.status(200).json({
          success: true,
          data: allData,
          timestamp: Date.now()
        });
      }

      case 'POST': {
        const { data } = req.body;

        if (!data || typeof data !== 'object') {
          return res.status(400).json({ error: 'Invalid sync data' });
        }

        // Получаем существующие данные и мержим
        const existingData = await getAllData();
        const mergedData = { ...existingData, ...data };

        // Для ratings делаем глубокий мерж
        if (existingData.ratings && data.ratings) {
          mergedData.ratings = {
            ...(existingData.ratings as object),
            ...(data.ratings as object)
          };
        }

        await saveAllData(mergedData);

        return res.status(200).json({
          success: true,
          message: 'Data synced',
          timestamp: Date.now()
        });
      }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Sync API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
