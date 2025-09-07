import { Heart } from "lucide-react";
import { Widget } from "..";
import { useConsultations } from "@/store";
import { formatCurrency } from "@/lib/utils";

export function RecentConsultationsWidget() {
  const { consultations } = useConsultations();
  
  // Pegar as 3 consultas mais recentes
  const recentConsultations = consultations
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);

  return (
    <Widget id="recent-consultations" title="Consultas Recentes">
      <div className="space-y-3">
        {recentConsultations.map((consultation) => (
          <div
            key={consultation.consultation_id}
            className="flex items-center justify-between p-3 bg-background-secondary rounded-md"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {consultation.pet.name}
                </p>
                <p className="text-xs text-text-tertiary">
                  {consultation.guardian?.name || 'N/A'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-success">
                {formatCurrency(150)} {/* Valor fixo por enquanto */}
              </p>
              <p className="text-xs text-text-tertiary">
                {new Date(consultation.created_at).toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
        ))}

        <button className="w-full text-xs text-text-tertiary hover:text-text-primary transition-colors duration-200 mt-3">
          Ver todas as consultas →
        </button>
      </div>
    </Widget>
  );
}
