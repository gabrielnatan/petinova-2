//@ts-nocheck
import { motion } from "framer-motion";
import { AlertTriangle, Package } from "lucide-react";
import { Widget } from "..";

export function StockAlertsWidget() {
  // Mock data - replace with real product data
  const lowStockItems = [
    { name: "Ração Premium", quantity: 2, min: 10 },
    { name: "Vacina V8", quantity: 1, min: 5 },
    { name: "Antipulgas", quantity: 3, min: 8 },
  ];

  return (
    <Widget id="stock-alerts" title="Alertas de Estoque">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-warning">
            {lowStockItems.length}
          </span>
          <AlertTriangle className="w-6 h-6 text-warning" />
        </div>

        <div className="space-y-2 max-h-32 overflow-y-auto">
          {lowStockItems.map((item, index) => (
            <motion.div
              key={item.name}
              className="flex items-center justify-between p-2 bg-background-secondary rounded-md"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {item.name}
                </p>
                <p className="text-xs text-warning">
                  Restam apenas {item.quantity} unidades
                </p>
              </div>
              <Package className="w-4 h-4 text-warning" />
            </motion.div>
          ))}
        </div>

        <motion.button
          className="w-full text-xs text-text-tertiary hover:text-text-primary transition-colors duration-200"
          whileHover={{ scale: 1.02 }}
        >
          Ver todos os alertas →
        </motion.button>
      </div>
    </Widget>
  );
}
