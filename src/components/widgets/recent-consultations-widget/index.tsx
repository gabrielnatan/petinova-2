import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Widget } from "..";

export function RecentConsultationsWidget() {
  // Mock data - replace with real consultation data
  const recentConsultations = [
    {
      id: "1",
      petName: "Buddy",
      guardianName: "João Silva",
      amount: 150,
      time: "14:30",
    },
    {
      id: "2",
      petName: "Luna",
      guardianName: "Maria Santos",
      amount: 200,
      time: "15:15",
    },
    {
      id: "3",
      petName: "Max",
      guardianName: "Pedro Costa",
      amount: 120,
      time: "16:00",
    },
  ];

  return (
    <Widget id="recent-consultations" title="Consultas Recentes">
      <div className="space-y-3">
        {recentConsultations.map((consultation, index) => (
          <motion.div
            key={consultation.id}
            className="flex items-center justify-between p-3 bg-background-secondary rounded-md"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {consultation.petName}
                </p>
                <p className="text-xs text-text-tertiary">
                  {consultation.guardianName}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-success">
                R$ {consultation.amount}
              </p>
              <p className="text-xs text-text-tertiary">{consultation.time}</p>
            </div>
          </motion.div>
        ))}

        <motion.button
          className="w-full text-xs text-text-tertiary hover:text-text-primary transition-colors duration-200 mt-3"
          whileHover={{ scale: 1.02 }}
        >
          Ver todas as consultas →
        </motion.button>
      </div>
    </Widget>
  );
}
