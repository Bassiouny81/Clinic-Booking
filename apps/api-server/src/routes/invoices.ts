import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { invoicesTable, invoiceItemsTable, patientsTable } from "@workspace/db/schema";
import { eq, and, isNull, sql, inArray } from "drizzle-orm";
import { requireAuth } from "../middlewares/roleMiddleware";

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

router.get("/invoices", requireAuth, async (req, res) => {
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

router.post("/invoices", requireAuth, async (req, res) => {
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

router.get("/invoices/:invoiceId/print", async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const [invoice] = await db
      .select()
      .from(invoicesTable)
      .where(and(eq(invoicesTable.id, invoiceId), isNull(invoicesTable.deletedAt)));

    if (!invoice) return res.status(404).send("<h1>الفاتورة غير موجودة</h1>");

    const [items, patientArr] = await Promise.all([
      db.select().from(invoiceItemsTable).where(eq(invoiceItemsTable.invoiceId, invoice.id)),
      invoice.patientId ? db.select().from(patientsTable).where(eq(patientsTable.id, invoice.patientId)) : Promise.resolve([]),
    ]);
    const patient = patientArr[0] || null;

    const clinicName = process.env.CLINIC_NAME || "عيادة التغذية";
    const clinicVatNumber = process.env.CLINIC_VAT_NUMBER || "300000000000003";
    const clinicCrNumber = process.env.CLINIC_CR_NUMBER || "1010000000";
    const vatRatePct = Math.round(parseFloat(invoice.vatRate) * 100);

    const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>فاتورة ${invoice.invoiceNumber}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Cairo', Arial, sans-serif; direction: rtl; background: #f5f5f5; padding: 20px; color: #1a1a1a; }
  .page { max-width: 800px; margin: 0 auto; background: white; padding: 48px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 3px solid #0d9488; padding-bottom: 24px; }
  .clinic-name { font-size: 28px; font-weight: 900; color: #0d9488; }
  .clinic-info { font-size: 13px; color: #666; margin-top: 6px; line-height: 1.8; }
  .invoice-title { text-align: left; }
  .invoice-title h2 { font-size: 22px; font-weight: 700; color: #1a1a1a; }
  .invoice-number { font-size: 15px; color: #0d9488; font-weight: 600; margin-top: 6px; }
  .invoice-date { font-size: 13px; color: #666; margin-top: 4px; }
  .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 32px; }
  .party-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; }
  .party-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 8px; font-weight: 600; }
  .party-name { font-size: 16px; font-weight: 700; }
  .party-sub { font-size: 13px; color: #64748b; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; margin: 24px 0; }
  thead tr { background: #0d9488; color: white; }
  th { padding: 12px 16px; font-size: 13px; font-weight: 600; text-align: right; }
  td { padding: 12px 16px; font-size: 14px; border-bottom: 1px solid #f1f5f9; }
  tbody tr:hover { background: #f8fafc; }
  .totals { margin-top: 8px; }
  .total-row { display: flex; justify-content: space-between; padding: 8px 16px; font-size: 14px; }
  .total-row.subtotal { color: #64748b; }
  .total-row.vat { color: #64748b; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; }
  .total-row.grand-total { background: #0d9488; color: white; border-radius: 8px; font-size: 18px; font-weight: 700; margin-top: 8px; padding: 14px 16px; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; background: #dcfce7; color: #166534; }
  .zatca-section { margin-top: 40px; padding-top: 20px; border-top: 2px dashed #e2e8f0; display: flex; justify-content: space-between; align-items: flex-start; }
  .zatca-text { font-size: 11px; color: #94a3b8; line-height: 1.8; max-width: 500px; }
  .zatca-logo { font-size: 11px; color: #0d9488; font-weight: 700; text-align: left; }
  .print-btn { position: fixed; bottom: 24px; left: 24px; background: #0d9488; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-family: 'Cairo', sans-serif; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(13,148,136,0.4); }
  @media print { .print-btn { display: none; } body { background: white; padding: 0; } .page { box-shadow: none; } }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div>
      <div class="clinic-name">🌿 ${clinicName}</div>
      <div class="clinic-info">
        رقم السجل التجاري: ${clinicCrNumber}<br>
        رقم ضريبة القيمة المضافة: ${clinicVatNumber}<br>
        المملكة العربية السعودية
      </div>
    </div>
    <div class="invoice-title">
      <h2>فاتورة ضريبية مبسطة</h2>
      <div class="invoice-number">${invoice.invoiceNumber}</div>
      <div class="invoice-date">تاريخ الإصدار: ${invoice.issueDate}</div>
      <div style="margin-top:8px"><span class="badge">${invoice.status === "paid" ? "✓ مدفوعة" : "معلقة"}</span></div>
    </div>
  </div>

  <div class="parties">
    <div class="party-box">
      <div class="party-label">المورد</div>
      <div class="party-name">${clinicName}</div>
      <div class="party-sub">رقم ضريبة القيمة المضافة: ${clinicVatNumber}</div>
    </div>
    <div class="party-box">
      <div class="party-label">العميل</div>
      <div class="party-name">${patient?.nameAr || "—"}</div>
      <div class="party-sub" dir="ltr">${patient?.phone || ""}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>الوصف</th>
        <th>الكمية</th>
        <th>سعر الوحدة</th>
        <th>الإجمالي</th>
      </tr>
    </thead>
    <tbody>
      ${items.map((item, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${item.description}</td>
        <td style="text-align:center">${item.quantity}</td>
        <td dir="ltr">${parseFloat(item.unitPrice).toFixed(2)} ر.س</td>
        <td dir="ltr">${parseFloat(item.total).toFixed(2)} ر.س</td>
      </tr>`).join("")}
    </tbody>
  </table>

  <div class="totals">
    <div class="total-row subtotal">
      <span>المبلغ قبل الضريبة</span>
      <span dir="ltr">${parseFloat(invoice.subtotal).toFixed(2)} ر.س</span>
    </div>
    <div class="total-row vat">
      <span>ضريبة القيمة المضافة (${vatRatePct}%)</span>
      <span dir="ltr">${parseFloat(invoice.vatAmount).toFixed(2)} ر.س</span>
    </div>
    <div class="total-row grand-total">
      <span>الإجمالي شامل الضريبة</span>
      <span dir="ltr">${parseFloat(invoice.total).toFixed(2)} ر.س</span>
    </div>
  </div>

  <div class="zatca-section">
    <div class="zatca-text">
      هذه فاتورة ضريبية مبسطة متوافقة مع متطلبات هيئة الزكاة والضريبة والجمارك (ZATCA) المرحلة الأولى من نظام الفوترة الإلكترونية.<br>
      تاريخ الطباعة: ${new Date().toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })}
    </div>
    <div class="zatca-logo">ZATCA<br>متوافق</div>
  </div>
</div>
<button class="print-btn" onclick="window.print()">🖨️ طباعة الفاتورة</button>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.send(html);
  } catch (err) {
    req.log.error({ err }, "Failed to generate invoice print");
    res.status(500).send("<h1>خطأ في النظام</h1>");
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
