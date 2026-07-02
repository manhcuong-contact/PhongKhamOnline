import express from 'express';
import { getStats, getAllAppointments, updateAppointmentStatus } from '../controllers/adminController.js';
import { requireAuth, requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Tất cả admin routes đều cần xác thực + quyền admin
router.use(requireAuth, requireAdmin);

router.get('/stats', getStats);
router.get('/appointments', getAllAppointments);
router.put('/appointments/:id/status', updateAppointmentStatus);

export default router;
