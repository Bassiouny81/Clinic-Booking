import { useState } from "react";
import { PAYMENTS_ENABLED } from "../config";
import { useListInvoices, useListPatients } from "@workspace/api-client-react";
import { useCreateInvoice, formatSAR, translatePaymentMethod, translateStatus } from "@/hooks/use-clinic";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Receipt, Plus, Search, FileText, Printer, CheckCircle2, ExternalLink } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const createInvoiceSchema = z.object({
  patientId: z.string().min(1, "الرجاء اختيار المريض"),
  paymentMethod: z.enum(["mada", "apple_pay", "stc_pay", "cash", "bank_transfer"]),
  items: z
    .array(
      z.object({
        description: z.string().min(2, "الوصف مطلوب"),
        quantity: z.coerce.number().min(1),
        unitPrice: z.coerce.number().min(1),
      })
    )
    .min(1, "يجب إضافة بند واحد على الأقل"),
});

export default function Invoices() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data: invoicesRes, isLoading } = useListInvoices();
  const { data: patientsRes } = useListPatients();

  const createMutation = useCreateInvoice();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof createInvoiceSchema>>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      paymentMethod: "mada",
      items: [{ description: "استشارة تغذية", quantity: 1, unitPrice: 200 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchItems = form.watch("items");
  const subtotal = watchItems.reduce(
    (acc, item) => acc + Number(item.quantity) * Number(item.unitPrice),
    0
  );
  const vatAmount = subtotal * 0.15;
  const total = subtotal + vatAmount;

  const onSubmit = (data: z.infer<typeof createInvoiceSchema>) => {
    createMutation.mutate(
      { data: { ...data, vatRate: 0.15 } },
      {
        onSuccess: () => {
          setIsCreateOpen(false);
          form.reset();
          toast({ title: "تم إنشاء الفاتورة", description: "تم حفظ الفاتورة بنجاح وتطبيق الضريبة" });
        },
        onError: () => {
          toast({ title: "خطأ", description: "حدث خطأ أثناء إنشاء الفاتورة", variant: "destructive" });
        },
      }
    );
  };

  function openInvoicePrint(invoiceId: string) {
    window.open(`/api/invoices/${invoiceId}/print`, "_blank");
  }

  const payWithMoyasar = async (invoice: any) => {
    try {
      const res = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(invoice.total),
          description: `فاتورة ${invoice.invoiceNumber} - ${invoice.patient?.nameAr}`,
          callbackUrl: `${window.location.origin}/api/payments/webhook`,
          patientId: invoice.patientId,
        }),
      });
      if (!res.ok) throw new Error("فشل الاتصال ببوابة الدفع");
      const { paymentUrl } = await res.json();
      window.location.href = paymentUrl;
    } catch {
      toast({ title: "خطأ", description: "تعذر فتح بوابة الدفع", variant: "destructive" });
    }
  };

  const paidCount = invoicesRes?.invoices?.filter((i) => i.status === "paid").length ?? 0;
  const pendingCount = invoicesRes?.invoices?.filter((i) => i.status !== "paid").length ?? 0;
  const totalRevenue = invoicesRes?.invoices
    ?.filter((i) => i.status === "paid")
    .reduce((acc, i) => acc + parseFloat(i.total || "0"), 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">المالية والفواتير</h1>
          <p className="text-muted-foreground mt-1">إدارة الفواتير والمدفوعات (متوافق مع هيئة الزكاة - ZATCA)</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20">
              <Plus className="w-5 h-5 me-2" />
              إنشاء فاتورة
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] rounded-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display text-primary flex items-center gap-2">
                <Receipt className="w-6 h-6" /> إنشاء فاتورة ضريبية
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="patientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>العميل / المريض</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-xl">
                              <SelectValue placeholder="اختر المريض..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {patientsRes?.patients?.map((p) => (
                              <SelectItem key={p.id} value={p.id}>{p.nameAr}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>طريقة الدفع</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="mada">💳 مدى (Mada)</SelectItem>
                            <SelectItem value="apple_pay">🍎 Apple Pay</SelectItem>
                            <SelectItem value="stc_pay">📱 STC Pay</SelectItem>
                            <SelectItem value="cash">💵 نقدي</SelectItem>
                            <SelectItem value="bank_transfer">🏦 تحويل بنكي</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-3 bg-muted/30 p-4 rounded-xl border border-border/50">
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-base font-bold">عناصر الفاتورة</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append({ description: "", quantity: 1, unitPrice: 0 })}
                      className="rounded-xl h-8 text-xs"
                    >
                      + إضافة عنصر
                    </Button>
                  </div>

                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-start gap-2 bg-background p-2 rounded-lg border border-border/50">
                      <FormField
                        control={form.control}
                        name={`items.${index}.description`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input placeholder="وصف الخدمة..." className="h-9" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem className="w-20">
                            <FormControl>
                              <Input type="number" min="1" className="h-9 text-center" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.unitPrice`}
                        render={({ field }) => (
                          <FormItem className="w-24">
                            <FormControl>
                              <Input type="number" min="0" className="h-9 text-center" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-destructive shrink-0"
                          onClick={() => remove(index)}
                        >
                          &times;
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="bg-primary/5 rounded-xl p-4 space-y-2 border border-primary/10">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>المجموع الفرعي:</span>
                    <span>{formatSAR(subtotal || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground border-b border-border/50 pb-2">
                    <span>ضريبة القيمة المضافة (15%):</span>
                    <span>{formatSAR(vatAmount || 0)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg text-primary pt-1">
                    <span>الإجمالي:</span>
                    <span>{formatSAR(total || 0)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-xl"
                  size="lg"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "جاري الإصدار..." : "إصدار الفاتورة"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{paidCount}</div>
          <div className="text-sm text-muted-foreground mt-1">مدفوعة</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
          <div className="text-sm text-muted-foreground mt-1">معلقة</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-primary">{formatSAR(totalRevenue)}</div>
          <div className="text-sm text-muted-foreground mt-1">إجمالي الإيرادات</div>
        </Card>
      </div>

      <Card className="border border-border/50 shadow-md rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border/50">
              <tr>
                <th className="px-6 py-4 font-bold">رقم الفاتورة</th>
                <th className="px-6 py-4 font-bold">العميل</th>
                <th className="px-6 py-4 font-bold">التاريخ</th>
                <th className="px-6 py-4 font-bold">المبلغ الإجمالي</th>
                <th className="px-6 py-4 font-bold">طريقة الدفع</th>
                <th className="px-6 py-4 font-bold">الحالة</th>
                <th className="px-6 py-4 font-bold">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 bg-card">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                    جاري التحميل...
                  </td>
                </tr>
              ) : invoicesRes?.invoices?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Receipt className="w-12 h-12 text-muted-foreground/30 mb-4 mx-auto" />
                    <h3 className="text-lg font-bold text-foreground">لا توجد فواتير</h3>
                    <p className="text-muted-foreground text-sm mt-1">أنشئ أول فاتورة للبدء</p>
                  </td>
                </tr>
              ) : (
                invoicesRes?.invoices?.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-primary">
                      {invoice.invoiceNumber || `#INV-${invoice.id.substring(0, 6)}`}
                    </td>
                    <td className="px-6 py-4 font-bold text-foreground">{invoice.patient?.nameAr}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {format(new Date(invoice.createdAt), "yyyy/MM/dd")}
                    </td>
                    <td className="px-6 py-4 font-bold text-primary" dir="ltr">
                      {formatSAR(invoice.total)}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {translatePaymentMethod(invoice.paymentMethod)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="secondary"
                        className={`rounded-full ${
                          invoice.status === "paid"
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {invoice.status === "paid" && <CheckCircle2 className="w-3 h-3 me-1" />}
                        {translateStatus(invoice.status)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-primary hover:bg-primary/10"
                          title="طباعة / عرض الفاتورة الضريبية"
                          onClick={() => openInvoicePrint(invoice.id)}
                        >
                          <Printer className="w-4 h-4" />
                        </Button>
                        {PAYMENTS_ENABLED && invoice.status !== "paid" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-emerald-600 hover:bg-emerald-50"
                            title="دفع إلكتروني"
                            onClick={() => payWithMoyasar(invoice)}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          title="عرض تفاصيل الفاتورة"
                          onClick={() => openInvoicePrint(invoice.id)}
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
