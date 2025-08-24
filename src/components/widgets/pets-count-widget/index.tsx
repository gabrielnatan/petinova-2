import { Heart } from "lucide-react";
import { Widget } from "..";
import { usePets } from "@/store";

export function PetsCountWidget() {
  const { pets } = usePets();
  const activePets = pets.filter((pet) => !pet.deathDate);
  const newPetsThisMonth = pets.filter((pet) => {
    const petDate = new Date(pet.created_at);
    const now = new Date();
    return (
      petDate.getMonth() === now.getMonth() &&
      petDate.getFullYear() === now.getFullYear()
    );
  });

  return (
    <Widget id="pets-count" title="Total de Pets">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-3xl font-bold text-primary-500">
            {activePets.length}
          </span>
          <Heart className="w-8 h-8 text-primary-400" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-secondary">Novos este mês</span>
            <span className="text-sm font-medium text-success">
              +{newPetsThisMonth.length}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-text-secondary">Ativos</span>
            <span className="text-sm font-medium text-text-primary">
              {activePets.length}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-text-secondary">Total</span>
            <span className="text-sm font-medium text-text-tertiary">
              {pets.length}
            </span>
          </div>
        </div>
      </div>
    </Widget>
  );
}
