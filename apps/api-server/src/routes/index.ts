import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import appointmentTypesRouter from "./appointmentTypes";
import servicesRouter from "./services";
import doctorsRouter from "./doctors";
import patientsRouter from "./patients";
import appointmentsRouter from "./appointments";
import invoicesRouter from "./invoices";
import notificationsRouter from "./notifications";
import patientFilesRouter from "./patientFiles";
import paymentsRouter from "./payments";
import bookingRouter from "./booking";

const router: IRouter = Router();

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
