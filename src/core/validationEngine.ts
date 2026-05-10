export const ValidationEngine = {
  /**
   * Validate email format
   */
  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  /**
   * Validate account number format
   */
  isValidAccountNumber(accNum: string): boolean {
    return /^FLAG-\d{6}$/.test(accNum);
  },

  /**
   * Sanitize inputs
   */
  sanitize(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }
};
