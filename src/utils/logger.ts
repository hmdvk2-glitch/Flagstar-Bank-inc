export const SystemLogger = {
  log(action: string, domain: string, details: string) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${domain}] [${action}] ${details}`);
  },

  error(module: string, message: string, trace?: string) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [ERROR] [${module}] ${message}`, trace);
  }
};
