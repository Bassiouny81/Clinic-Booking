import { Router } from "express";
import { db } from "@workspace/db";
import { patientsTable } from "@workspace/db/schema";
import { eq, and, isNull, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/roleMiddleware";
const router = Router();
router.get("/patients", requireAuth, async (req, res) => {
    try {
        const { search, page = "1", limit = "20" } = req.query;
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, parseInt(limit));
        const offset = (pageNum - 1) * limitNum;
        const conditions = [eq(patientsTable.isActive, true), isNull(patientsTable.deletedAt)];
        if (search) {
            conditions.push(sql `(${patientsTable.nameAr} ILIKE ${`%${search}%`} OR ${patientsTable.phone} ILIKE ${`%${search}%`} OR ${patientsTable.nameEn} ILIKE ${`%${search}%`})`);
        }
        const whereClause = and(...conditions);
        const [patients, countResult] = await Promise.all([
            db
                .select()
                .from(patientsTable)
                .where(whereClause)
                .limit(limitNum)
                .offset(offset)
                .orderBy(sql `${patientsTable.createdAt} DESC`),
            db
                .select({ count: sql `count(*)` })
                .from(patientsTable)
                .where(whereClause),
        ]);
        res.json({
            patients,
            total: Number(countResult[0].count),
            page: pageNum,
            limit: limitNum,
        });
    }
    catch (err) {
        req.log.error({ err }, "Failed to list patients");
        res.status(500).json({ error: "Internal server error" });
    }
});
router.post("/patients", async (req, res) => {
    try {
        const { nameAr, nameEn, phone, email, dateOfBirth, gender, nationalId, medicalHistory, allergies, metadata } = req.body;
        if (!nameAr || !phone) {
            return res.status(400).json({ error: "nameAr and phone are required" });
        }
        const [patient] = await db
            .insert(patientsTable)
            .values({
            nameAr,
            nameEn,
            phone,
            email,
            dateOfBirth,
            gender,
            nationalId,
            medicalHistory,
            allergies,
            metadata: metadata || {},
        })
            .returning();
        res.status(201).json(patient);
    }
    catch (err) {
        req.log.error({ err }, "Failed to create patient");
        res.status(500).json({ error: "Internal server error" });
    }
});
router.get("/patients/:patientId", async (req, res) => {
    try {
        const { patientId } = req.params;
        const [patient] = await db
            .select()
            .from(patientsTable)
            .where(and(eq(patientsTable.id, patientId), isNull(patientsTable.deletedAt)));
        if (!patient) {
            return res.status(404).json({ error: "Patient not found" });
        }
        res.json(patient);
    }
    catch (err) {
        req.log.error({ err }, "Failed to get patient");
        res.status(500).json({ error: "Internal server error" });
    }
});
router.patch("/patients/:patientId", async (req, res) => {
    try {
        const { patientId } = req.params;
        const { nameAr, nameEn, phone, email, dateOfBirth, gender, nationalId, medicalHistory, allergies, metadata } = req.body;
        const [patient] = await db
            .update(patientsTable)
            .set({
            ...(nameAr && { nameAr }),
            ...(nameEn !== undefined && { nameEn }),
            ...(phone && { phone }),
            ...(email !== undefined && { email }),
            ...(dateOfBirth !== undefined && { dateOfBirth }),
            ...(gender !== undefined && { gender }),
            ...(nationalId !== undefined && { nationalId }),
            ...(medicalHistory !== undefined && { medicalHistory }),
            ...(allergies !== undefined && { allergies }),
            ...(metadata !== undefined && { metadata }),
        })
            .where(eq(patientsTable.id, patientId))
            .returning();
        if (!patient) {
            return res.status(404).json({ error: "Patient not found" });
        }
        res.json(patient);
    }
    catch (err) {
        req.log.error({ err }, "Failed to update patient");
        res.status(500).json({ error: "Internal server error" });
    }
});
export default router;
