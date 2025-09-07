import { useThemeStyles } from "@/components/theme-provider";
import { Calendar, Heart, FileText, Package } from "lucide-react";
import { Widget } from "..";

export function QuickActionsWidget() {
  const styles = useThemeStyles();

  const actions = [
    {
      label: "Novo Agendamento",
      icon: Calendar,
      href: "/dashboard/appointments/new",
      color: "primary",
    },
    {
      label: "Cadastrar Pet",
      icon: Heart,
      href: "/dashboard/pets/new",
      color: "secondary",
    },
    {
      label: "Nova Consulta",
      icon: FileText,
      href: "/dashboard/consultations/new",
      color: "accent",
    },
    {
      label: "Adicionar Produto",
      icon: Package,
      href: "/dashboard/inventory/new",
      color: "primary",
    },
  ];

  return (
    <Widget id="quick-actions" title="Ações Rápidas">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {actions.map((action) => (
          <a
            key={action.label}
            href={action.href}
            className={`${styles.card} ${styles.cardHover} p-4 text-center group cursor-pointer`}
          >
            <action.icon
              className={`w-6 h-6 mx-auto mb-2 text-${action.color}-500 group-hover:text-${action.color}-600 transition-colors duration-200`}
            />
            <span className="text-xs font-medium text-text-primary group-hover:text-text-primary">
              {action.label}
            </span>
          </a>
        ))}
      </div>
    </Widget>
  );
}
