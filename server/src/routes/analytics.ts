import { Router, Request, Response } from 'express';
import { calculateDepartmentMetrics } from '../store';
import { DomainType } from '../types';

const router = Router();

// GET /api/analytics/departments
router.get('/departments', (req: Request, res: Response) => {
  try {
    const domain = req.query.domain as DomainType | undefined;
    const metrics = calculateDepartmentMetrics(domain || undefined);
    return res.json({ departments: metrics });
  } catch (error: any) {
    console.error('Error fetching department analytics:', error);
    return res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
