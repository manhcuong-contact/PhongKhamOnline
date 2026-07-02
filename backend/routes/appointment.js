import express from 'express';
import { createAppointment, getAppointments, cancelAppointment } from '../controllers/appointmentController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { validate } from '../validators/authValidator.js';
import { createAppointmentSchema } from '../validators/appointmentValidator.js';

const router = express.Router();

// Tất cả route appointment đều yêu cầu đăng nhập
router.use(requireAuth);

router.post('/', validate(createAppointmentSchema), createAppointment);
router.get('/', getAppointments);
router.put('/:id/cancel', cancelAppointment);

export default router;
