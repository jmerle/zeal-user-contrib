import { flags } from '@oclif/command';
import * as inquirer from 'inquirer';
import { BaseCommand } from './BaseCommand';
import { Docset, getAvailableDocsets } from './docsets';
import { getDocsetsDirectory } from './zeal';

// tslint:disable-next-line:no-var-requires
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));

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
    try {
      this.runSafe();
    } catch (err) {
      this.err(err.message);
    }
  }

  private async runSafe(): Promise<void> {
    let docsetsDirectory: string = this.flags['output-directory'];
    if (docsetsDirectory === undefined) {
      docsetsDirectory = getDocsetsDirectory();
    }

    const availableDocsets = await getAvailableDocsets();
    const selectedDocset = await this.selectDocset(availableDocsets);

    this.log(JSON.stringify(selectedDocset, null, 2));
  }

  private async selectDocset(availableDocsets: Docset[]): Promise<Docset> {
    const docsetNames = availableDocsets
      .map(docset => docset.name)
      .sort((a, b) => {
        return a.toLowerCase().localeCompare(b.toLowerCase());
      });

    const { selectedName } = await inquirer.prompt([
      {
        type: 'autocomplete',
        name: 'selectedName',
        message: 'Select a docset to add to Zeal',
        source: async (answersSoFar: string[], input: string) => {
          if (input === undefined) {
            return docsetNames;
          }

          input = input.toLowerCase();
          return docsetNames.filter(name => name.toLowerCase().includes(input));
        },
      },
    ]);

    return availableDocsets.find(docset => docset.name === selectedName);
  }
}

export = ZealUserContrib;
