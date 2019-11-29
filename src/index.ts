import { flags } from '@oclif/command';
import { BaseCommand } from './BaseCommand';

class ZealUserContrib extends BaseCommand {
  public static description = "conveniently add Dash's User Contributed docsets to Zeal";

  public static flags = {
    ...BaseCommand.flags,
    outputDirectory: flags.string({
      char: 'o',
      description: "path to Zeal's docsets directory, overriding the default search for it",
    }),
  };

  public async run(): Promise<void> {
    this.log('Hello world!');
  }
}

export = ZealUserContrib;
