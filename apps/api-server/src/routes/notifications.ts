import { Router } from "express";
import { db } from "@workspace/db";
import { notificationsTable, patientsTable, appointmentsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { sendWhatsAppNotification, buildConfirmationMessage, buildReminderMessage, buildFollowUpMessage } from "../lib/whatsapp";

const router = Router();

router.get("/notifications", async (req, res) => {
  try {
    const { appointmentId } = req.query as { appointmentId?: string };
    const conditions = appointmentId
      ? [eq(notificationsTable.appointmentId, appointmentId)]
      : [];

    const notifications = await db
      .select()
      .from(notificationsTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(notificationsTable.createdAt);

    res.json(notifications);
  } catch (err) {
    req.log.error({ err }, "Failed to list notifications");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/notifications", async (req, res) => {
  try {
    const { appointmentId, patientId, type, channel, message: customMessage } = req.body;

    if (!patientId || !type || !channel) {
      return res.status(400).json({ error: "patientId, type, and channel are required" });
    }

    const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, patientId));
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    let appointment = null;
    if (appointmentId) {
      const [appt] = await db.select().from(appointmentsTable).where(eq(appointmentsTable.id, appointmentId));
      appointment = appt;
    }

    let messageText = customMessage;
    if (!messageText) {
      const patientName = patient.nameAr;
      const scheduledAt = appointment?.scheduledAt ? new Date(appointment.scheduledAt) : new Date();
      const mode = appointment?.mode || "in_person";

      switch (type) {
        case "confirmation":
          messageText = buildConfirmationMessage(patientName, scheduledAt, mode);
          break;
        case "reminder_24h":
        case "reminder_1h":
          messageText = buildReminderMessage(patientName, scheduledAt, mode);
          break;
        case "follow_up":
          messageText = buildFollowUpMessage(patientName);
          break;
        default:
          messageText = `مرحباً ${patientName}، لديك رسالة من عيادة التغذية.`;
      }
    }

    let status: "sent" | "failed" | "pending" = "pending";
    let sentAt: Date | undefined;
    let whatsappSid: string | undefined;

    if (channel === "whatsapp" && patient.phone) {
      try {
        whatsappSid = await sendWhatsAppNotification(patient.phone, messageText);
        status = "sent";
        sentAt = new Date();
        req.log.info({ whatsappSid, patientId }, "WhatsApp notification sent");
      } catch (whatsappErr) {
        req.log.error({ whatsappErr }, "WhatsApp send failed");
        status = "failed";
      }
    } else {
      status = "sent";
      sentAt = new Date();
    }

    const [notification] = await db
      .insert(notificationsTable)
      .values({
        appointmentId: appointmentId || null,
        patientId,
        type,
        channel,
        message: messageText,
        status,
        sentAt: sentAt || null,
      })
      .returning();

    res.status(201).json(notification);
  } catch (err) {
    req.log.error({ err }, "Failed to send notification");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
