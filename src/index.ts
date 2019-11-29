import Command, { flags } from '@oclif/command';
import { OutputFlags } from '@oclif/parser';
import * as fs from 'fs-extra';
import * as inquirer from 'inquirer';
import * as path from 'path';
import * as signale from 'signale';
import { Docset, downloadDocset, getAvailableDocsets } from './docsets';
import { saveIcons } from './icons';
import { availableMirrors, getMetadata, saveMetadata } from './metadata';
import { getDocsetsDirectory } from './zeal';

// tslint:disable-next-line:no-var-requires
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));

class ZealUserContrib extends Command {
  public static description = "conveniently add Dash's User Contributed docsets to Zeal";

  public static flags = {
    help: flags.help({ char: 'h' }),
    version: flags.version(),
    mirror: flags.string({
      char: 'm',
      description: 'the mirror to use, by default a random one is chosen',
      options: availableMirrors,
    }),
    'output-directory': flags.string({
      char: 'o',
      description: "path to Zeal's docsets directory, overriding the default search for it",
    }),
    force: flags.boolean({
      char: 'f',
      description: 'overwrite existing docsets',
    }),
  };

  protected flags: OutputFlags<typeof ZealUserContrib.flags>;

  public async run(): Promise<void> {
    this.flags = this.parse(ZealUserContrib).flags;

    try {
      await this.runSafe();
    } catch (err) {
      signale.error(err.message);
      this.exit(1);
    }
  }

  private async runSafe(): Promise<void> {
    let docsetsDirectory: string = this.flags['output-directory'];
    if (docsetsDirectory === undefined) {
      docsetsDirectory = getDocsetsDirectory();
    }

    const docset = await this.selectDocset();
    const docsetDirectory = path.resolve(docsetsDirectory, `${docset.id}.docset`);

    if (fs.existsSync(docsetDirectory)) {
      if (!this.flags.force) {
        throw new Error(`${docsetDirectory} already exists, use --force to overwrite it`);
      }

      signale.info(`Removing existing docset at ${docsetDirectory}`);
      fs.removeSync(docsetDirectory);
    }

    const metadata = getMetadata(docset, this.flags.mirror);

    await downloadDocset(docset, metadata, docsetDirectory);
    saveIcons(docset, docsetDirectory);
    saveMetadata(metadata, docsetDirectory);

    signale.success(`Successfully added the ${docset.name} docset to Zeal`);
    signale.info('If Zeal is running, make sure to restart it for the docset to show up');
  }

  private async selectDocset(): Promise<Docset> {
    const availableDocsets = await getAvailableDocsets();
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
