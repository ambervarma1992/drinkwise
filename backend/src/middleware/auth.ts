import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';
import https from 'https';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
  };
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ error: 'No authorization header' });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    // Configure Supabase client to ignore SSL certificate issues in development
    const agent = new https.Agent({
      rejectUnauthorized: false // Only use this in development!
    });

    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error('Auth error:', error);
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    req.user = { userId: user.id };
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
}; 