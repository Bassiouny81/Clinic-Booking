import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { appointmentTypesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/appointment-types", async (req, res) => {
  try {
    const types = await db
      .select()
      .from(appointmentTypesTable)
      .where(eq(appointmentTypesTable.isActive, true));
    res.json(types);
  } catch (err) {
    req.log.error({ err }, "Failed to list appointment types");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
