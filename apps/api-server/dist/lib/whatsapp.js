import twilio from "twilio";
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";
export async function sendWhatsAppNotification(toPhone, message) {
    if (!accountSid || !authToken) {
        throw new Error("Twilio credentials not configured");
    }
    const client = twilio(accountSid, authToken);
    const toWhatsApp = toPhone.startsWith("whatsapp:") ? toPhone : `whatsapp:${toPhone}`;
    const result = await client.messages.create({
        from: fromNumber,
        to: toWhatsApp,
        body: message,
    });
    return result.sid;
}
export function buildConfirmationMessage(patientName, scheduledAt, mode) {
    const dateStr = scheduledAt.toLocaleDateString("ar-SA", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    const timeStr = scheduledAt.toLocaleTimeString("ar-SA", {
        hour: "2-digit",
        minute: "2-digit",
    });
    const modeText = mode === "online" ? "عبر الإنترنت (فيديو)" : "حضوري في العيادة";
    return `مرحباً ${patientName}،\n\nتم تأكيد موعدك ✅\n\n📅 ${dateStr}\n🕐 ${timeStr}\n📍 ${modeText}\n\nعيادة التغذية 🌿`;
}
export function buildReminderMessage(patientName, scheduledAt, mode, videoLink) {
    const timeStr = scheduledAt.toLocaleTimeString("ar-SA", {
        hour: "2-digit",
        minute: "2-digit",
    });
    const modeText = mode === "online" ? "عبر الإنترنت" : "حضوري";
    let locationLine = "";
    if (mode === "online" && videoLink) {
        locationLine = `\n🔗 رابط الجلسة: ${videoLink}`;
    }
    else if (mode === "in_person") {
        locationLine = `\n📍 موقع العيادة: https://maps.google.com`;
    }
    return `تذكير بموعدك ${patientName} 🔔\n\nغداً الساعة ${timeStr} - ${modeText}${locationLine}\n\nنراك قريباً! عيادة التغذية 🌿`;
}
export function buildFollowUpMessage(patientName) {
    return `شكراً لزيارتك ${patientName} 💚\n\nنتمنى أن تكون تجربتك ممتازة.\nيسعدنا معرفة رأيك في الخدمة.\n\nللحجز مجدداً تواصل معنا.\nعيادة التغذية 🌿`;
}
