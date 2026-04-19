import { Router } from "express";
import { db } from "@workspace/db";
import { servicesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/services", async (req, res) => {
  try {
    const services = await db
      .select()
      .from(servicesTable)
      .where(eq(servicesTable.isActive, true));
    res.json(
      services.map((s) => ({
        ...s,
        price: parseFloat(s.price),
        vatRate: parseFloat(s.vatRate),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to list services");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
