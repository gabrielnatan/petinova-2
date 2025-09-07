import { useAppointments } from "@/store";
import { Calendar, Clock } from "lucide-react";
import { Widget } from "..";

export function AppointmentsTodayWidget() {
  const { appointments } = useAppointments();
  const today = new Date().toDateString();
  const todayAppointments = appointments.filter(
    (app) => new Date(app.dateTime).toDateString() === today,
  );

  return (
    <Widget id="appointments-today" title="Agendamentos de Hoje">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary-500">
            {todayAppointments.length}
          </span>
          <Calendar className="w-6 h-6 text-primary-400" />
        </div>

        <div className="space-y-2 max-h-32 overflow-y-auto">
          {todayAppointments.slice(0, 3).map((appointment) => (
            <div
              key={appointment.appointment_id}
              className="flex items-center space-x-2 p-2 bg-background-secondary rounded-md"
            >
              <Clock className="w-4 h-4 text-text-tertiary" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {new Date(appointment.dateTime).toLocaleTimeString()}
                </p>
                <p className="text-xs text-text-tertiary truncate">
                  {appointment.notes || "Consulta agendada"}
                </p>
              </div>
            </div>
          ))}
        </div>

        {todayAppointments.length > 3 && (
          <p className="text-xs text-text-tertiary">
            +{todayAppointments.length - 3} agendamentos restantes
          </p>
        )}
      </div>
    </Widget>
  );
}
