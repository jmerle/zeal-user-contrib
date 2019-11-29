import Command, { flags } from '@oclif/command';
import { OutputArgs, OutputFlags } from '@oclif/parser';
import * as signale from 'signale';

export abstract class BaseCommand extends Command {
  public static flags = {
    help: flags.help({ char: 'h' }),
    version: flags.version(),
  };

  protected args: OutputArgs<any> = {};
  protected flags: OutputFlags<any> = {};

  protected async init(): Promise<void> {
    const data = this.parse(this.constructor as any);

    this.args = data.args;
    this.flags = data.flags as OutputFlags<any>;
  }

  public async run(): Promise<void> {
    try {
      await this.runSafe();
    } catch (err) {
      signale.error(err.message);
      this.exit(1);
    }
  }

  protected abstract runSafe(): Promise<void>;
}
