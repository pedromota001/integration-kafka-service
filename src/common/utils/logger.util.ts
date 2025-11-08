/**
 * Simple logger utility with colored console output
 * Sufficient for academic project - can be replaced with Winston/Pino later
 */
export class Logger {
  constructor(private readonly context: string) {}

  log(message: string, data?: any) {
    const timestamp = new Date().toISOString();
    console.log(
      `[${timestamp}] [${this.context}] ✅ ${message}`,
      data ? JSON.stringify(data, null, 2) : '',
    );
  }

  error(message: string, error?: any) {
    const timestamp = new Date().toISOString();
    console.error(
      `[${timestamp}] [${this.context}] ❌ ${message}`,
      error?.stack || error || '',
    );
  }

  warn(message: string, data?: any) {
    const timestamp = new Date().toISOString();
    console.warn(
      `[${timestamp}] [${this.context}] ⚠️  ${message}`,
      data ? JSON.stringify(data, null, 2) : '',
    );
  }

  debug(message: string, data?: any) {
    const timestamp = new Date().toISOString();
    console.debug(
      `[${timestamp}] [${this.context}] 🐛 ${message}`,
      data ? JSON.stringify(data, null, 2) : '',
    );
  }
}
