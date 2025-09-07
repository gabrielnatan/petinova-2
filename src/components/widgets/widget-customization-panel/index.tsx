import { useState } from "react";
import { useThemeStyles } from "../../theme-provider";
import { useDashboard } from "@/store";
import {
  AlertTriangle,
  Calendar,
  Eye,
  EyeOff,
  FileText,
  Heart,
  Plus,
  Settings,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";

export function WidgetCustomizationPanel() {
  const { widgets, toggleWidgetVisibility, addWidget } = useDashboard();
  const [isOpen, setIsOpen] = useState(false);
  const styles = useThemeStyles();

  const availableWidgets = [
    {
      type: "appointments-today",
      title: "Agendamentos de Hoje",
      icon: Calendar,
    },
    { type: "revenue-chart", title: "Faturamento Mensal", icon: TrendingUp },
    { type: "pets-count", title: "Total de Pets", icon: Heart },
    { type: "stock-alerts", title: "Alertas de Estoque", icon: AlertTriangle },
    {
      type: "recent-consultations",
      title: "Consultas Recentes",
      icon: FileText,
    },
    { type: "quick-actions", title: "Ações Rápidas", icon: Zap },
  ];

  const handleAddWidget = (type: string, title: string) => {
    const newWidget = {
      id: `${type}-${Date.now()}`,
      type: type as any,
      title,
      position: { x: 0, y: 0 },
      size: { w: 6, h: 4 },
      visible: true,
    };
    addWidget(newWidget);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 ${styles.buttonPrimary} rounded-full p-4 shadow-lg z-50`}
      >
        <Settings className="w-6 h-6" />
      </button>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-neutral-900/50  z-50"
        onClick={() => setIsOpen(false)}
      />
      <div
        className={`fixed right-6 top-1/2 transform -translate-y-1/2 ${styles.card} w-80 max-h-96 overflow-y-auto z-50`}
      >
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-text-primary">
              Personalizar Dashboard
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded text-text-tertiary hover:text-text-primary"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <h4 className="text-sm font-medium text-text-primary mb-2">
              Widgets Ativos
            </h4>
            <div className="space-y-2">
              {widgets.map((widget) => (
                <div
                  key={widget.id}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-text-secondary">
                    {widget.title}
                  </span>
                  <button
                    onClick={() => toggleWidgetVisibility(widget.id)}
                    className="p-1 rounded text-text-tertiary hover:text-text-primary"
                  >
                    {widget.visible ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-text-primary mb-2">
              Adicionar Widget
            </h4>
            <div className="space-y-2">
              {availableWidgets.map((widget) => (
                <button
                  key={widget.type}
                  onClick={() =>
                    handleAddWidget(widget.type, widget.title)
                  }
                  className="w-full flex items-center space-x-2 p-2 rounded-md hover:bg-background-secondary transition-colors duration-200"
                >
                  <widget.icon className="w-4 h-4 text-primary-500" />
                  <span className="text-sm text-text-primary">
                    {widget.title}
                  </span>
                  <Plus className="w-4 h-4 text-text-tertiary ml-auto" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
