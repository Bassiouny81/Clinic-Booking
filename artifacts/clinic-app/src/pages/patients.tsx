import { useState } from "react";
import { useListPatients } from "@workspace/api-client-react";
import { useCreatePatient } from "@/hooks/use-clinic";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus, Search, Phone, Mail, Activity, FileText } from "lucide-react";
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

export default function Patients() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data: patientsRes, isLoading } = useListPatients({ search });
  
  const createMutation = useCreatePatient();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof createPatientSchema>>({
    resolver: zodResolver(createPatientSchema),
    defaultValues: { gender: "male" }
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
        }
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-3">
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
                  <div key={patient.id} className="bg-card border border-border/50 rounded-2xl p-5 hover:border-primary/50 hover:shadow-md transition-all group">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-secondary flex items-center justify-center text-primary font-bold text-xl shadow-inner">
                        {patient.nameAr.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {patient.nameAr}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5" dir="ltr">
                          {patient.phone} <Phone className="w-3.5 h-3.5" />
                        </p>
                        {patient.email && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5 line-clamp-1">
                            <Mail className="w-3.5 h-3.5" /> {patient.email}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5 hover:text-primary cursor-pointer transition-colors">
                        <Activity className="w-4 h-4" /> السجل
                      </span>
                      <span className="flex items-center gap-1.5 hover:text-primary cursor-pointer transition-colors">
                        <FileText className="w-4 h-4" /> الملفات
                      </span>
                      <span className="text-xs">
                        {format(new Date(patient.createdAt), 'yyyy/MM/dd')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
