import { db } from "@workspace/db";
import {
  appointmentTypesTable,
  servicesTable,
  doctorsTable,
  patientsTable,
  appointmentsTable,
} from "@workspace/db/schema";

async function seed() {
  console.log("Seeding database...");

  // Appointment types
  await db.insert(appointmentTypesTable).values([
    { nameAr: "استشارة أولى", nameEn: "Initial Consultation", durationMinutes: 60 },
    { nameAr: "متابعة", nameEn: "Follow-up", durationMinutes: 30 },
    { nameAr: "مراجعة خطة التغذية", nameEn: "Nutrition Plan Review", durationMinutes: 45 },
    { nameAr: "جلسة دعم", nameEn: "Support Session", durationMinutes: 30 },
  ]).onConflictDoNothing();

  // Services
  await db.insert(servicesTable).values([
    { nameAr: "استشارة تغذية أولى", nameEn: "Initial Nutrition Consultation", price: "350.00", vatRate: "0.15", description: "جلسة أولى شاملة مع أخصائي التغذية" },
    { nameAr: "خطة تغذية مخصصة", nameEn: "Custom Nutrition Plan", price: "500.00", vatRate: "0.15", description: "خطة غذائية مخصصة حسب الاحتياجات" },
    { nameAr: "متابعة شهرية", nameEn: "Monthly Follow-up", price: "200.00", vatRate: "0.15", description: "جلسة متابعة شهرية" },
    { nameAr: "استشارة أونلاين", nameEn: "Online Consultation", price: "250.00", vatRate: "0.15", description: "استشارة عبر مكالمة فيديو" },
    { nameAr: "تحليل تركيب الجسم", nameEn: "Body Composition Analysis", price: "150.00", vatRate: "0.15", description: "قياس نسب الدهون والعضلات" },
  ]).onConflictDoNothing();

  // Doctors
  const [doctor1, doctor2] = await db.insert(doctorsTable).values([
    {
      nameAr: "د. سارة المحمود",
      nameEn: "Dr. Sarah Al-Mahmoud",
      specialization: "أخصائية تغذية علاجية",
      phone: "0500000001",
      email: "sarah@clinic.com",
      bio: "أخصائية تغذية معتمدة بخبرة أكثر من 10 سنوات في التغذية العلاجية وإدارة الوزن",
    },
    {
      nameAr: "د. أحمد الزهراني",
      nameEn: "Dr. Ahmed Al-Zahrani",
      specialization: "أخصائي تغذية رياضية",
      phone: "0500000002",
      email: "ahmed@clinic.com",
      bio: "أخصائي تغذية رياضية متخصص في برامج التغذية للرياضيين وزيادة الأداء",
    },
  ]).returning().onConflictDoNothing();

  // Patients
  const [patient1, patient2, patient3] = await db.insert(patientsTable).values([
    {
      nameAr: "فاطمة العتيبي",
      nameEn: "Fatima Al-Otaibi",
      phone: "0551234567",
      email: "fatima@example.com",
      dateOfBirth: "1990-03-15",
      gender: "female",
      nationalId: "1234567890",
      medicalHistory: "لا يوجد أمراض مزمنة",
      allergies: "حساسية الفول السوداني",
      metadata: { weight: 68, height: 162, waist: 82 },
    },
    {
      nameAr: "محمد الشمري",
      nameEn: "Mohammed Al-Shammari",
      phone: "0561234567",
      email: "mohammed@example.com",
      dateOfBirth: "1985-07-22",
      gender: "male",
      nationalId: "1234567891",
      medicalHistory: "ضغط الدم",
      metadata: { weight: 95, height: 178 },
    },
    {
      nameAr: "نورة السالم",
      nameEn: "Noura Al-Salem",
      phone: "0571234567",
      email: "noura@example.com",
      dateOfBirth: "1995-11-08",
      gender: "female",
      nationalId: "1234567892",
      medicalHistory: "مرض السكري النوع الثاني",
      metadata: { weight: 75, height: 165, glutenIntolerance: false },
    },
  ]).returning().onConflictDoNothing();

  if (doctor1 && patient1 && patient2 && patient3) {
    const now = new Date();
    await db.insert(appointmentsTable).values([
      {
        patientId: patient1.id,
        doctorId: doctor1.id,
        scheduledAt: new Date(now.getTime() + 2 * 60 * 60 * 1000),
        durationMinutes: 60,
        mode: "in_person",
        status: "confirmed",
        notes: "الزيارة الأولى - تقييم عام",
      },
      {
        patientId: patient2.id,
        doctorId: doctor1.id,
        scheduledAt: new Date(now.getTime() + 5 * 60 * 60 * 1000),
        durationMinutes: 30,
        mode: "online",
        status: "scheduled",
        notes: "متابعة خطة الحمية",
      },
      {
        patientId: patient3.id,
        doctorId: doctor2 ? doctor2.id : doctor1.id,
        scheduledAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        durationMinutes: 45,
        mode: "in_person",
        status: "scheduled",
        notes: "مراجعة نتائج تحاليل الدم",
      },
      {
        patientId: patient1.id,
        doctorId: doctor1.id,
        scheduledAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        durationMinutes: 60,
        mode: "in_person",
        status: "completed",
      },
    ]).onConflictDoNothing();
  }

  console.log("Seeding complete!");
}

seed().catch(console.error);
