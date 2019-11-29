// tslint:disable:no-console

import * as chalk from 'chalk';

class Logger {
  private prefixLength = 7;

  public info(...params: any[]): void {
    const prefix = chalk.blue(this.padPrefix('info'));
    console.log(prefix, ...params);
  }

  public warn(...params: any[]): void {
    const prefix = chalk.yellow(this.padPrefix('warn'));
    console.log(prefix, ...params);
  }

  public error(...params: any[]): void {
    const prefix = chalk.red(this.padPrefix('error'));
    console.error(prefix, ...params);
  }

  public success(...params: any[]): void {
    const prefix = chalk.green(this.padPrefix('success'));
    console.error(prefix, ...params);
  }

  private padPrefix(prefix: string): string {
    return ' '.repeat(this.prefixLength - prefix.length) + prefix;
  }
}

export const logger = new Logger();
