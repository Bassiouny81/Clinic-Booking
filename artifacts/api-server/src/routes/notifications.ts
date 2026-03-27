import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { notificationsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();

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
    const { appointmentId, patientId, type, channel, message } = req.body;

    if (!patientId || !type || !channel) {
      return res.status(400).json({ error: "patientId, type, and channel are required" });
    }

    // In a real implementation, this would call WhatsApp/SMS APIs
    // For now, we simulate sending
    const [notification] = await db
      .insert(notificationsTable)
      .values({
        appointmentId,
        patientId,
        type,
        channel,
        message,
        status: "sent",
        sentAt: new Date(),
      })
      .returning();

    res.status(201).json(notification);
  } catch (err) {
    req.log.error({ err }, "Failed to send notification");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
