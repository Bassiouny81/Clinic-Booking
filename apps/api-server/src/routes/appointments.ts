import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  appointmentsTable,
  patientsTable,
  doctorsTable,
  servicesTable,
  appointmentTypesTable,
} from "@workspace/db/schema";
import { eq, and, isNull, sql, gte, lte, inArray } from "drizzle-orm";
import { requireAuth } from "../middlewares/roleMiddleware";

const router: IRouter = Router();

async function enrichAppointments(appointments: any[]) {
  if (appointments.length === 0) return [];

  const patientIds = [...new Set(appointments.map((a) => a.patientId).filter(Boolean))];
  const doctorIds = [...new Set(appointments.map((a) => a.doctorId).filter(Boolean))];
  const serviceIds = [...new Set(appointments.map((a) => a.serviceId).filter(Boolean))];
  const typeIds = [...new Set(appointments.map((a) => a.appointmentTypeId).filter(Boolean))];

  const [patients, doctors, services, types] = await Promise.all([
    patientIds.length > 0
      ? db.select().from(patientsTable).where(inArray(patientsTable.id, patientIds))
      : Promise.resolve([]),
    doctorIds.length > 0
      ? db.select().from(doctorsTable).where(inArray(doctorsTable.id, doctorIds))
      : Promise.resolve([]),
    serviceIds.length > 0
      ? db.select().from(servicesTable).where(inArray(servicesTable.id, serviceIds))
      : Promise.resolve([]),
    typeIds.length > 0
      ? db.select().from(appointmentTypesTable).where(inArray(appointmentTypesTable.id, typeIds))
      : Promise.resolve([]),
  ]);

  const patientMap = Object.fromEntries(patients.map((p) => [p.id, p]));
  const doctorMap = Object.fromEntries(doctors.map((d) => [d.id, d]));
  const serviceMap = Object.fromEntries(
    services.map((s) => [s.id, { ...s, price: parseFloat(s.price), vatRate: parseFloat(s.vatRate) }])
  );
  const typeMap = Object.fromEntries(types.map((t) => [t.id, t]));

  return appointments.map((a) => ({
    ...a,
    patient: patientMap[a.patientId] || null,
    doctor: a.doctorId ? doctorMap[a.doctorId] || null : null,
    service: a.serviceId ? serviceMap[a.serviceId] || null : null,
    appointmentType: a.appointmentTypeId ? typeMap[a.appointmentTypeId] || null : null,
  }));
}

