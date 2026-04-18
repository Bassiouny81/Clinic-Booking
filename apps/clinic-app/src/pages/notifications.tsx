import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, Send, CheckCircle, XCircle, Clock, MessageCircle } from "lucide-react";

const notificationTypes = [
  { value: "confirmation", label: "تأكيد الموعد" },
  { value: "reminder_24h", label: "تذكير (24 ساعة)" },
  { value: "reminder_1h", label: "تذكير (ساعة)" },
  { value: "follow_up", label: "متابعة بعد الموعد" },
  { value: "custom", label: "رسالة مخصصة" },
];

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  sent: { label: "مُرسلة", variant: "default" },
  pending: { label: "في الانتظار", variant: "secondary" },
  failed: { label: "فشلت", variant: "destructive" },
};

export default function NotificationsPage() {
  const [patientId, setPatientId] = useState("");
  const [appointmentId, setAppointmentId] = useState("");
  const [type, setType] = useState("confirmation");
  const [channel, setChannel] = useState("whatsapp");
  const [message, setMessage] = useState("");
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: patients } = useQuery({
    queryKey: ["patients-list"],
    queryFn: () => fetch("/api/patients").then((r) => r.json()).then((d) => d.patients),
  });

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => fetch("/api/notifications").then((r) => r.json()),
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          appointmentId: appointmentId || undefined,
          type,
          channel,
          message: message || undefined,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "تم الإرسال", description: "تم إرسال الإشعار بنجاح" });
      qc.invalidateQueries({ queryKey: ["notifications"] });
      setPatientId("");
      setAppointmentId("");
      setMessage("");
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل إرسال الإشعار", variant: "destructive" });
    },
  });

  const sentCount = notifications?.filter((n: any) => n.status === "sent").length ?? 0;
  const failedCount = notifications?.filter((n: any) => n.status === "failed").length ?? 0;
  const pendingCount = notifications?.filter((n: any) => n.status === "pending").length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">نظام التنبيهات</h1>
        <p className="text-muted-foreground">إرسال إشعارات الواتساب والرسائل للمرضى</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{sentCount}</div>
            <div className="text-sm text-muted-foreground">مُرسلة</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{pendingCount}</div>
            <div className="text-sm text-muted-foreground">في الانتظار</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <XCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
            <div className="text-2xl font-bold">{failedCount}</div>
            <div className="text-sm text-muted-foreground">فشلت</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            إرسال إشعار جديد
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>المريض</Label>
              <Select value={patientId} onValueChange={setPatientId}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المريض" />
                </SelectTrigger>
                <SelectContent>
                  {patients?.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>{p.nameAr} — {p.phone}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>نوع الإشعار</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {notificationTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>القناة</Label>
              <Select value={channel} onValueChange={setChannel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">واتساب</SelectItem>
                  <SelectItem value="sms">رسالة SMS</SelectItem>
                  <SelectItem value="email">بريد إلكتروني</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>رقم الموعد (اختياري)</Label>
              <Input placeholder="ID الموعد" value={appointmentId} onChange={(e) => setAppointmentId(e.target.value)} dir="ltr" />
            </div>
          </div>
          {type === "custom" && (
            <div className="space-y-2">
              <Label>نص الرسالة</Label>
              <Input placeholder="اكتب نص الرسالة هنا..." value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
          )}
          <Button
            onClick={() => sendMutation.mutate()}
            disabled={!patientId || sendMutation.isPending}
            className="w-full"
          >
            <MessageCircle className="w-4 h-4 ml-2" />
            {sendMutation.isPending ? "جاري الإرسال..." : "إرسال الإشعار"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            سجل الإشعارات
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
          ) : !notifications?.length ? (
            <div className="text-center py-8 text-muted-foreground">لا توجد إشعارات بعد</div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif: any) => {
                const status = statusConfig[notif.status] || { label: notif.status, variant: "secondary" as const };
                const typeLabel = notificationTypes.find((t) => t.value === notif.type)?.label || notif.type;
                return (
                  <div key={notif.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-sm">{typeLabel}</div>
                        <div className="text-xs text-muted-foreground">
                          {notif.channel === "whatsapp" ? "واتساب" : notif.channel} •{" "}
                          {new Date(notif.createdAt).toLocaleDateString("ar-SA")}
                        </div>
                      </div>
                    </div>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
