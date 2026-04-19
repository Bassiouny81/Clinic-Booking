import { Router } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import appointmentTypesRouter from "./appointmentTypes.js";
import servicesRouter from "./services.js";
import doctorsRouter from "./doctors.js";
import patientsRouter from "./patients.js";
import appointmentsRouter from "./appointments.js";
import invoicesRouter from "./invoices.js";
import notificationsRouter from "./notifications.js";
import patientFilesRouter from "./patientFiles.js";
import paymentsRouter from "./payments.js";
import bookingRouter from "./booking.js";

const router = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(appointmentTypesRouter);
router.use(servicesRouter);
router.use(doctorsRouter);
router.use(patientsRouter);
router.use(appointmentsRouter);
router.use(invoicesRouter);
router.use(notificationsRouter);
router.use(patientFilesRouter);
router.use(paymentsRouter);
router.use(bookingRouter);

export default router;
