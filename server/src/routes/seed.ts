import { Router, Request, Response } from 'express';
import { resetDatabase } from '../store';

const router = Router();

// POST /api/seed
router.post('/', (req: Request, res: Response) => {
  try {
    const db = resetDatabase();
    return res.json({
      success: true,
      message: 'Database reset to default test scenarios',
      total: db.issues.length
    });
  } catch (error: any) {
    console.error('Error resetting database:', error);
    return res.status(500).json({ error: 'Failed to reset database' });
  }
});

export default router;
