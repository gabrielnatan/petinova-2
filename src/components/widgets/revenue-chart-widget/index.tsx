import { TrendingUp, DollarSign } from "lucide-react";
import { Widget } from "..";
import { useConsultations } from "@/store";

export function RevenueChartWidget() {
  const { consultations } = useConsultations();
  
  // Calcular faturamento baseado nas consultas dos últimos 6 meses
  const monthlyRevenue = [];
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
  const currentDate = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const monthConsultations = consultations.filter(consultation => {
      const consultationDate = new Date(consultation.created_at);
      return consultationDate.getMonth() === monthDate.getMonth() && 
             consultationDate.getFullYear() === monthDate.getFullYear();
    });
    
    // Valor médio por consulta (simulado)
    const monthlyValue = monthConsultations.length * 150;
    
    monthlyRevenue.push({
      month: months[monthDate.getMonth()],
      value: monthlyValue,
      monthIndex: monthDate.getMonth(),
      year: monthDate.getFullYear()
    });
  }

  const currentMonth = monthlyRevenue[monthlyRevenue.length - 1];
  const previousMonth = monthlyRevenue[monthlyRevenue.length - 2];
  const growth =
    ((currentMonth.value - previousMonth.value) / previousMonth.value) * 100;

  return (
    <Widget id="revenue-chart" title="Faturamento Mensal">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-primary-500">
              R$ {currentMonth.value.toLocaleString()}
            </span>
            <div className="flex items-center space-x-1 mt-1">
              <TrendingUp
                className={`w-4 h-4 ${growth > 0 ? "text-success" : "text-error"}`}
              />
              <span
                className={`text-sm font-medium ${growth > 0 ? "text-success" : "text-error"}`}
              >
                {growth > 0 ? "+" : ""}
                {growth.toFixed(1)}%
              </span>
              <span className="text-xs text-text-tertiary">
                vs mês anterior
              </span>
            </div>
          </div>
          <DollarSign className="w-6 h-6 text-primary-400" />
        </div>

        {/* Simple bar chart */}
        <div className="space-y-2">
          {monthlyRevenue.slice(-4).map((item) => (
            <div
              key={`${item.year}-${item.monthIndex}`}
              className="flex items-center space-x-2"
            >
              <span className="text-xs text-text-tertiary w-8">
                {item.month}
              </span>
              <div className="flex-1 bg-background-secondary rounded-full h-2">
                <div
                  className="bg-primary-500 h-2 rounded-full"
                  style={{ width: `${(item.value / 25000) * 100}%` }}
                />
              </div>
              <span className="text-xs text-text-secondary w-12 text-right">
                {(item.value / 1000).toFixed(0)}k
              </span>
            </div>
          ))}
        </div>
      </div>
    </Widget>
  );
}
