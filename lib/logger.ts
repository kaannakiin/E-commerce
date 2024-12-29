// @/lib/logger.ts
interface LogData {
  [key: string]: unknown;
}

class Logger {
  private formatMessage(message: string, data?: LogData): string {
    if (!data) return message;
    return `${message} ${JSON.stringify(data, null, 2)}`;
  }

  error(message: string, data?: LogData) {
    console.error(this.formatMessage(message, data));
  }

  info(message: string, data?: LogData) {
    console.info(this.formatMessage(message, data));
  }

  warn(message: string, data?: LogData) {
    console.warn(this.formatMessage(message, data));
  }

  debug(message: string, data?: LogData) {
    console.debug(this.formatMessage(message, data));
  }
}

export const logger = new Logger();
