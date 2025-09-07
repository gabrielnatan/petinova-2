import { X } from "lucide-react";
import { useThemeStyles } from "../theme-provider";

interface WidgetProps {
  id: string;
  title: string;
  onRemove?: (id: string) => void;
  children: React.ReactNode;
}

export function Widget({ id, title, onRemove, children }: WidgetProps) {
  const styles = useThemeStyles();
  const editMode = true; // você pode passar via prop ou contexto

  return (
    <div
      className={`${styles.card} h-full flex flex-col overflow-hidden relative`}
    >
      <div className="flex items-center justify-between p-4 border-b border-border widget-drag-handle">
        <h3 className="font-semibold text-text-primary">{title}</h3>
        {onRemove && (
          <button
            onClick={() => onRemove(id)}
            className="p-1 rounded text-text-tertiary hover:text-error hover:bg-background-secondary transition-colors duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div
        className={`flex-1 p-4 overflow-hidden relative ${editMode ? "edit-outline" : ""}`}
      >
        {children}
      </div>
    </div>
  );
}

// Export de todos os widgets
export { AppointmentsTodayWidget } from './appointments-today-widget';
export { PetsCountWidget } from './pets-count-widget';
export { QuickActionsWidget } from './quick-actions-widget';
export { RecentConsultationsWidget } from './recent-consultations-widget';
export { RevenueChartWidget } from './revenue-chart-widget';
export { StockAlertsWidget } from './stock-alerts-widget';
export { WidgetCustomizationPanel } from './widget-customization-panel';
