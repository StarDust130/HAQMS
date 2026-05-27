-- CreateIndex
CREATE INDEX IF NOT EXISTS "Doctor_department_specialization_idx" ON "Doctor"("department", "specialization");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Appointment_doctorId_appointmentDate_key" ON "Appointment"("doctorId", "appointmentDate");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Appointment_doctorId_status_idx" ON "Appointment"("doctorId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Appointment_patientId_idx" ON "Appointment"("patientId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "QueueToken_doctorId_createdAt_idx" ON "QueueToken"("doctorId", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "QueueToken_status_idx" ON "QueueToken"("status");
