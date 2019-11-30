import * as fs from 'fs-extra';
import * as got from 'got';
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
  const response = await got('https://kapeli.com/feeds/zzz/user_contributed/build/index.json', {
    json: true,
  });

  return Object.keys(response.body.docsets).map(key => {
    return {
      id: key,
      ...response.body.docsets[key],
    };
  });
}

export async function downloadDocset(docset: Docset, metadata: Metadata, docsetDirectory: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // By default a random url is chosen, just like how Zeal would download a docset
    // If a mirror is specified with --mirror, metadata.urls will only contain one url
    const archiveUrl = metadata.urls[Math.floor(Math.random() * metadata.urls.length)];

    const tempPath = tempy.file({ name: `${docset.name}.tar.gz` });
    const writeStream = fs
      .createWriteStream(tempPath)
      .on('finish', () => resolve(tempPath))
      .on('error', err => reject(err));

    logger.info(`Downloading docset from ${archiveUrl}`);
    const bar = logger.progress();

    got
      .stream(archiveUrl)
      .on('downloadProgress', progress => bar.update(progress.percent))
      .on('error', err => reject(err))
      .pipe(writeStream);
  });
}

export async function extractDocset(tempPath: string, docsetDirectory: string): Promise<void> {
  logger.info(`Extracting docset to ${docsetDirectory}`);

  fs.ensureDirSync(docsetDirectory);
  await tar.extract({
    file: tempPath,
    cwd: docsetDirectory,
    strip: 1,
  });

  fs.removeSync(tempPath);
}
