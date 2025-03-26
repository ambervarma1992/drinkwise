import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { supabase } from '../lib/supabase';

const router = express.Router();

// Get all drinks for a session
router.get('/session/:sessionId', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { sessionId } = req.params;
    const { data: drinks, error } = await supabase
      .from('drinks')
      .select('*')
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Get drinks error:', error);
      res.status(500).json({ error: 'Failed to fetch drinks' });
      return;
    }

    res.json(drinks);
  } catch (error) {
    console.error('Get drinks error:', error);
    res.status(500).json({ error: 'Failed to fetch drinks' });
  }
});

// Add a new drink to a session
router.post('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { sessionId, units, buzzLevel, notes } = req.body;

    // Verify session belongs to user
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', req.user.userId)
      .single();

    if (sessionError || !session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    const { data: drink, error } = await supabase
      .from('drinks')
      .insert({
        session_id: sessionId,
        user_id: req.user.userId,
        units,
        buzz_level: buzzLevel,
        timestamp: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Create drink error:', error);
      res.status(500).json({ error: 'Failed to create drink' });
      return;
    }

    res.status(201).json(drink);
  } catch (error) {
    console.error('Create drink error:', error);
    res.status(500).json({ error: 'Failed to create drink' });
  }
});

// Update a drink
router.patch('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { id } = req.params;
    const { units, buzzLevel } = req.body;

    const { data: drink, error } = await supabase
      .from('drinks')
      .update({
        units,
        buzz_level: buzzLevel,
      })
      .eq('id', id)
      .eq('user_id', req.user.userId)
      .select()
      .single();

    if (error) {
      console.error('Update drink error:', error);
      res.status(500).json({ error: 'Failed to update drink' });
      return;
    }

    res.json(drink);
  } catch (error) {
    console.error('Update drink error:', error);
    res.status(500).json({ error: 'Failed to update drink' });
  }
});

// Delete a drink
router.delete('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { id } = req.params;
    const { error } = await supabase
      .from('drinks')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.userId);

    if (error) {
      console.error('Delete drink error:', error);
      res.status(500).json({ error: 'Failed to delete drink' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete drink error:', error);
    res.status(500).json({ error: 'Failed to delete drink' });
  }
});

export default router; 