import axios from 'axios';
import * as fs from 'fs-extra';
import { Readable } from 'stream';
import * as tar from 'tar';
import * as tempy from 'tempy';
import { logger } from './logger';
import { Metadata } from './metadata';

export interface DocsetAuthor {
  name: string;
  link: string;
}

export interface DocsetVersion {
  version: string;
  archive: string;
  author?: DocsetAuthor;
}

export interface Docset {
  // Directory-name friendly
  id: string;

  // Display friendly, possibly directory-name unfriendly
  name: string;

  version: string;
  specific_version: DocsetVersion[];

  archive: string;
  aliases: string[];

  // Base64 strings of the icon
  icon?: string;
  'icon@2x'?: string;

  author: DocsetAuthor;
}

export async function getAvailableDocsets(): Promise<Docset[]> {
  const response = await axios.get('https://kapeli.com/feeds/zzz/user_contributed/build/index.json', {
    responseType: 'json',
  });

  return Object.keys(response.data.docsets).map(key => {
    return {
      id: key,
      ...response.data.docsets[key],
    };
  });
}

export async function downloadDocset(docset: Docset, metadata: Metadata, docsetDirectory: string): Promise<void> {
  // By default a random url is chosen, just like how Zeal would download a docset
  // If a mirror is specified with --mirror, metadata.urls will only contain one url
  const archiveUrl = metadata.urls[Math.floor(Math.random() * metadata.urls.length)];

  logger.info(`Downloading docset from ${archiveUrl}`);

  const tempPath = tempy.file({ name: `${docset.name}.tar.gz` });
  const archiveResponse = await axios.get<Readable>(archiveUrl, { responseType: 'arraybuffer' });
  fs.writeFileSync(tempPath, archiveResponse.data);

  logger.info(`Extracting docset to ${docsetDirectory}`);

  fs.ensureDirSync(docsetDirectory);
  await tar.extract({
    file: tempPath,
    cwd: docsetDirectory,
    strip: 1,
  });

  fs.removeSync(tempPath);
}
