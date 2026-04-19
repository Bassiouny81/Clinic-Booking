import { Router } from "express";
import { db } from "@workspace/db";
import { patientFilesTable } from "@workspace/db/schema";
import { eq, and, isNull } from "drizzle-orm";

const router = Router();

router.get("/patient-files/:patientId", async (req, res) => {
  try {
    const { patientId } = req.params;
    const files = await db
      .select()
      .from(patientFilesTable)
      .where(and(eq(patientFilesTable.patientId, patientId), isNull(patientFilesTable.deletedAt)))
      .orderBy(patientFilesTable.uploadedAt);

    res.json(files);
  } catch (err) {
    req.log.error({ err }, "Failed to list patient files");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/patient-files", async (req, res) => {
  try {
    const { patientId, fileName, fileType, fileUrl, fileSize, notes } = req.body;

    if (!patientId || !fileName || !fileType) {
      return res.status(400).json({ error: "patientId, fileName, and fileType are required" });
    }

    const [file] = await db
      .insert(patientFilesTable)
      .values({
        patientId,
        fileName,
        fileType,
        fileUrl,
        fileSize,
        notes,
      })
      .returning();

    res.status(201).json(file);
  } catch (err) {
    req.log.error({ err }, "Failed to create patient file record");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
