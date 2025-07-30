//@ts-nocheck
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  FileText,
  Calendar,
  DollarSign,
  Heart,
  User,
  Stethoscope,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical,
  Edit,
  Receipt,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import Link from "next/link";

// Mock data
const mockConsultations = [
  {
    consultation_id: "1",
    description: "Consulta de rotina - Exame geral completo",
    amount: 120.0,
    payment_method: "card",
    payment_plan: 1,
    paid: true,
    created_at: new Date(2025, 0, 25, 9, 30),
    pet: {
      name: "Buddy",
      species: "Cão",
      breed: "Golden Retriever",
    },
    guardian: {
      fullName: "João Silva",
      phone: "(11) 99999-9999",
    },
    veterinarian: {
      fullName: "Dra. Maria Santos",
      specialty: "Clínica Geral",
    },
    appointment: {
      dateTime: new Date(2025, 0, 25, 9, 0),
      status: "completed",
    },
    prescription: {
      text: "Antibiótico - Amoxicilina 250mg - 1 comprimido de 12/12h por 7 dias",
    },
  },
  {
    consultation_id: "2",
    description: "Vacinação V10 + Vermifugação",
    amount: 85.0,
    payment_method: "pix",
    payment_plan: 1,
    paid: true,
    created_at: new Date(2025, 0, 24, 14, 15),
    pet: {
      name: "Luna",
      species: "Gato",
      breed: "Siamês",
    },
    guardian: {
      fullName: "Pedro Costa",
      phone: "(11) 88888-8888",
    },
    veterinarian: {
      fullName: "Dr. Carlos Lima",
      specialty: "Imunização",
    },
    appointment: {
      dateTime: new Date(2025, 0, 24, 14, 0),
      status: "completed",
    },
    prescription: null,
  },
  {
    consultation_id: "3",
    description: "Consulta dermatológica - Tratamento de alergia",
    amount: 150.0,
    payment_method: "card",
    payment_plan: 2,
    paid: false,
    created_at: new Date(2025, 0, 23, 16, 45),
    pet: {
      name: "Max",
      species: "Cão",
      breed: "Pastor Alemão",
    },
    guardian: {
      fullName: "Ana Oliveira",
      phone: "(11) 77777-7777",
    },
    veterinarian: {
      fullName: "Dra. Ana Oliveira",
      specialty: "Dermatologia",
    },
    appointment: {
      dateTime: new Date(2025, 0, 23, 16, 30),
      status: "completed",
    },
    prescription: {
      text: "Antialérgico - Prednisolona 5mg - 1/2 comprimido de 24/24h por 5 dias",
    },
  },
];

const paymentMethodLabels = {
  cash: "Dinheiro",
  card: "Cartão",
  pix: "PIX",
  transfer: "Transferência",
};

