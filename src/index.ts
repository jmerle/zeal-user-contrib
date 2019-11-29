import { flags } from '@oclif/command';
import { BaseCommand } from './BaseCommand';
import { getDocsetsDirectory } from './zeal';

class ZealUserContrib extends BaseCommand {
  public static description = "conveniently add Dash's User Contributed docsets to Zeal";

  public static flags = {
    ...BaseCommand.flags,
    'output-directory': flags.string({
      char: 'o',
      description: "path to Zeal's docsets directory, overriding the default search for it",
    }),
  };

  public async run(): Promise<void> {
    let docsetsDirectory: string = this.flags['output-directory'];

    if (docsetsDirectory === undefined) {
      try {
        docsetsDirectory = getDocsetsDirectory();
      } catch (err) {
        this.err(err.message);
      }
    }
  }
}

export = ZealUserContrib;
