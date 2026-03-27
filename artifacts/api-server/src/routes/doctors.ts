import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { doctorsTable, appointmentsTable } from "@workspace/db/schema";
import { eq, and, isNull, gte, lte } from "drizzle-orm";

const router: IRouter = Router();

router.get("/doctors", async (req, res) => {
  try {
    const doctors = await db
      .select()
      .from(doctorsTable)
      .where(and(eq(doctorsTable.isActive, true), isNull(doctorsTable.deletedAt)));
    res.json(doctors);
  } catch (err) {
    req.log.error({ err }, "Failed to list doctors");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/doctors/:doctorId/availability", async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query as { date: string };

    if (!date) {
      return res.status(400).json({ error: "date query parameter is required" });
    }

    const dayStart = new Date(`${date}T00:00:00`);
    const dayEnd = new Date(`${date}T23:59:59`);

    const existingAppointments = await db
      .select()
      .from(appointmentsTable)
      .where(
        and(
          eq(appointmentsTable.doctorId, doctorId),
          gte(appointmentsTable.scheduledAt, dayStart),
          lte(appointmentsTable.scheduledAt, dayEnd),
          isNull(appointmentsTable.deletedAt)
        )
      );

    const slots = [];
    const workStart = 9;
    const workEnd = 17;

    for (let hour = workStart; hour < workEnd; hour++) {
      for (const minute of [0, 30]) {
        const slotStart = new Date(`${date}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`);
        const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000);

        const isBooked = existingAppointments.some((apt) => {
          const aptStart = new Date(apt.scheduledAt);
          const aptEnd = new Date(aptStart.getTime() + apt.durationMinutes * 60 * 1000);
          return slotStart < aptEnd && slotEnd > aptStart;
        });

        slots.push({
          startTime: slotStart.toISOString(),
          endTime: slotEnd.toISOString(),
          isAvailable: !isBooked,
        });
      }
    }

    res.json(slots);
  } catch (err) {
    req.log.error({ err }, "Failed to get doctor availability");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