router.get("/appointments", requireAuth, async (req, res) => {
  try {
    const { status, date, doctorId, patientId, page = "1", limit = "20" } = req.query as {
      status?: string;
      date?: string;
      doctorId?: string;
      patientId?: string;
      page?: string;
      limit?: string;
    };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [isNull(appointmentsTable.deletedAt)];

    if (status) conditions.push(eq(appointmentsTable.status, status));
    if (doctorId) conditions.push(eq(appointmentsTable.doctorId, doctorId));
    if (patientId) conditions.push(eq(appointmentsTable.patientId, patientId));

    if (date) {
      const dayStart = new Date(`${date}T00:00:00`);
      const dayEnd = new Date(`${date}T23:59:59`);
      conditions.push(gte(appointmentsTable.scheduledAt, dayStart));
      conditions.push(lte(appointmentsTable.scheduledAt, dayEnd));
    }

    const whereClause = and(...conditions);

    const [appointments, countResult] = await Promise.all([
      db
        .select()
        .from(appointmentsTable)
        .where(whereClause)
        .limit(limitNum)
        .offset(offset)
        .orderBy(sql`${appointmentsTable.scheduledAt} DESC`),
      db.select({ count: sql<number>`count(*)` }).from(appointmentsTable).where(whereClause),
    ]);

    const enriched = await enrichAppointments(appointments);

    res.json({
      appointments: enriched,
      total: Number(countResult[0].count),
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to list appointments");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/appointments", requireAuth, async (req, res) => {
  try {
    const { patientId, doctorId, serviceId, appointmentTypeId, scheduledAt, durationMinutes = 60, mode, notes } =
      req.body;

    if (!patientId || !scheduledAt || !mode) {
      return res.status(400).json({ error: "patientId, scheduledAt, and mode are required" });
    }

    const [appointment] = await db
      .insert(appointmentsTable)
      .values({
        patientId,
        doctorId,
        serviceId,
        appointmentTypeId,
        scheduledAt: new Date(scheduledAt),
        durationMinutes,
        mode,
        notes,
        status: "scheduled",
      })
      .returning();

    const [enriched] = await enrichAppointments([appointment]);
    res.status(201).json(enriched);
  } catch (err) {
    req.log.error({ err }, "Failed to create appointment");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/appointments/:appointmentId", async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const [appointment] = await db
      .select()
      .from(appointmentsTable)
      .where(and(eq(appointmentsTable.id, appointmentId), isNull(appointmentsTable.deletedAt)));

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    const [enriched] = await enrichAppointments([appointment]);
    res.json(enriched);
  } catch (err) {
    req.log.error({ err }, "Failed to get appointment");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/appointments/:appointmentId", async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { scheduledAt, status, mode, notes, videoLink } = req.body;

    const [appointment] = await db
      .update(appointmentsTable)
      .set({
        ...(scheduledAt && { scheduledAt: new Date(scheduledAt) }),
        ...(status && { status }),
        ...(mode && { mode }),
        ...(notes !== undefined && { notes }),
        ...(videoLink !== undefined && { videoLink }),
      })
      .where(eq(appointmentsTable.id, appointmentId))
      .returning();

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    const [enriched] = await enrichAppointments([appointment]);
    res.json(enriched);
  } catch (err) {
    req.log.error({ err }, "Failed to update appointment");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/appointments/:appointmentId", async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const [appointment] = await db
      .update(appointmentsTable)
      .set({ status: "cancelled", deletedAt: new Date() })
      .where(eq(appointmentsTable.id, appointmentId))
      .returning();

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    res.json(appointment);
  } catch (err) {
    req.log.error({ err }, "Failed to cancel appointment");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/stats", requireAuth, async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    const weekEnd = new Date(todayStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [
      todayResult,
      weekResult,
      patientResult,
      revenueResult,
      pendingInvoicesResult,
      upcomingAppointments,
    ] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)` })
        .from(appointmentsTable)
        .where(
          and(
            gte(appointmentsTable.scheduledAt, todayStart),
            lte(appointmentsTable.scheduledAt, todayEnd),
            isNull(appointmentsTable.deletedAt)
          )
        ),
      db
        .select({ count: sql<number>`count(*)` })
        .from(appointmentsTable)
        .where(
          and(
            gte(appointmentsTable.scheduledAt, todayStart),
            lte(appointmentsTable.scheduledAt, weekEnd),
            isNull(appointmentsTable.deletedAt)
          )
        ),
      db
        .select({ count: sql<number>`count(*)` })
        .from(patientsTable)
        .where(and(eq(patientsTable.isActive, true), isNull(patientsTable.deletedAt))),
      db.execute(sql`
        SELECT COALESCE(SUM(total::numeric), 0) as revenue
        FROM invoices
        WHERE status = 'paid'
        AND issue_date >= ${monthStart.toISOString().split("T")[0]}
        AND issue_date <= ${monthEnd.toISOString().split("T")[0]}
        AND deleted_at IS NULL
      `),
      db.execute(sql`
        SELECT COUNT(*) as count FROM invoices
        WHERE status IN ('draft', 'sent')
        AND deleted_at IS NULL
      `),
      db
        .select()
        .from(appointmentsTable)
        .where(
          and(
            gte(appointmentsTable.scheduledAt, now),
            isNull(appointmentsTable.deletedAt),
            eq(appointmentsTable.status, "scheduled")
          )
        )
        .limit(5)
        .orderBy(appointmentsTable.scheduledAt),
    ]);

    const enrichedUpcoming = await enrichAppointments(upcomingAppointments);

    res.json({
      todayAppointments: Number(todayResult[0].count),
      weekAppointments: Number(weekResult[0].count),
      totalPatients: Number(patientResult[0].count),
      monthRevenue: Number((revenueResult.rows[0] as any)?.revenue || 0),
      pendingInvoices: Number((pendingInvoicesResult.rows[0] as any)?.count || 0),
      upcomingAppointments: enrichedUpcoming,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get dashboard stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
