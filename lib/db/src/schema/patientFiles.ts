import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { patientsTable } from "./patients";

export const patientFilesTable = pgTable("patient_files", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  patientId: text("patient_id").notNull().references(() => patientsTable.id),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileUrl: text("file_url"),
  fileSize: integer("file_size"),
  notes: text("notes"),
  deletedAt: timestamp("deleted_at"),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});

export const insertPatientFileSchema = createInsertSchema(patientFilesTable).omit({ id: true, uploadedAt: true, deletedAt: true });
export type InsertPatientFile = z.infer<typeof insertPatientFileSchema>;
export type PatientFile = typeof patientFilesTable.$inferSelect;
