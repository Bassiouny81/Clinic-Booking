import { Router } from "express";
import { db } from "@workspace/db";
import {
  patientsTable,
  appointmentsTable,
  notificationsTable,
  doctorsTable,
  servicesTable,
} from "@workspace/db/schema";
import { eq, inArray } from "drizzle-orm";
import { sendWhatsAppNotification } from "../lib/whatsapp";

const router = Router();

router.post("/booking", async (req, res) => {
  try {
    const {
      patientName,
      patientPhone,
      patientEmail,
      doctorId,
      serviceId,
      appointmentTypeId,
      scheduledAt,
      mode,
      notes,
    } = req.body;

    if (!patientName || !patientPhone || !scheduledAt || !mode) {
      return res.status(400).json({
        error: "patientName, patientPhone, scheduledAt, and mode are required",
      });
    }

    const phone = patientPhone.replace(/^0/, "+966").replace(/\s/g, "");

    let [existingPatient] = await db
      .select()
      .from(patientsTable)
      .where(eq(patientsTable.phone, phone));

    let patient = existingPatient;
    if (!patient) {
      [patient] = await db
        .insert(patientsTable)
        .values({
          nameAr: patientName,
          phone,
          email: patientEmail || null,
        })
        .returning();
    }

    const [appointment] = await db
      .insert(appointmentsTable)
      .values({
        patientId: patient.id,
        doctorId: doctorId || null,
        serviceId: serviceId || null,
        appointmentTypeId: appointmentTypeId || null,
        scheduledAt: new Date(scheduledAt),
        mode,
        notes: notes || null,
        status: "scheduled",
      })
      .returning();

    const scheduledDate = new Date(scheduledAt);
    const dateStr = scheduledDate.toLocaleDateString("ar-SA", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const timeStr = scheduledDate.toLocaleTimeString("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const modeText = mode === "online" ? "عبر الإنترنت" : "حضوري في العيادة";

    const message = `مرحباً ${patientName}،\n\nتم تأكيد موعدك بنجاح ✅\n\n📅 التاريخ: ${dateStr}\n🕐 الوقت: ${timeStr}\n📍 نوع الموعد: ${modeText}\n\nنتطلع لرؤيتك!\nعيادة التغذية 🌿`;

    let notificationSent = false;
    try {
      await sendWhatsAppNotification(phone, message);
      notificationSent = true;

      await db.insert(notificationsTable).values({
        appointmentId: appointment.id,
        patientId: patient.id,
        type: "confirmation",
        channel: "whatsapp",
        message,
        status: "sent",
        sentAt: new Date(),
      });
    } catch (notifErr) {
      req.log.warn({ notifErr }, "WhatsApp notification failed, continuing");
      await db.insert(notificationsTable).values({
        appointmentId: appointment.id,
        patientId: patient.id,
        type: "confirmation",
        channel: "whatsapp",
        message,
        status: "failed",
      });
    }

    res.status(201).json({
      appointment: {
        ...appointment,
        patient,
      },
      notificationSent,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create booking");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
