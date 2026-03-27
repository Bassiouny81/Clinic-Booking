import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { invoicesTable, invoiceItemsTable, patientsTable } from "@workspace/db/schema";
import { eq, and, isNull, sql, inArray } from "drizzle-orm";

const router: IRouter = Router();

async function enrichInvoices(invoices: any[]) {
  if (invoices.length === 0) return [];

  const invoiceIds = invoices.map((i) => i.id);
  const patientIds = [...new Set(invoices.map((i) => i.patientId).filter(Boolean))];

  const [items, patients] = await Promise.all([
    db.select().from(invoiceItemsTable).where(inArray(invoiceItemsTable.invoiceId, invoiceIds)),
    patientIds.length > 0
      ? db.select().from(patientsTable).where(inArray(patientsTable.id, patientIds))
      : Promise.resolve([]),
  ]);

  const itemsByInvoice: Record<string, typeof items> = {};
  for (const item of items) {
    if (!itemsByInvoice[item.invoiceId]) itemsByInvoice[item.invoiceId] = [];
    itemsByInvoice[item.invoiceId].push(item);
  }

  const patientMap = Object.fromEntries(patients.map((p) => [p.id, p]));

  return invoices.map((inv) => ({
    ...inv,
    subtotal: parseFloat(inv.subtotal),
    vatAmount: parseFloat(inv.vatAmount),
    vatRate: parseFloat(inv.vatRate),
    total: parseFloat(inv.total),
    patient: patientMap[inv.patientId] || null,
    items: (itemsByInvoice[inv.id] || []).map((item) => ({
      ...item,
      unitPrice: parseFloat(item.unitPrice),
      total: parseFloat(item.total),
    })),
  }));
}

let invoiceCounter = 1000;

router.get("/invoices", async (req, res) => {
  try {
    const { status, patientId, page = "1", limit = "20" } = req.query as {
      status?: string;
      patientId?: string;
      page?: string;
      limit?: string;
    };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [isNull(invoicesTable.deletedAt)];
    if (status) conditions.push(eq(invoicesTable.status, status));
    if (patientId) conditions.push(eq(invoicesTable.patientId, patientId));

    const whereClause = and(...conditions);

    const [invoices, countResult] = await Promise.all([
      db
        .select()
        .from(invoicesTable)
        .where(whereClause)
        .limit(limitNum)
        .offset(offset)
        .orderBy(sql`${invoicesTable.createdAt} DESC`),
      db.select({ count: sql<number>`count(*)` }).from(invoicesTable).where(whereClause),
    ]);

    const enriched = await enrichInvoices(invoices);

    res.json({
      invoices: enriched,
      total: Number(countResult[0].count),
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to list invoices");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/invoices", async (req, res) => {
  try {
    const { patientId, appointmentId, items, vatRate = 0.15, paymentMethod, dueDate, notes } = req.body;

    if (!patientId || !items || items.length === 0) {
      return res.status(400).json({ error: "patientId and items are required" });
    }

    const subtotal = items.reduce(
      (sum: number, item: { quantity: number; unitPrice: number }) => sum + item.quantity * item.unitPrice,
      0
    );
    const vatAmount = subtotal * vatRate;
    const total = subtotal + vatAmount;
    const today = new Date().toISOString().split("T")[0];
    invoiceCounter++;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoiceCounter).padStart(4, "0")}`;

    const [invoice] = await db
      .insert(invoicesTable)
      .values({
        invoiceNumber,
        patientId,
        appointmentId,
        subtotal: subtotal.toFixed(2),
        vatAmount: vatAmount.toFixed(2),
        vatRate: vatRate.toFixed(4),
        total: total.toFixed(2),
        status: "draft",
        paymentMethod,
        issueDate: today,
        dueDate,
        notes,
      })
      .returning();

    const invoiceItems = await db
      .insert(invoiceItemsTable)
      .values(
        items.map((item: { description: string; quantity: number; unitPrice: number }) => ({
          invoiceId: invoice.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice.toFixed(2),
          total: (item.quantity * item.unitPrice).toFixed(2),
        }))
      )
      .returning();

    const [enriched] = await enrichInvoices([invoice]);
    res.status(201).json({ ...enriched, items: invoiceItems.map((i) => ({ ...i, unitPrice: parseFloat(i.unitPrice), total: parseFloat(i.total) })) });
  } catch (err) {
    req.log.error({ err }, "Failed to create invoice");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/invoices/:invoiceId", async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const [invoice] = await db
      .select()
      .from(invoicesTable)
      .where(and(eq(invoicesTable.id, invoiceId), isNull(invoicesTable.deletedAt)));

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    const [enriched] = await enrichInvoices([invoice]);
    res.json(enriched);
  } catch (err) {
    req.log.error({ err }, "Failed to get invoice");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/invoices/:invoiceId", async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { status, paymentMethod, paidAt, notes } = req.body;

    const updateData: Record<string, any> = {};
    if (status) updateData.status = status;
    if (paymentMethod) updateData.paymentMethod = paymentMethod;
    if (paidAt) updateData.paidAt = new Date(paidAt);
    if (notes !== undefined) updateData.notes = notes;
    if (status === "paid" && !paidAt) updateData.paidAt = new Date();

    const [invoice] = await db
      .update(invoicesTable)
      .set(updateData)
      .where(eq(invoicesTable.id, invoiceId))
      .returning();

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    const [enriched] = await enrichInvoices([invoice]);
    res.json(enriched);
  } catch (err) {
    req.log.error({ err }, "Failed to update invoice");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