function ConsultationCard({ consultation }: { consultation: any }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">
                  {consultation.pet.name}
                </h3>
                <p className="text-sm text-text-secondary">
                  {consultation.pet.breed} • {consultation.pet.species}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="text-right">
                <p className="text-lg font-bold text-success">
                  {formatCurrency(consultation.amount)}
                </p>
                <div className="flex items-center space-x-1">
                  {consultation.paid ? (
                    <CheckCircle className="w-4 h-4 text-success" />
                  ) : (
                    <XCircle className="w-4 h-4 text-error" />
                  )}
                  <span
                    className={`text-xs ${consultation.paid ? "text-success" : "text-error"}`}
                  >
                    {consultation.paid ? "Pago" : "Pendente"}
                  </span>
                </div>
              </div>

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
                    className="absolute right-0 top-full mt-1 bg-surface border border-border rounded-md shadow-lg z-10 min-w-[160px]"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Link
                      href={`/dashboard/consultations/${consultation.consultation_id}/edit`}
                      className="flex items-center px-3 py-2 text-sm text-text-primary hover:bg-background-secondary"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Link>
                    {consultation.prescription && (
                      <Link
                        href={`/dashboard/consultations/${consultation.consultation_id}/prescription`}
                        className="flex items-center px-3 py-2 text-sm text-text-primary hover:bg-background-secondary"
                      >
                        <Receipt className="w-4 h-4 mr-2" />
                        Ver Prescrição
                      </Link>
                    )}
                    <button className="flex items-center w-full px-3 py-2 text-sm text-text-primary hover:bg-background-secondary">
                      <FileSpreadsheet className="w-4 h-4 mr-2" />
                      Gerar Recibo
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-text-secondary">
              <Calendar className="w-4 h-4 mr-2" />
              {formatDateTime(consultation.created_at)}
            </div>
            <div className="flex items-center text-sm text-text-secondary">
              <User className="w-4 h-4 mr-2" />
              {consultation.guardian.fullName}
            </div>
            <div className="flex items-center text-sm text-text-secondary">
              <Stethoscope className="w-4 h-4 mr-2" />
              {consultation.veterinarian.fullName} -{" "}
              {consultation.veterinarian.specialty}
            </div>
          </div>

          <div className="bg-background-secondary rounded-md p-3 mb-3">
            <p className="text-sm text-text-primary line-clamp-2">
              {consultation.description}
            </p>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span className="text-text-secondary">
                Pagamento:{" "}
                {
                  paymentMethodLabels[
                    consultation.payment_method as keyof typeof paymentMethodLabels
                  ]
                }
              </span>
              {consultation.payment_plan > 1 && (
                <span className="text-text-secondary">
                  {consultation.payment_plan}x
                </span>
              )}
            </div>
            {consultation.prescription && (
              <span className="text-primary-600 text-xs bg-primary-100 px-2 py-1 rounded">
                Com prescrição
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function ConsultationsListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  const filteredConsultations = mockConsultations.filter((consultation) => {
    const matchesSearch =
      searchTerm === "" ||
      consultation.pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.guardian.fullName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      consultation.veterinarian.fullName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      consultation.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPayment =
      paymentFilter === "all" || consultation.payment_method === paymentFilter;
    const matchesPaymentStatus =
      paymentStatusFilter === "all" ||
      (paymentStatusFilter === "paid" && consultation.paid) ||
      (paymentStatusFilter === "pending" && !consultation.paid);

    return matchesSearch && matchesPayment && matchesPaymentStatus;
  });

  const totalRevenue = mockConsultations
    .filter((c) => c.paid)
    .reduce((total, c) => total + c.amount, 0);

  const pendingRevenue = mockConsultations
    .filter((c) => !c.paid)
    .reduce((total, c) => total + c.amount, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Consultas</h1>
          <p className="text-text-secondary">
            Gerencie o histórico de consultas realizadas
          </p>
        </div>
        <Button>
          <Link href="/dashboard/consultations/new">
            <Plus className="w-4 h-4 mr-2" />
            Nova Consulta
          </Link>
        </Button>
      </div>

      {/* Filters and View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Buscar por pet, tutor, veterinário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary focus:border-border-focus focus:outline-none"
          >
            <option value="all">Todas as formas</option>
            <option value="cash">Dinheiro</option>
            <option value="card">Cartão</option>
            <option value="pix">PIX</option>
            <option value="transfer">Transferência</option>
          </select>

          <select
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
            className="bg-surface border border-border rounded-md px-3 py-2 text-text-primary focus:border-border-focus focus:outline-none"
          >
            <option value="all">Todos os status</option>
            <option value="paid">Pago</option>
            <option value="pending">Pendente</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === "cards" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("cards")}
          >
            Cards
          </Button>
          <Button
            variant={viewMode === "table" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("table")}
          >
            Tabela
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">
                  Total de Consultas
                </p>
                <p className="text-2xl font-bold text-text-primary">
                  {mockConsultations.length}
                </p>
              </div>
              <FileText className="w-8 h-8 text-primary-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Faturamento Total</p>
                <p className="text-2xl font-bold text-success">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Pendente</p>
                <p className="text-2xl font-bold text-warning">
                  {formatCurrency(pendingRevenue)}
                </p>
              </div>
              <Clock className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Este Mês</p>
                <p className="text-2xl font-bold text-text-primary">
                  {
                    mockConsultations.filter(
                      (c) => c.created_at.getMonth() === new Date().getMonth(),
                    ).length
                  }
                </p>
              </div>
              <Calendar className="w-8 h-8 text-secondary-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content */}
      {viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredConsultations.map((consultation, index) => (
            <motion.div
              key={consultation.consultation_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ConsultationCard consultation={consultation} />
            </motion.div>
          ))}
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pet</TableHead>
                <TableHead>Tutor</TableHead>
                <TableHead>Veterinário</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredConsultations.map((consultation) => (
                <TableRow key={consultation.consultation_id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <Heart className="w-4 h-4 text-primary-600" />
                      </div>
                      <div>
                        <div className="font-medium text-text-primary">
                          {consultation.pet.name}
                        </div>
                        <div className="text-sm text-text-secondary">
                          {consultation.pet.breed}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {consultation.guardian.fullName}
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {consultation.veterinarian.fullName}
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {formatDate(consultation.created_at)}
                  </TableCell>
                  <TableCell className="font-medium text-success">
                    {formatCurrency(consultation.amount)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {consultation.paid ? (
                        <CheckCircle className="w-4 h-4 text-success" />
                      ) : (
                        <XCircle className="w-4 h-4 text-error" />
                      )}
                      <span
                        className={`text-sm ${consultation.paid ? "text-success" : "text-error"}`}
                      >
                        {consultation.paid ? "Pago" : "Pendente"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {filteredConsultations.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">
            Nenhuma consulta encontrada
          </h3>
          <p className="text-text-secondary mb-4">
            {searchTerm ||
            paymentFilter !== "all" ||
            paymentStatusFilter !== "all"
              ? "Tente ajustar os filtros de busca"
              : "Comece registrando a primeira consulta"}
          </p>
          <Button>
            <Link href="/dashboard/consultations/new">
              <Plus className="w-4 h-4 mr-2" />
              Nova Consulta
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
