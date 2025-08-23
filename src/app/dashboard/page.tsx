"use client";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import React, { useMemo, useState } from "react";
import { Responsive, WidthProvider, Layout } from "react-grid-layout";
import { useThemeStyles } from "@/components/theme-provider";
import { useAuth, useDashboard } from "@/store";

import { RecentConsultationsWidget } from "@/components/widgets/recent-consultations-widget";
import { QuickActionsWidget } from "@/components/widgets/quick-actions-widget";
import { AppointmentsTodayWidget } from "@/components/widgets/appointments-today-widget";
import { RevenueChartWidget } from "@/components/widgets/revenue-chart-widget";
import { PetsCountWidget } from "@/components/widgets/pets-count-widget";
import { StockAlertsWidget } from "@/components/widgets/stock-alerts-widget";
import { WidgetCustomizationPanel } from "@/components/widgets/widget-customization-panel";

const ResponsiveGridLayout = WidthProvider(Responsive);

function createWidget(type: string, id: string) {
  switch (type) {
    case "appointments-today":
      return <AppointmentsTodayWidget key={id} />;
    case "revenue-chart":
      return <RevenueChartWidget key={id} />;
    case "pets-count":
      return <PetsCountWidget key={id} />;
    case "stock-alerts":
      return <StockAlertsWidget key={id} />;
    case "recent-consultations":
      return <RecentConsultationsWidget key={id} />;
    case "quick-actions":
      return <QuickActionsWidget key={id} />;
    default:
      return null;
  }
}

export default function Dashboard() {
  const { widgets, updateWidget } = useDashboard();
  const { user } = useAuth();
  const styles = useThemeStyles();

  const [editMode, setEditMode] = useState(false);

  const getLayoutsFromWidgets = () => {
    const layout = widgets
      .filter((w) => w.visible)
      .map((w) => ({
        i: w.id,
        x: w.position.x,
        y: w.position.y,
        w: w.size.w,
        h: w.size.h,
        minW: 3,
        minH: 3,
      }));

    return {
      lg: layout,
      md: layout,
      sm: layout,
      xs: layout,
      xxs: layout,
    };
  };

  const [layouts, setLayouts] = useState(getLayoutsFromWidgets());

  const handleLayoutChange = (
    _layout: Layout[],
    allLayouts: { [key: string]: Layout[] },
  ) => {
    setLayouts(allLayouts);
    if (!editMode) return;

    allLayouts.lg.forEach((item) => {
      updateWidget(item.i, {
        position: { x: item.x, y: item.y },
        size: { w: item.w, h: item.h },
      });
    });
  };

  const visibleWidgets = useMemo(
    () => widgets.filter((w) => w.visible),
    [widgets],
  );

  return (
    <div className={`${styles.background} min-h-full p-6`}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            Olá, {user?.name || "Usuário"}! 👋
          </h1>
          <p className="text-text-secondary mt-1">
            Aqui está um resumo do que está acontecendo na sua clínica hoje.
          </p>
        </div>

        <button
          onClick={() => setEditMode((prev) => !prev)}
          className="bg-primary-500 text-text-inverse rounded-lg px-4 py-2 hover:bg-primary-600 transition-colors duration-200 font-medium"
        >
          {editMode ? "Concluir Edição" : "Editar Layout"}
        </button>
      </div>

      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={60}
        onLayoutChange={handleLayoutChange}
        isDraggable={editMode}
        isResizable={editMode}
        margin={[16, 16]}
        containerPadding={[0, 0]}
        draggableHandle=".widget-drag-handle"
        resizeHandles={["se", "e", "s"]}
      >
        {visibleWidgets.map((widget) => (
          <div key={widget.id}>{createWidget(widget.type, widget.id)}</div>
        ))}
      </ResponsiveGridLayout>

      <WidgetCustomizationPanel />
    </div>
  );
}
