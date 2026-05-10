export const SecurityEngine = {
  /**
   * Validate session integrity
   */
  isSessionSecure(session: any): boolean {
    if (!session || !session.user) return false;
    
    // Check for required metadata
    const role = session.user.user_metadata?.role || session.user.app_metadata?.role;
    return !!role;
  },

  /**
   * Enforce PIN policy
   */
  validatePinPolicy(pin: string): boolean {
    // 4-6 digits, not sequential, not all same
    const isNumeric = /^\d{4,6}$/.test(pin);
    const isSequential = '01234567890'.includes(pin) || '09876543210'.includes(pin);
    const isAllSame = pin.split('').every(char => char === pin[0]);

    return isNumeric && !isSequential && !isAllSame;
  }
};
