import { Redis } from '@upstash/redis';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Создаём клиент Redis из переменных окружения
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const RATINGS_KEY = 'lqt_weekly_ratings';
const AUTH_PASSWORD = 'qwerty87';

// Простая проверка авторизации
const isAuthorized = (req: VercelRequest): boolean => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  const token = authHeader.substring(7);
  return token === AUTH_PASSWORD;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Проверка авторизации
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    switch (req.method) {
      case 'GET': {
        // Получить все оценки
        const ratings = await redis.get(RATINGS_KEY);
        return res.status(200).json(ratings || {});
      }

      case 'POST': {
        // Сохранить/обновить оценки
        const { ratings } = req.body;

        if (!ratings || typeof ratings !== 'object') {
          return res.status(400).json({ error: 'Invalid ratings data' });
        }

        // Получаем текущие данные
        const existingRatings = (await redis.get(RATINGS_KEY)) || {};

        // Мержим с новыми данными
        const mergedRatings = { ...existingRatings as object, ...ratings };

        // Сохраняем
        await redis.set(RATINGS_KEY, mergedRatings);

        return res.status(200).json({
          success: true,
          message: 'Ratings saved',
          count: Object.keys(mergedRatings).length
        });
      }

      case 'DELETE': {
        // Удалить конкретную оценку по ID
        const { id } = req.query;

        if (!id || typeof id !== 'string') {
          return res.status(400).json({ error: 'Rating ID required' });
        }

        const existingRatings = (await redis.get(RATINGS_KEY) || {}) as Record<string, unknown>;

        if (existingRatings[id]) {
          delete existingRatings[id];
          await redis.set(RATINGS_KEY, existingRatings);
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
