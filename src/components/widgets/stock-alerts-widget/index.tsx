import { AlertTriangle, Package } from "lucide-react";
import { Widget } from "..";
import { useProducts } from "@/store";

export function StockAlertsWidget() {
  const { products } = useProducts();
  
  // Filtrar produtos com estoque baixo
  const lowStockItems = products.filter(product => 
    product.inventory.stock <= product.inventory.minimumStock
  ).slice(0, 3);

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
          {lowStockItems.map((item) => (
            <div
              key={item.product_id}
              className="flex items-center justify-between p-2 bg-background-secondary rounded-md"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {item.name}
                </p>
                <p className="text-xs text-warning">
                  Restam apenas {item.inventory.stock} {item.inventory.unit}
                </p>
              </div>
              <Package className="w-4 h-4 text-warning" />
            </div>
          ))}
        </div>

        <button className="w-full text-xs text-text-tertiary hover:text-text-primary transition-colors duration-200">
          Ver todos os alertas →
        </button>
      </div>
    </Widget>
  );
}
