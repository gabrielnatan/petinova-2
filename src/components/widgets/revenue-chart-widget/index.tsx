//@ts-nocheck
import { motion } from "framer-motion";
import { TrendingUp, DollarSign } from "lucide-react";
import { Widget } from "..";

export function RevenueChartWidget() {
  // Mock data - replace with real data
  const monthlyRevenue = [
    { month: "Jan", value: 12000 },
    { month: "Fev", value: 15000 },
    { month: "Mar", value: 18000 },
    { month: "Abr", value: 22000 },
    { month: "Mai", value: 19000 },
    { month: "Jun", value: 25000 },
  ];

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
          {monthlyRevenue.slice(-4).map((item, index) => (
            <motion.div
              key={item.month}
              className="flex items-center space-x-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <span className="text-xs text-text-tertiary w-8">
                {item.month}
              </span>
              <div className="flex-1 bg-background-secondary rounded-full h-2">
                <motion.div
                  className="bg-primary-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.value / 25000) * 100}%` }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                />
              </div>
              <span className="text-xs text-text-secondary w-12 text-right">
                {(item.value / 1000).toFixed(0)}k
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </Widget>
  );
}
