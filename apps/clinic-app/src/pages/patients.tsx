import { useState } from "react";
import { useListPatients, useListAppointments } from "@workspace/api-client-react";
import { useCreatePatient, translateMode, translateStatus } from "@/hooks/use-clinic";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Search, Phone, Mail, Activity, FileText, Users, CalendarDays, ChevronLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const createPatientSchema = z.object({
  nameAr: z.string().min(2, "الاسم مطلوب"),
  phone: z.string().min(10, "رقم الجوال مطلوب"),
  email: z.string().email("بريد إلكتروني غير صالح").optional().or(z.literal("")),
  gender: z.enum(["male", "female"]),
  nationalId: z.string().optional(),
});

type Patient = {
  id: string;
  nameAr: string;
  phone: string;
  email?: string | null;
  gender?: string | null;
  nationalId?: string | null;
  dateOfBirth?: string | null;
  createdAt: string;
};

function PatientDetailSheet({ patient, open, onClose }: { patient: Patient | null; open: boolean; onClose: () => void }) {
  const { data: appointmentsRes } = useListAppointments(
    { patientId: patient?.id },
    { query: { enabled: !!patient } as any }
  );

  if (!patient) return null;

  const appointments = appointmentsRes?.appointments ?? [];
  const completedCount = appointments.filter((a) => a.status === "completed").length;
  const upcomingCount = appointments.filter((a) => ["scheduled", "confirmed"].includes(a.status)).length;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto" dir="rtl">
        <SheetHeader className="pb-6 border-b">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
              {patient.nameAr.charAt(0)}
            </div>
            <div>
              <SheetTitle className="text-xl">{patient.nameAr}</SheetTitle>
              <p className="text-sm text-muted-foreground mt-1" dir="ltr">{patient.phone}</p>
              {patient.email && <p className="text-xs text-muted-foreground">{patient.email}</p>}
            </div>
          </div>
        </SheetHeader>

        <div className="py-4">
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="text-center p-3 bg-muted/50 rounded-xl">
              <div className="text-2xl font-bold text-primary">{appointments.length}</div>
              <div className="text-xs text-muted-foreground mt-1">إجمالي المواعيد</div>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <div className="text-2xl font-bold text-green-600">{completedCount}</div>
              <div className="text-xs text-muted-foreground mt-1">مكتملة</div>
            </div>
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="text-2xl font-bold text-blue-600">{upcomingCount}</div>
              <div className="text-xs text-muted-foreground mt-1">قادمة</div>
            </div>
          </div>

          <Tabs defaultValue="appointments">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="appointments" className="flex-1">المواعيد</TabsTrigger>
              <TabsTrigger value="info" className="flex-1">البيانات</TabsTrigger>
            </TabsList>

            <TabsContent value="appointments" className="space-y-3">
              {appointments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarDays className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>لا توجد مواعيد مسجلة</p>
                </div>
              ) : (
                appointments.map((appt) => (
                  <div key={appt.id} className="flex items-center justify-between p-3 rounded-xl border bg-card">
                    <div>
                      <div className="font-medium text-sm">
                        {appt.scheduledAt ? format(new Date(appt.scheduledAt), "yyyy/MM/dd - hh:mm a") : "—"}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{translateMode(appt.mode)}</div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`text-xs rounded-full ${
                        appt.status === "completed" ? "bg-green-100 text-green-800" :
                        appt.status === "confirmed" ? "bg-primary/20 text-primary" :
                        appt.status === "cancelled" ? "bg-destructive/10 text-destructive" :
                        "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {translateStatus(appt.status)}
                    </Badge>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="info" className="space-y-3">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">الاسم</span>
                  <span className="font-medium">{patient.nameAr}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">الجوال</span>
                  <span className="font-medium" dir="ltr">{patient.phone}</span>
                </div>
                {patient.email && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">البريد الإلكتروني</span>
                    <span className="font-medium" dir="ltr">{patient.email}</span>
                  </div>
                )}
                {patient.gender && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">الجنس</span>
                    <span className="font-medium">{patient.gender === "male" ? "ذكر" : "أنثى"}</span>
                  </div>
                )}
                {patient.nationalId && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">رقم الهوية</span>
                    <span className="font-medium" dir="ltr">{patient.nationalId}</span>
                  </div>
                )}
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">تاريخ التسجيل</span>
                  <span className="font-medium">{format(new Date(patient.createdAt), "yyyy/MM/dd")}</span>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(`/api/notifications?patientId=${patient.id}`, "_blank")}
                >
                  <FileText className="w-4 h-4 ml-2" />
                  عرض الإشعارات
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function Patients() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const { data: patientsRes, isLoading } = useListPatients({ search });

  const createMutation = useCreatePatient();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof createPatientSchema>>({
    resolver: zodResolver(createPatientSchema),
    defaultValues: { gender: "male" },
  });

  const onSubmit = (data: z.infer<typeof createPatientSchema>) => {
    createMutation.mutate(
      { data },
      {
        onSuccess: () => {
          setIsCreateOpen(false);
          form.reset();
          toast({ title: "تم الإضافة", description: "تمت إضافة المريض بنجاح" });
        },
        onError: () => {
          toast({ title: "خطأ", description: "حدث خطأ أثناء الإضافة", variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">المرضى</h1>
          <p className="text-muted-foreground mt-1">سجل المرضى والملفات الطبية</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20">
              <UserPlus className="w-5 h-5 me-2" />
              إضافة مريض
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] rounded-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display text-primary">إضافة مريض جديد</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="nameAr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الاسم الكامل (عربي)</FormLabel>
                      <FormControl>
                        <Input placeholder="محمد عبدالله..." className="rounded-xl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رقم الجوال</FormLabel>
                        <FormControl>
                          <Input placeholder="05xxxxxxxx" className="rounded-xl text-left" dir="ltr" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الجنس</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">ذكر</SelectItem>
                            <SelectItem value="female">أنثى</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>البريد الإلكتروني (اختياري)</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="example@email.com" className="rounded-xl text-left" dir="ltr" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nationalId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رقم الهوية / الإقامة (اختياري)</FormLabel>
                      <FormControl>
                        <Input className="rounded-xl text-left" dir="ltr" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full rounded-xl mt-4" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "جاري الإضافة..." : "حفظ بيانات المريض"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border border-border/50 shadow-md rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-border/50 bg-muted/20">
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="بحث بالاسم أو رقم الجوال..."
              className="ps-10 rounded-xl border-border/50 h-12 text-base"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 p-4 gap-4">
          {isLoading ? (
            <div className="col-span-full p-8 text-center text-muted-foreground">جاري التحميل...</div>
          ) : patientsRes?.patients?.length === 0 ? (
            <div className="col-span-full p-12 text-center flex flex-col items-center">
              <Users className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-bold text-foreground">لا يوجد مرضى</h3>
              <p className="text-muted-foreground">لم يتم العثور على أي مريض مسجل</p>
            </div>
          ) : (
            patientsRes?.patients?.map((patient) => (
              <button
                key={patient.id}
                className="text-right bg-card border border-border/50 rounded-2xl p-5 hover:border-primary/50 hover:shadow-md transition-all group cursor-pointer w-full"
                onClick={() => setSelectedPatient(patient as Patient)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-secondary flex items-center justify-center text-primary font-bold text-xl shadow-inner shrink-0">
                    {patient.nameAr.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {patient.nameAr}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5" dir="ltr">
                      {patient.phone} <Phone className="w-3.5 h-3.5" />
                    </p>
                    {patient.email && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5 truncate">
                        <Mail className="w-3.5 h-3.5 shrink-0" /> {patient.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-4 h-4" /> عرض السجل
                  </span>
                  <ChevronLeft className="w-4 h-4 group-hover:text-primary transition-colors" />
                </div>
              </button>
            ))
          )}
        </div>
      </Card>

      <PatientDetailSheet
        patient={selectedPatient}
        open={!!selectedPatient}
        onClose={() => setSelectedPatient(null)}
      />
    </div>
  );
}
