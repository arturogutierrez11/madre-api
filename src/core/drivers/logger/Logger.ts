export class Logger {
  private static formatMessage(level: string, message: string): string {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message: message,
      service: process.env.SERVICE_NAME,
    };
    return JSON.stringify(logEntry);
  }

  public static error(message: string): void {
    const formattedMessage = this.formatMessage('error', message);
    console.error(formattedMessage);
  }

  public static warn(message: string): void {
    const formattedMessage = this.formatMessage('warn', message);
    console.warn(formattedMessage);
  }

  public static info(message: string): void {
    const formattedMessage = this.formatMessage('info', message);
    console.info(formattedMessage);
  }

  public static debug(message: string): void {
    const formattedMessage = this.formatMessage('debug', message);
    console.debug(formattedMessage);
  }
}
