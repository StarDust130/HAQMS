import { redirect } from 'next/navigation';
import { Activity, ArrowLeft, FileText, CalendarDays } from 'lucide-react';
import Link from 'next/link';

async function getPatientData(id) {
  const res = await fetch(`http://localhost:5000/api/patients/${id}`, {
    // We would pass token here or use a server component fetch with cookies,
    // assuming public/bypass for this demo or we can pass a dummy auth header if required
    cache: 'no-store'
  });
  if (!res.ok) {
    return null;
  }
  return res.json();
}

export default async function PatientHistoryRecords({ params }) {
  const patient = await getPatientData(params.id);

  if (!patient) {
    // If not found, redirect to dashboard or show 404
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-bold">Patient Not Found</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/dashboard" className="text-teal-600 dark:text-teal-400 flex items-center gap-2 hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700">
          <div className="bg-teal-600 p-6 sm:p-10 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="h-8 w-8" />
              <h1 className="text-3xl font-extrabold">Clinical Details</h1>
            </div>
            <p className="text-teal-100 font-medium text-lg">{patient.name}</p>
          </div>

          <div className="p-6 sm:p-10 space-y-8">
            <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase">Age</span>
                <span className="block text-lg font-semibold">{patient.age}</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase">Gender</span>
                <span className="block text-lg font-semibold">{patient.gender}</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase">Contact</span>
                <span className="block text-lg font-semibold">{patient.phoneNumber}</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase">Email</span>
                <span className="block text-lg font-semibold">{patient.email || 'N/A'}</span>
              </div>
            </section>

            <section className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-teal-600" />
                Medical History
              </h2>
              <p className="text-slate-700 dark:text-slate-300">
                {patient.medicalHistory || 'No prior medical history reported.'}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                <CalendarDays className="h-5 w-5 text-teal-600" />
                Appointment History
              </h2>
              {patient.appointments && patient.appointments.length > 0 ? (
                <div className="space-y-4">
                  {patient.appointments.map((app) => (
                    <div key={app.id} className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex justify-between items-center">
                      <div>
                        <span className="block text-sm font-semibold">{new Date(app.appointmentDate).toLocaleString()}</span>
                        <span className="block text-xs text-slate-500">{app.reason || 'No specific reason provided'}</span>
                      </div>
                      <div>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          app.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                          app.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 italic">No appointments booked yet.</p>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}