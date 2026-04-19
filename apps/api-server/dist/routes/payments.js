import { Router } from "express";
import { db } from "@workspace/db";
import { invoicesTable, invoiceItemsTable, patientsTable, appointmentsTable } from "@workspace/db/schema";
import { eq, and, isNull } from "drizzle-orm";
const router = Router();
const MOYASAR_SECRET_KEY = process.env.MOYASAR_SECRET_KEY;
const VAT_RATE = 0.15;
router.post("/payments/initiate", async (req, res) => {
    try {
        const { appointmentId, amount, description, callbackUrl, patientId } = req.body;
        if (!amount || !callbackUrl) {
            return res.status(400).json({ error: "amount and callbackUrl are required" });
        }
        if (!MOYASAR_SECRET_KEY) {
            return res.status(500).json({ error: "Payment gateway not configured" });
        }
        const amountHalala = Math.round(amount * 100);
        const moyasarPayload = {
            amount: amountHalala,
            currency: "SAR",
            description: description || "Clinic appointment payment",
            callback_url: callbackUrl,
            source: {
                type: "creditcard",
            },
            metadata: {
                appointment_id: appointmentId || null,
                patient_id: patientId || null,
            },
        };
        const response = await fetch("https://api.moyasar.com/v1/payments", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${Buffer.from(`${MOYASAR_SECRET_KEY}:`).toString("base64")}`,
            },
            body: JSON.stringify(moyasarPayload),
        });
        if (!response.ok) {
            const errText = await response.text();
            req.log.error({ status: response.status, body: errText }, "Moyasar error");
            return res.status(502).json({ error: "Payment gateway error" });
        }
        const payment = await response.json();
        res.json({
            paymentUrl: payment.url,
            paymentId: payment.id,
        });
    }
    catch (err) {
        req.log.error({ err }, "Failed to initiate payment");
        res.status(500).json({ error: "Internal server error" });
    }
});
router.post("/payments/webhook", async (req, res) => {
    try {
        const { id, status, amount, metadata } = req.body;
        if (status === "paid" && metadata?.appointment_id) {
            await db
                .update(appointmentsTable)
                .set({ status: "confirmed" })
                .where(eq(appointmentsTable.id, metadata.appointment_id));
        }
        req.log.info({ moyasarId: id, status }, "Moyasar webhook received");
        res.json({ received: true });
    }
    catch (err) {
        req.log.error({ err }, "Webhook processing failed");
        res.status(500).json({ error: "Internal server error" });
    }
});
router.get("/payments/:paymentId/invoice", async (req, res) => {
    try {
        const { paymentId } = req.params;
        const [invoice] = await db
            .select()
            .from(invoicesTable)
            .where(and(eq(invoicesTable.id, paymentId), isNull(invoicesTable.deletedAt)));
        if (!invoice) {
            return res.status(404).json({ error: "Invoice not found" });
        }
        const items = await db
            .select()
            .from(invoiceItemsTable)
            .where(eq(invoiceItemsTable.invoiceId, invoice.id));
        let [patient] = invoice.patientId
            ? await db.select().from(patientsTable).where(eq(patientsTable.id, invoice.patientId))
            : [null];
        const clinicName = process.env.CLINIC_NAME || "عيادة التغذية";
        const clinicVatNumber = process.env.CLINIC_VAT_NUMBER || "300000000000003";
        const clinicCrNumber = process.env.CLINIC_CR_NUMBER || "1010000000";
        const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<title>فاتورة ${invoice.invoiceNumber}</title>
<style>
  body { font-family: Arial, sans-serif; padding: 40px; direction: rtl; }
  .header { text-align: center; margin-bottom: 30px; }
  .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  th, td { padding: 10px; border: 1px solid #ddd; text-align: right; }
  th { background: #f5f5f5; }
  .total-row { font-weight: bold; background: #f9f9f9; }
  .zatca-note { font-size: 11px; color: #666; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px; }
</style>
</head>
<body>
<div class="header">
  <h2>${clinicName}</h2>
  <p>رقم السجل التجاري: ${clinicCrNumber} | رقم ضريبة القيمة المضافة: ${clinicVatNumber}</p>
  <h3>فاتورة ضريبية مبسطة</h3>
  <p>رقم الفاتورة: ${invoice.invoiceNumber}</p>
</div>
<div class="info-row">
  <span>اسم العميل: ${patient?.nameAr || "—"}</span>
  <span>تاريخ الفاتورة: ${invoice.issueDate}</span>
</div>
<table>
  <thead>
    <tr><th>الوصف</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr>
  </thead>
  <tbody>
    ${items.map((item) => `<tr><td>${item.description}</td><td>${item.quantity}</td><td>${parseFloat(item.unitPrice).toFixed(2)} ر.س</td><td>${parseFloat(item.total).toFixed(2)} ر.س</td></tr>`).join("")}
  </tbody>
</table>
<div class="info-row"><span>المبلغ قبل الضريبة:</span><span>${parseFloat(invoice.subtotal).toFixed(2)} ر.س</span></div>
<div class="info-row"><span>ضريبة القيمة المضافة (${Math.round(parseFloat(invoice.vatRate) * 100)}%):</span><span>${parseFloat(invoice.vatAmount).toFixed(2)} ر.س</span></div>
<div class="info-row total-row"><span>الإجمالي شامل الضريبة:</span><span>${parseFloat(invoice.total).toFixed(2)} ر.س</span></div>
<div class="zatca-note">
  <p>هذه فاتورة ضريبية متوافقة مع متطلبات هيئة الزكاة والضريبة والجمارك (زاتكا) - المرحلة الأولى.</p>
  <p>تاريخ الطباعة: ${new Date().toLocaleDateString("ar-SA")}</p>
</div>
</body>
</html>`;
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.send(html);
    }
    catch (err) {
        req.log.error({ err }, "Failed to get invoice");
        res.status(500).json({ error: "Internal server error" });
    }
});
export default router;
