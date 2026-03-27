import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Calendar, User, CreditCard, Loader2 } from "lucide-react";

const MOYASAR_KEY = import.meta.env.VITE_MOYASAR_PUBLISHABLE_KEY;

const bookingSchema = z.object({
  patientName: z.string().min(2, "الاسم مطلوب"),
  patientPhone: z.string().min(9, "رقم الجوال مطلوب"),
  patientEmail: z.string().email("البريد الإلكتروني غير صحيح").optional().or(z.literal("")),
  mode: z.enum(["in_person", "online"]),
  scheduledAt: z.string().min(1, "التاريخ والوقت مطلوبان"),
  serviceId: z.string().optional(),
  notes: z.string().optional(),
});

type BookingForm = z.infer<typeof bookingSchema>;

type Step = 1 | 2 | 3 | 4;

export default function BookingPage() {
  const [step, setStep] = useState<Step>(1);
  const [bookedAppointment, setBookedAppointment] = useState<any>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const { toast } = useToast();

  const { data: services } = useQuery({
    queryKey: ["services"],
    queryFn: () => fetch("/api/services").then((r) => r.json()),
  });

  const { data: appointmentTypes } = useQuery({
    queryKey: ["appointment-types"],
    queryFn: () => fetch("/api/appointment-types").then((r) => r.json()),
  });

  const form = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { mode: "in_person" },
  });

  const watchedMode = form.watch("mode");
  const watchedService = form.watch("serviceId");

  const selectedService = services?.find((s: any) => s.id === watchedService);
  const servicePriceWithVat = selectedService
    ? parseFloat(selectedService.price) * (1 + parseFloat(selectedService.vatRate))
    : 0;

  async function onSubmitStep2() {
    const valid = await form.trigger(["patientName", "patientPhone", "patientEmail", "scheduledAt", "mode"]);
    if (valid) setStep(3);
  }

  async function onBook() {
    const values = form.getValues();
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: values.patientName,
          patientPhone: values.patientPhone,
          patientEmail: values.patientEmail,
          serviceId: values.serviceId || undefined,
          scheduledAt: values.scheduledAt,
          mode: values.mode,
          notes: values.notes,
        }),
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setBookedAppointment(data.appointment);

      if (data.notificationSent) {
        toast({ title: "تم الإرسال", description: "تم إرسال تأكيد الموعد عبر الواتساب" });
      }

      if (selectedService) {
        setStep(4);
      } else {
        setStep(4);
      }
    } catch (err) {
      toast({ title: "خطأ", description: "فشل حجز الموعد، يرجى المحاولة مرة أخرى", variant: "destructive" });
    }
  }

  async function onPayWithMoyasar() {
    if (!bookedAppointment || !selectedService) return;
    setPaymentLoading(true);

    try {
      const callbackUrl = `${window.location.origin}/payment-success`;
      const res = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: bookedAppointment.id,
          patientId: bookedAppointment.patientId,
          amount: servicePriceWithVat,
          description: `${selectedService.nameAr} - موعد عيادة التغذية`,
          callbackUrl,
        }),
      });

      if (!res.ok) throw new Error(await res.text());
      const { paymentUrl } = await res.json();
      window.location.href = paymentUrl;
    } catch (err) {
      toast({ title: "خطأ في الدفع", description: "تعذر فتح بوابة الدفع، يرجى المحاولة لاحقاً", variant: "destructive" });
    } finally {
      setPaymentLoading(false);
    }
  }

  const steps = [
    { num: 1, label: "نوع الموعد", icon: Calendar },
    { num: 2, label: "البيانات والوقت", icon: User },
    { num: 3, label: "التأكيد والدفع", icon: CreditCard },
  ];

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-2">احجز موعدك</h1>
      <p className="text-muted-foreground text-center mb-8">عيادة التغذية - خدمة متكاملة لصحتك</p>

      {step < 4 && (
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold transition-colors ${
                step >= s.num ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {step > s.num ? <CheckCircle className="w-5 h-5" /> : s.num}
              </div>
              <span className={`text-sm hidden sm:block ${step >= s.num ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                {s.label}
              </span>
              {i < steps.length - 1 && <div className={`w-8 h-0.5 ${step > s.num ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>
      )}

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>اختر نوع الموعد</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base font-semibold mb-3 block">طريقة الاستشارة</Label>
              <RadioGroup
                value={watchedMode}
                onValueChange={(v) => form.setValue("mode", v as "in_person" | "online")}
                className="grid grid-cols-2 gap-4"
              >
                <Label htmlFor="in_person" className={`flex flex-col items-center gap-3 p-5 border-2 rounded-xl cursor-pointer transition-colors ${watchedMode === "in_person" ? "border-primary bg-primary/5" : "border-muted"}`}>
                  <RadioGroupItem value="in_person" id="in_person" className="sr-only" />
                  <span className="text-3xl">🏥</span>
                  <div className="text-center">
                    <div className="font-semibold">حضوري في العيادة</div>
                    <div className="text-xs text-muted-foreground mt-1">زيارة شخصية</div>
                  </div>
                </Label>
                <Label htmlFor="online" className={`flex flex-col items-center gap-3 p-5 border-2 rounded-xl cursor-pointer transition-colors ${watchedMode === "online" ? "border-primary bg-primary/5" : "border-muted"}`}>
                  <RadioGroupItem value="online" id="online" className="sr-only" />
                  <span className="text-3xl">💻</span>
                  <div className="text-center">
                    <div className="font-semibold">أونلاين عبر فيديو</div>
                    <div className="text-xs text-muted-foreground mt-1">من أي مكان</div>
                  </div>
                </Label>
              </RadioGroup>
            </div>

            {services && services.length > 0 && (
              <div>
                <Label className="text-base font-semibold mb-3 block">اختر الخدمة</Label>
                <RadioGroup
                  value={watchedService}
                  onValueChange={(v) => form.setValue("serviceId", v)}
                  className="space-y-3"
                >
                  {services.map((service: any) => (
                    <Label key={service.id} htmlFor={`service-${service.id}`} className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-colors ${watchedService === service.id ? "border-primary bg-primary/5" : "border-muted"}`}>
                      <RadioGroupItem value={service.id} id={`service-${service.id}`} className="sr-only" />
                      <div>
                        <div className="font-semibold">{service.nameAr}</div>
                        {service.description && <div className="text-sm text-muted-foreground">{service.description}</div>}
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-primary">{parseFloat(service.price).toFixed(0)} ر.س</div>
                        <div className="text-xs text-muted-foreground">+ ضريبة 15%</div>
                      </div>
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            )}

            <Button className="w-full" size="lg" onClick={() => setStep(2)}>
              التالي ← اختيار الموعد
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>بياناتك وموعدك</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="patientName">الاسم الكامل *</Label>
              <Input id="patientName" placeholder="أدخل اسمك" {...form.register("patientName")} />
              {form.formState.errors.patientName && (
                <p className="text-destructive text-sm">{form.formState.errors.patientName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="patientPhone">رقم الجوال *</Label>
              <Input id="patientPhone" placeholder="05xxxxxxxx" dir="ltr" {...form.register("patientPhone")} />
              {form.formState.errors.patientPhone && (
                <p className="text-destructive text-sm">{form.formState.errors.patientPhone.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="patientEmail">البريد الإلكتروني (اختياري)</Label>
              <Input id="patientEmail" type="email" placeholder="example@email.com" dir="ltr" {...form.register("patientEmail")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduledAt">التاريخ والوقت *</Label>
              <Input id="scheduledAt" type="datetime-local" {...form.register("scheduledAt")} />
              {form.formState.errors.scheduledAt && (
                <p className="text-destructive text-sm">{form.formState.errors.scheduledAt.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">ملاحظات (اختياري)</Label>
              <Input id="notes" placeholder="أي معلومات إضافية..." {...form.register("notes")} />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>← رجوع</Button>
              <Button className="flex-1" onClick={onSubmitStep2}>التالي ← التأكيد</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>تأكيد الموعد والدفع</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="bg-muted/50 rounded-xl p-5 space-y-3">
              <h3 className="font-semibold text-lg">ملخص الحجز</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">الاسم</span><span className="font-medium">{form.getValues("patientName")}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">الجوال</span><span className="font-medium" dir="ltr">{form.getValues("patientPhone")}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">نوع الموعد</span><span className="font-medium">{form.getValues("mode") === "online" ? "أونلاين 💻" : "حضوري 🏥"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">التاريخ والوقت</span><span className="font-medium">{new Date(form.getValues("scheduledAt")).toLocaleString("ar-SA")}</span></div>
                {selectedService && (
                  <>
                    <div className="flex justify-between"><span className="text-muted-foreground">الخدمة</span><span className="font-medium">{selectedService.nameAr}</span></div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between text-muted-foreground"><span>السعر قبل الضريبة</span><span>{parseFloat(selectedService.price).toFixed(2)} ر.س</span></div>
                      <div className="flex justify-between text-muted-foreground"><span>ضريبة القيمة المضافة 15%</span><span>{(parseFloat(selectedService.price) * parseFloat(selectedService.vatRate)).toFixed(2)} ر.س</span></div>
                      <div className="flex justify-between font-bold text-primary text-base mt-1"><span>الإجمالي</span><span>{servicePriceWithVat.toFixed(2)} ر.س</span></div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-start gap-3">
              <span className="text-xl">📱</span>
              <p className="text-sm text-green-800 dark:text-green-200">سيصلك تأكيد الموعد عبر الواتساب على الرقم المدخل</p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>← رجوع</Button>
              <Button className="flex-1" onClick={onBook}>
                {selectedService ? "تأكيد والانتقال للدفع" : "تأكيد الحجز مجاناً"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">تم حجز موعدك! 🎉</h2>
              <p className="text-muted-foreground">سيتواصل معك فريقنا قريباً لتأكيد الموعد</p>
            </div>

            {selectedService && bookedAppointment && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">لإتمام الحجز يرجى الدفع الآن</p>
                <div className="bg-muted/50 rounded-xl p-4 mb-4">
                  <div className="font-bold text-xl text-primary">{servicePriceWithVat.toFixed(2)} ر.س</div>
                  <div className="text-sm text-muted-foreground">شامل ضريبة القيمة المضافة 15%</div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground mb-4">
                  <div className="flex flex-col items-center gap-1"><span className="text-2xl">💳</span>مدى</div>
                  <div className="flex flex-col items-center gap-1"><span className="text-2xl">📱</span>Apple Pay</div>
                  <div className="flex flex-col items-center gap-1"><span className="text-2xl">📲</span>STC Pay</div>
                </div>
                <Button className="w-full" size="lg" onClick={onPayWithMoyasar} disabled={paymentLoading}>
                  {paymentLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />جاري التحويل...</> : "ادفع الآن عبر مدى / Apple Pay / STC Pay"}
                </Button>
              </div>
            )}

            <Button variant="outline" onClick={() => window.location.href = "/"} className="w-full">
              العودة للرئيسية
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
