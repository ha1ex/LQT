import { Redis } from '@upstash/redis';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const AUTH_PASSWORD = 'qwerty87';

// Ключи для всех данных
const STORAGE_KEYS = {
  ratings: 'lqt_weekly_ratings',
  hypotheses: 'lqt_hypotheses',
  subjects: 'lqt_subjects',
  goals: 'lqt_goals',
  chat_history: 'lqt_ai_chat_history',
  preferences: 'lqt_user_preferences'
};

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
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    switch (req.method) {
      case 'GET': {
        // Получить все данные для синхронизации
        const allData: Record<string, unknown> = {};

        for (const [key, redisKey] of Object.entries(STORAGE_KEYS)) {
          const data = await redis.get(redisKey);
          allData[key] = data || null;
        }

        return res.status(200).json({
          success: true,
          data: allData,
          timestamp: Date.now()
        });
      }

      case 'POST': {
        // Синхронизировать все данные с клиента
        const { data } = req.body;

        if (!data || typeof data !== 'object') {
          return res.status(400).json({ error: 'Invalid sync data' });
        }

        const results: Record<string, boolean> = {};

        for (const [key, redisKey] of Object.entries(STORAGE_KEYS)) {
          if (data[key] !== undefined && data[key] !== null) {
            await redis.set(redisKey, data[key]);
            results[key] = true;
          }
        }

        return res.status(200).json({
          success: true,
          message: 'Data synced',
          synced: results,
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
