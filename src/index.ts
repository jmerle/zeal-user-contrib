import { flags } from '@oclif/command';
import axios from 'axios';
import * as fs from 'fs-extra';
import * as inquirer from 'inquirer';
import * as path from 'path';
import { Readable } from 'stream';
import * as tar from 'tar';
import * as tempy from 'tempy';
import { BaseCommand } from './BaseCommand';
import { Docset, getAvailableDocsets } from './docsets';
import { getDocsetsDirectory } from './zeal';

// tslint:disable-next-line:no-var-requires
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));

// A mirror is a subdomain of kapeli.com where docsets are downloaded from
const availableMirrors = ['sanfrancisco', 'newyork', 'london', 'frankfurt'];

interface Metadata {
  // A link to the xml feed, zeal-user-contrib sets this to the zealusercontributions.herokuapp.com feed
  feed_url: string;

  // An array of archive url's
  urls: string[];

  name: string;
  title: string;
  version: string;
}

class ZealUserContrib extends BaseCommand {
  public static description = "conveniently add Dash's User Contributed docsets to Zeal";

  public static flags = {
    ...BaseCommand.flags,
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

  public async run(): Promise<void> {
    try {
      await this.runSafe();
    } catch (err) {
      this.err(err.message);
    }
  }

  private async runSafe(): Promise<void> {
    let docsetsDirectory: string = this.flags['output-directory'];
    if (docsetsDirectory === undefined) {
      docsetsDirectory = getDocsetsDirectory();
    }

    const docset = await this.selectDocset();
    const docsetDirectory = path.resolve(docsetsDirectory, `${docset.id}.docset`);
    const docsetExists = fs.existsSync(docsetDirectory);

    if (docsetExists) {
      if (!this.flags.force) {
        throw new Error(`${docsetDirectory} already exists, use --force to overwrite it`);
      }

      this.log(`Removing existing docset at ${docsetDirectory}`);
      fs.removeSync(docsetDirectory);
    }

    const metadata = this.getMetadata(docset);

    // By default a random url is chosen, just like how Zeal would download a docset
    // If a mirror is specified with --mirror, getMetadata() will ensure there is only one url available
    const archiveUrl = metadata.urls[Math.floor(Math.random() * metadata.urls.length)];

    this.log(`Downloading docset from ${archiveUrl}`);

    const tempPath = tempy.file({ name: `${docset.name}.tar.gz` });
    const archiveResponse = await axios.get<Readable>(archiveUrl, { responseType: 'arraybuffer' });
    fs.writeFileSync(tempPath, archiveResponse.data);

    this.log(`Extracting docset to ${docsetDirectory}`);

    fs.ensureDirSync(docsetDirectory);
    await tar.extract({
      file: tempPath,
      cwd: docsetDirectory,
      strip: 1,
    });

    if (docset.icon === undefined && docset['icon@2x'] === undefined) {
      this.log(`There are no icons available for ${docset.name}`);
    } else {
      this.log('Saving icons');

      if (docset.icon !== undefined) {
        this.saveIcon(docsetDirectory, 'icon', docset.icon);
      }

      if (docset['icon@2x'] !== undefined) {
        this.saveIcon(docsetDirectory, 'icon@2x', docset['icon@2x']);
      }
    }

    this.log('Saving metadata');
    const metaPath = path.resolve(docsetDirectory, 'meta.json');
    fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2));

    this.log(`Successfully added the ${docset.name} docset to Zeal!`);
    this.log('If Zeal is running, make sure to restart it for the docset to show up.');
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

  private getMetadata(docset: Docset): Metadata {
    const mirrors = this.flags.mirror !== undefined ? [this.flags.mirror] : availableMirrors;
    const mirrorUrls = mirrors.map(mirror => {
      return `https://${mirror}.kapeli.com/feeds/zzz/user_contributed/build/${docset.id}/${docset.archive}`;
    });

    return {
      feed_url: `https://zealusercontributions.herokuapp.com/docsets/${docset.id}.xml`,
      urls: mirrorUrls,
      name: docset.name,
      title: docset.name,
      version: docset.version,
    };
  }

  private saveIcon(docsetDirectory: string, name: string, base64: string): void {
    const imagePath = path.resolve(docsetDirectory, `${name}.png`);
    fs.writeFileSync(imagePath, Buffer.from(base64, 'base64'));
  }
}

export = ZealUserContrib;
