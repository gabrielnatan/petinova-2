//@ts-nocheck
import { motion } from "framer-motion";
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
    <motion.div
      className={`${styles.card} h-full flex flex-col overflow-hidden relative`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between p-4 border-b border-border widget-drag-handle">
        <h3 className="font-semibold text-text-primary">{title}</h3>
        {onRemove && (
          <motion.button
            onClick={() => onRemove(id)}
            className="p-1 rounded text-text-tertiary hover:text-error hover:bg-background-secondary transition-colors duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-4 h-4" />
          </motion.button>
        )}
      </div>

      <div
        className={`flex-1 p-4 overflow-hidden relative ${editMode ? "edit-outline" : ""}`}
      >
        {children}
      </div>
    </motion.div>
  );
}
