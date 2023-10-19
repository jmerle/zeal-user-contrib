import * as path from 'path';
import { Command, Option } from 'commander';
import * as fs from 'fs-extra';
import * as inquirer from 'inquirer';
import { table, getBorderCharacters } from 'table';
import { Docset, downloadDocset, extractDocset, getAvailableDocsets } from './docsets';
import { saveIcons } from './icons';
import { logger } from './logger';
import { availableMirrors, getMetadata, saveMetadata } from './metadata';
import { getDocsetsDirectory } from './zeal';

// tslint:disable-next-line:no-var-requires
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));

async function selectDocset(mirror?: string): Promise<Docset> {
  const availableDocsets = await getAvailableDocsets(mirror);
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

async function listAllDocsets(mirror?: string): Promise<void> {
  const availableDocsets = await getAvailableDocsets(mirror);
  const docsetsTable = [['Name', 'ID']];
  availableDocsets
    .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
    .forEach(docset => docsetsTable.push([docset.name, docset.id]));

  const output = table(docsetsTable, {
    border: getBorderCharacters('void'),
    columnDefault: {
      paddingLeft: 0,
      paddingRight: 1,
    },
    singleLine: true,
    drawHorizontalLine: () => false,
  });

  console.log(output.trim());
}

async function runWithOptions(options: any): Promise<void> {
  let docsetsDirectory: string = options.outputDirectory;
  if (docsetsDirectory === undefined) {
    docsetsDirectory = await getDocsetsDirectory();
  }

  if (options.listAll) {
    await listAllDocsets();
    return;
  }

  let docsetsToInstall: Docset[] = [];

  if (options.install) {
    const availableDocsets = await getAvailableDocsets(options.mirror);
    docsetsToInstall = availableDocsets.filter(docset => options.install.includes(docset.id));
  } else {
    const docset = await selectDocset(options.mirror);
    docsetsToInstall = [docset];
  }

  const tasks = docsetsToInstall.map(async docset => {
    const docsetDirectory = path.resolve(docsetsDirectory, `${docset.id}.docset`);

    if (fs.existsSync(docsetDirectory)) {
      if (!options.force) {
        throw new Error(`${docsetDirectory} already exists, use --force to overwrite it`);
      }

      logger.warn(`Removing existing docset at ${docsetDirectory}`);
      fs.removeSync(docsetDirectory);
    }

    const metadata = getMetadata(docset, options.mirror);

    const tempPath = await downloadDocset(docset, metadata, docsetsToInstall.length === 1);
    await extractDocset(tempPath, docsetDirectory);
    saveIcons(docset, docsetDirectory);
    saveMetadata(metadata, docsetDirectory);

    logger.success(`Successfully added the ${docset.name} docset to Zeal`);
  });

  await Promise.allSettled(tasks);

  logger.info('If Zeal is running, make sure to restart it for the docset to show up');
}

export async function run(): Promise<void> {
  const program = new Command()
    .name('zeal-user-contrib')
    .version(require('../package.json').version)
    .addOption(
      new Option('-m, --mirror <mirror>', 'the mirror to use, by default a random one is chosen').choices(
        availableMirrors,
      ),
    )
    .option('-l, --list-all', 'List all available docsets without a pager')
    .option('-o, --output-directory <path>', "path to Zeal's docsets directory, overriding the default search for it")
    .option('-i, --install <ids...>', 'Install packages for the provided IDs')
    .option('-f, --force', 'overwrite existing docsets')
    .parse(process.argv);

  runWithOptions(program.opts()).catch((err: Error) => {
    logger.error(err.message);
    process.exit(1);
  });
}
