/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from 'fs';
import * as path from 'path';

class Logger {
  private logCount: number;
  private logFilePath: string | null = null;

  constructor(private logDir: string = 'logs') {
    this.logCount = 0;
  }

  private initializeLogFilePath(): void {
    if (this.logFilePath === null) {
      const timestamp = Math.floor(Date.now() / 1000);
      this.logFilePath = path.join(this.logDir, `log-${timestamp}.txt`);

      // Ensure the log directory exists
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true });
      }
    }
  }

  log(message: any, additionalMessage?: any): void {
    this.initializeLogFilePath();
    this.logCount += 1;

    const formatMessage = (msg: any): string => {
      if (typeof msg === 'object') {
        return JSON.stringify(msg, null, 2);
      }
      return msg;
    };

    let logMessage;
    if (additionalMessage) {
      logMessage = `[${this.logCount}: ${formatMessage(message)}] ${formatMessage(additionalMessage)}\n\n`;
    } else {
      logMessage = `[${this.logCount}] ${formatMessage(message)}\n\n`;
    }
    fs.appendFileSync(this.logFilePath!, logMessage);
  }
}

const logger = new Logger();

export { logger, Logger };
