import { petAPI, type Pet, type CreatePetData, type UpdatePetData } from '@/lib/api/pets';

class PetService {
  async getAllPets(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    try {
      const response = await petAPI.getPets(params);
      return {
        success: true,
        data: response,
        error: null
      };
    } catch (error) {
      console.error('Erro ao buscar pets:', error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Erro ao buscar pets'
      };
    }
  }

  async getPetById(id: string) {
    try {
      const response = await petAPI.getPet(id);
      return {
        success: true,
        data: response.pet,
        error: null
      };
    } catch (error) {
      console.error('Erro ao buscar pet:', error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Pet não encontrado'
      };
    }
  }

  async createPet(petData: CreatePetData) {
    try {
      const response = await petAPI.createPet(petData);
      return {
        success: true,
        data: response.pet,
        error: null
      };
    } catch (error) {
      console.error('Erro ao criar pet:', error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Erro ao cadastrar pet'
      };
    }
  }

  async updatePet(id: string, petData: UpdatePetData) {
    try {
      const response = await petAPI.updatePet(id, petData);
      return {
        success: true,
        data: response.pet,
        error: null
      };
    } catch (error) {
      console.error('Erro ao atualizar pet:', error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Erro ao atualizar pet'
      };
    }
  }

  async deletePet(id: string) {
    try {
      await petAPI.deletePet(id);
      return {
        success: true,
        error: null
      };
    } catch (error) {
      console.error('Erro ao excluir pet:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao excluir pet'
      };
    }
  }

  async searchPets(search: string) {
    try {
      const pets = await petAPI.searchPets(search);
      return {
        success: true,
        data: pets,
        error: null
      };
    } catch (error) {
      console.error('Erro ao buscar pets:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Erro na busca'
      };
    }
  }

  // Utility methods
  calculateAge(birthDate?: string): string {
    if (!birthDate) return 'Idade não informada';
    
    const today = new Date();
    const birth = new Date(birthDate);
    
    if (isNaN(birth.getTime())) {
      return 'Data inválida';
    }
    
    const diffTime = Math.abs(today.getTime() - birth.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);

    if (years > 0) {
      return `${years} ano${years > 1 ? "s" : ""}`;
    } else {
      return `${months} mes${months > 1 ? "es" : ""}`;
    }
  }

  formatPetForDisplay(pet: Pet): Pet & { displayAge: string } {
    return {
      ...pet,
      displayAge: this.calculateAge(pet.birthDate)
    };
  }

  getPetSpeciesStats(pets: Pet[]): { dogs: number; cats: number; others: number } {
    const stats = {
      dogs: 0,
      cats: 0,
      others: 0
    };

    pets.forEach(pet => {
      const species = pet.species.toLowerCase();
      if (species.includes('cão') || species.includes('dog') || species.includes('cachorro')) {
        stats.dogs++;
      } else if (species.includes('gato') || species.includes('cat')) {
        stats.cats++;
      } else {
        stats.others++;
      }
    });

    return stats;
  }
}

export const petService = new PetService();
export type { Pet, CreatePetData, UpdatePetData };