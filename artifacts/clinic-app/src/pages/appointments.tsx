import { useState } from "react";
import { useListAppointments, useListPatients } from "@workspace/api-client-react";
import { useCreateAppointment, useUpdateAppointment, useCancelAppointment, translateMode, translateStatus } from "@/hooks/use-clinic";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CalendarDays, Plus, Search, Video, MapPin, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const createSchema = z.object({
  patientId: z.string().min(1, "الرجاء اختيار المريض"),
  scheduledAt: z.string().min(1, "الرجاء اختيار التاريخ والوقت"),
  mode: z.enum(["in_person", "online"]),
  notes: z.string().optional(),
});

export default function Appointments() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data: appointmentsRes, isLoading } = useListAppointments();
  const { data: patientsRes } = useListPatients();
  
  const createMutation = useCreateAppointment();
  const updateMutation = useUpdateAppointment();
  const cancelMutation = useCancelAppointment();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof createSchema>>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      mode: "in_person",
    }
  });

  const onSubmit = (data: z.infer<typeof createSchema>) => {
    // Format date properly for API
    const date = new Date(data.scheduledAt).toISOString();
    
    createMutation.mutate(
      { data: { ...data, scheduledAt: date, durationMinutes: 60 } },
      {
        onSuccess: () => {
          setIsCreateOpen(false);
          form.reset();
          toast({ title: "تم الحجز", description: "تم حجز الموعد بنجاح" });
        },
        onError: () => {
          toast({ title: "خطأ", description: "حدث خطأ أثناء الحجز", variant: "destructive" });
        }
      }
    );
  };

  const handleStatusChange = (id: string, newStatus: "confirmed" | "completed" | "cancelled") => {
    if (newStatus === "cancelled") {
      cancelMutation.mutate({ appointmentId: id }, {
        onSuccess: () => toast({ title: "تم الإلغاء", description: "تم إلغاء الموعد" })
      });
    } else {
      updateMutation.mutate({
        appointmentId: id,
        data: { status: newStatus }
      }, {
        onSuccess: () => toast({ title: "تم التحديث", description: "تم تحديث حالة الموعد" })
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">المواعيد</h1>
          <p className="text-muted-foreground mt-1">إدارة حجوزات العيادة والجلسات عن بعد</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20">
              <Plus className="w-5 h-5 me-2" />
              حجز موعد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] rounded-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display text-primary">حجز موعد جديد</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="patientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المريض</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="اختر المريض..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {patientsRes?.patients?.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.nameAr}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="scheduledAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>التاريخ والوقت</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" className="rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="mode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>نوع الحضور</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="in_person">حضوري</SelectItem>
                            <SelectItem value="online">عبر الإنترنت</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ملاحظات (اختياري)</FormLabel>
                      <FormControl>
                        <Input placeholder="أي ملاحظات إضافية..." className="rounded-xl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full rounded-xl mt-4" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "جاري الحجز..." : "تأكيد الحجز"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border border-border/50 shadow-md rounded-2xl">
        <div className="p-4 border-b border-border/50 flex gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="بحث عن مريض..." className="ps-9 rounded-xl bg-muted/50 border-transparent focus:border-primary focus:bg-background transition-all" />
          </div>
        </div>

        <div className="divide-y divide-border/50">
          {isLoading ? (
            <div className="p-8 text-center">جاري التحميل...</div>
          ) : appointmentsRes?.appointments?.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <CalendarDays className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-bold text-foreground">لا توجد مواعيد</h3>
              <p className="text-muted-foreground">قم بحجز موعد جديد للبدء</p>
            </div>
          ) : (
            appointmentsRes?.appointments?.map((appt) => (
              <div key={appt.id} className="p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-muted/30 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${appt.mode === 'online' ? 'bg-blue-100 text-blue-600' : 'bg-primary/10 text-primary'}`}>
                    {appt.mode === 'online' ? <Video className="w-6 h-6" /> : <MapPin className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground">{appt.patient?.nameAr}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-4 h-4" />
                        {format(new Date(appt.scheduledAt), 'yyyy/MM/dd')}
                      </span>
                      <span>•</span>
                      <span className="font-medium text-foreground">
                        {format(new Date(appt.scheduledAt), 'hh:mm a')}
                      </span>
                      <span>•</span>
                      <Badge variant="outline" className="rounded-full bg-background">
                        {translateMode(appt.mode)}
                      </Badge>
                    </div>
                    {appt.notes && <p className="text-sm mt-2 text-muted-foreground">{appt.notes}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-3 md:ms-auto">
                  <Badge 
                    className={`rounded-full px-3 py-1 ${
                      appt.status === 'scheduled' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' :
                      appt.status === 'confirmed' ? 'bg-primary/20 text-primary hover:bg-primary/30' :
                      appt.status === 'completed' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                      'bg-destructive/10 text-destructive hover:bg-destructive/20'
                    }`}
                    variant="secondary"
                  >
                    {translateStatus(appt.status)}
                  </Badge>

                  {appt.status === 'scheduled' && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="rounded-xl border-primary text-primary hover:bg-primary/10"
                      onClick={() => handleStatusChange(appt.id, "confirmed")}
                    >
                      تأكيد
                    </Button>
                  )}
                  {appt.status === 'confirmed' && (
                    <Button 
                      size="sm" 
                      className="rounded-xl bg-green-500 hover:bg-green-600 text-white"
                      onClick={() => handleStatusChange(appt.id, "completed")}
                    >
                      <CheckCircle2 className="w-4 h-4 me-1" />
                      إكمال
                    </Button>
                  )}
                  {(appt.status === 'scheduled' || appt.status === 'confirmed') && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="rounded-xl text-destructive hover:bg-destructive/10"
                      onClick={() => handleStatusChange(appt.id, "cancelled")}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
