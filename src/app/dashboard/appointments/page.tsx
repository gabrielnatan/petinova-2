"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Calendar,
  Clock,
  User,
  Heart,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Edit,
  X,
  Check,
  Stethoscope,
  Eye,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  format,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isToday,
  isSameDay,
  parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { appointmentAPI, type Appointment } from "@/lib/api/appointments";

const statusConfig = {
  SCHEDULED: {
    label: "Agendado",
    color: "bg-warning text-warning-foreground",
    icon: Clock,
  },
  CONFIRMED: {
    label: "Confirmado",
    color: "bg-primary-500 text-text-inverse",
    icon: Check,
  },
  IN_PROGRESS: {
    label: "Em Andamento",
    color: "bg-info text-info-foreground",
    icon: Clock,
  },
  COMPLETED: {
    label: "Concluído",
    color: "bg-success text-success-foreground",
    icon: Check,
  },
  CANCELLED: {
    label: "Cancelado",
    color: "bg-error text-error-foreground",
    icon: X,
  },
};

function AppointmentCard({
  appointment,
  onStatusChange,
  updatingStatus
}: {
  appointment: Appointment;
  onStatusChange?: (id: string, status: string) => void;
  updatingStatus?: string | null;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const statusInfo = statusConfig[appointment.status as keyof typeof statusConfig];
  const dateTime = parseISO(appointment.dateTime);

  const handleStatusChange = (newStatus: string) => {
    onStatusChange?.(appointment.appointment_id, newStatus);
    setShowMenu(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary-400">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">
                  {appointment.pet.name}
                </h3>
                <p className="text-sm text-text-secondary">
                  {appointment.pet.breed} • {appointment.pet.species}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
              >
                {statusInfo.label}
              </span>

              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setShowMenu(!showMenu)}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>

                {showMenu && (
                  <motion.div
                    className="absolute right-0 top-full mt-1 bg-surface border border-border rounded-md shadow-lg z-10 min-w-[180px]"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      asChild
                    >
                      <Link
                        href={`/dashboard/appointments/${appointment.appointment_id}`}
                        className="flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalhes
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      asChild
                    >
                      <Link
                        href={`/dashboard/appointments/${appointment.appointment_id}/edit`}
                        className="flex items-center"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Link>
                    </Button>
                    {appointment.status === "SCHEDULED" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-primary-600 hover:bg-background-secondary"
                        onClick={() => handleStatusChange("CONFIRMED")}
                        disabled={updatingStatus === appointment.appointment_id}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Confirmar
                      </Button>
                    )}
                    {appointment.status === "CONFIRMED" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-success hover:bg-background-secondary"
                        onClick={() => handleStatusChange("COMPLETED")}
                        disabled={updatingStatus === appointment.appointment_id}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Marcar como Concluído
                      </Button>
                    )}
                    <hr className="my-1 border-border" />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-error hover:bg-background-secondary"
                      onClick={() => handleStatusChange("CANCELLED")}
                      disabled={updatingStatus === appointment.appointment_id}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2 mb-3">
            <div className="flex items-center text-sm text-text-secondary">
              <Clock className="w-4 h-4 mr-2" />
              {format(dateTime, "HH:mm", { locale: ptBR })}
            </div>
            <div className="flex items-center text-sm text-text-secondary">
              <User className="w-4 h-4 mr-2" />
              {appointment.guardian.name}
            </div>
            <div className="flex items-center text-sm text-text-secondary">
              <Stethoscope className="w-4 h-4 mr-2" />
              {appointment.veterinarian.name}
            </div>
          </div>

          <div className="bg-background-secondary rounded-md p-3">
            <p className="text-sm text-text-primary font-medium mb-1">
              {appointment.veterinarian.specialty || 'Clínica Geral'}
            </p>
            {appointment.notes && (
              <p className="text-sm text-text-secondary line-clamp-2">
                {appointment.notes}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function WeeklyCalendar({
  selectedDate,
  onDateChange,
  appointments,
}: {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  appointments: Appointment[];
}) {
  const weekStart = startOfWeek(selectedDate, { locale: ptBR });
  const weekEnd = endOfWeek(selectedDate, { locale: ptBR });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((day) => {
        const dayAppointments = appointments.filter((app) =>
          isSameDay(parseISO(app.dateTime), day)
        );
        const isCurrentDay = isToday(day);
        const isSelected = isSameDay(day, selectedDate);

        return (
          <motion.button
            key={day.toISOString()}
            onClick={() => onDateChange(day)}
            className={`p-3 rounded-lg text-left border transition-all duration-200 ${
              isSelected
                ? "bg-primary-500 text-text-inverse border-primary-500 shadow-md"
                : isCurrentDay
                ? "bg-primary-50 text-primary-700 border-primary-200"
                : "bg-surface border-border hover:bg-background-secondary hover:border-primary-300"
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-xs opacity-75 mb-1">
              {format(day, "EEE", { locale: ptBR }).toUpperCase()}
            </div>
            <div className="text-lg font-semibold mb-2">{format(day, "d")}</div>
            <div className="space-y-1">
              {dayAppointments.slice(0, 3).map((app) => (
                <div
                  key={app.appointment_id}
                  className={`text-xs px-2 py-1 rounded ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-primary-100 text-primary-700"
                  }`}
                >
                  <div className="font-medium">
                    {format(parseISO(app.dateTime), "HH:mm")}
                  </div>
                  <div className="truncate opacity-90">{app.pet.name}</div>
                </div>
              ))}
              {dayAppointments.length > 3 && (
                <div
                  className={`text-xs ${
                    isSelected ? "text-white/75" : "text-text-tertiary"
                  }`}
                >
                  +{dayAppointments.length - 3} mais
                </div>
              )}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

export default function AppointmentsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Carregar agendamentos da semana atual para o calendário
      const weekStart = startOfWeek(selectedDate, { locale: ptBR });
      const weekEnd = endOfWeek(selectedDate, { locale: ptBR });
      
      const response = await appointmentAPI.getAppointmentsByWeek(
        format(weekStart, 'yyyy-MM-dd'),
        format(weekEnd, 'yyyy-MM-dd')
      );
      
      setAppointments(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [selectedDate]);

  const dayAppointments = appointments
    .filter((app) => isSameDay(parseISO(app.dateTime), selectedDate))
    .sort((a, b) => parseISO(a.dateTime).getTime() - parseISO(b.dateTime).getTime());

  const filteredAppointments = dayAppointments.filter((app) => {
    const matchesSearch =
      searchTerm === "" ||
      app.pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.guardian.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.veterinarian.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      setUpdatingStatus(appointmentId);
      await appointmentAPI.updateAppointmentStatus(appointmentId, newStatus as any);
      await loadAppointments();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao atualizar status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusCount = (status: string) => {
    return dayAppointments.filter((app) => app.status === status).length;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Agendamentos</h1>
          <p className="text-text-secondary">
            Gerencie os agendamentos da clínica
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/appointments/new" className="flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Novo Agendamento
          </Link>
        </Button>
      </div>

      {/* Calendar Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-text-primary capitalize">
                {format(selectedDate, "MMMM yyyy", { locale: ptBR })}
              </h2>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedDate(subDays(selectedDate, 7))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDate(new Date())}
                >
                  Hoje
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedDate(addDays(selectedDate, 7))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-error mb-4">{error}</div>
              <Button onClick={loadAppointments}>Tentar novamente</Button>
            </div>
          ) : (
            <WeeklyCalendar
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              appointments={appointments}
            />
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Day Header with Filters */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-text-primary capitalize">
              {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
              <span className="ml-2 text-sm font-normal text-text-secondary">
                ({filteredAppointments.length} agendamento
                {filteredAppointments.length !== 1 ? "s" : ""})
              </span>
            </h3>

            <div className="flex items-center space-x-2">
              <Input
                placeholder="Buscar agendamentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={Search}
                className="w-64"
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary focus:border-border-focus focus:outline-none"
              >
                <option value="all">Todos</option>
                <option value="SCHEDULED">Agendados</option>
                <option value="CONFIRMED">Confirmados</option>
                <option value="IN_PROGRESS">Em Andamento</option>
                <option value="COMPLETED">Concluídos</option>
                <option value="CANCELLED">Cancelados</option>
              </select>
            </div>
          </div>

          {/* Appointments List */}
          {filteredAppointments.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  {searchTerm || statusFilter !== "all"
                    ? "Nenhum agendamento encontrado"
                    : "Nenhum agendamento para hoje"}
                </h3>
                <p className="text-text-secondary mb-6">
                  {searchTerm || statusFilter !== "all"
                    ? "Tente ajustar os filtros de busca"
                    : "Que tal agendar a primeira consulta do dia?"}
                </p>
                <Button asChild>
                  <Link href="/dashboard/appointments/new" className="flex items-center">
                    <Plus className="w-4 h-4 mr-2" />
                    Agendar Consulta
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((appointment, index) => (
                <motion.div
                  key={appointment.appointment_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <AppointmentCard
                    appointment={appointment}
                    onStatusChange={handleStatusChange}
                    updatingStatus={updatingStatus}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Daily Summary */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-text-primary">
                Resumo do Dia
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Total</span>
                <span className="text-2xl font-bold text-text-primary">
                  {dayAppointments.length}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-warning rounded-full"></div>
                    <span className="text-sm text-text-secondary">Agendados</span>
                  </div>
                  <span className="text-sm font-medium text-text-primary">
                    {getStatusCount("SCHEDULED")}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                    <span className="text-sm text-text-secondary">Confirmados</span>
                  </div>
                  <span className="text-sm font-medium text-text-primary">
                    {getStatusCount("CONFIRMED")}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-success rounded-full"></div>
                    <span className="text-sm text-text-secondary">Concluídos</span>
                  </div>
                  <span className="text-sm font-medium text-text-primary">
                    {getStatusCount("COMPLETED")}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-error rounded-full"></div>
                    <span className="text-sm text-text-secondary">Cancelados</span>
                  </div>
                  <span className="text-sm font-medium text-text-primary">
                    {getStatusCount("CANCELLED")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-text-primary">
                Ações Rápidas
              </h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" asChild>
                <Link href="/dashboard/appointments/new" className="flex items-center justify-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Agendamento
                </Link>
              </Button>

              <Button variant="secondary" className="w-full" asChild>
                <Link href="/dashboard/pets" className="flex items-center justify-center">
                  <Heart className="w-4 h-4 mr-2" />
                  Ver Pets
                </Link>
              </Button>

              <Button variant="secondary" className="w-full" asChild>
                <Link href="/dashboard/guardians" className="flex items-center justify-center">
                  <User className="w-4 h-4 mr-2" />
                  Ver Tutores
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-text-primary">
                Próximos Agendamentos
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {appointments
                  .filter((app) => parseISO(app.dateTime) > selectedDate)
                  .slice(0, 3)
                  .map((appointment) => (
                    <div
                      key={appointment.appointment_id}
                      className="flex items-center space-x-3"
                    >
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <Heart className="w-4 h-4 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {appointment.pet.name}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {format(parseISO(appointment.dateTime), "dd/MM HH:mm")} •{" "}
                          {appointment.guardian.name}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}