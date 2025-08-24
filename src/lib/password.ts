import bcrypt from 'bcryptjs';

export class PasswordService {
  private static readonly SALT_ROUNDS = 12;

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Senha deve ter pelo menos 8 caracteres');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra maiúscula');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra minúscula');
    }

    if (!/\d/.test(password)) {
      errors.push('Senha deve conter pelo menos um número');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?]/.test(password)) {
      errors.push('Senha deve conter pelo menos um caractere especial');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}