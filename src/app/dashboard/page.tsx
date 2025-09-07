"use client";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { Responsive, WidthProvider, Layout } from "react-grid-layout";
import { useThemeStyles } from "../../components/theme-provider";
import { useAuth, useDashboard, useConsultations, useProducts } from "../../store";

import {
  RecentConsultationsWidget,
  QuickActionsWidget,
  AppointmentsTodayWidget,
  RevenueChartWidget,
  PetsCountWidget,
  StockAlertsWidget,
  WidgetCustomizationPanel,
} from "../../components/widgets";

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
  const { widgets, updateWidget, loadDashboardLayout, saveDashboardLayout } = useDashboard();
  const { user } = useAuth();
  const { loadConsultations } = useConsultations();
  const { loadProducts } = useProducts();
  const styles = useThemeStyles();

  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getLayoutsFromWidgets = useCallback(() => {
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
  }, [widgets]);

  const [layouts, setLayouts] = useState(() => getLayoutsFromWidgets());

  // Carregar layout salvo quando o componente montar
  useEffect(() => {
    if (user) {
      setIsLoading(true);
      Promise.all([
        loadDashboardLayout(),
        loadConsultations(),
        loadProducts()
      ]).finally(() => {
        setIsLoading(false);
      });
    }
  }, [user, loadDashboardLayout, loadConsultations, loadProducts]);

  // Atualizar layouts quando widgets mudarem
  useEffect(() => {
    setLayouts(getLayoutsFromWidgets());
  }, [getLayoutsFromWidgets]);

  const handleLayoutChange = (
    _layout: Layout[],
    allLayouts: { [key: string]: Layout[] },
  ) => {
    setLayouts(allLayouts as any);
    if (!editMode) return;

    allLayouts.lg.forEach((item) => {
      updateWidget(item.i, {
        position: { x: item.x, y: item.y },
        size: { w: item.w, h: item.h },
      });
    });

    // Salvar automaticamente após uma pequena debounce
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveDashboardLayout();
    }, 1000);
  };

  const visibleWidgets = useMemo(
    () => widgets.filter((w) => w.visible),
    [widgets],
  );

  // Loading state
  if (isLoading) {
    return (
      <div className={`${styles.background} min-h-full flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary text-lg">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

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
          onClick={() => {
            if (editMode) {
              // Salvar imediatamente quando sair do modo de edição
              saveDashboardLayout();
            }
            setEditMode((prev) => !prev);
          }}
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
