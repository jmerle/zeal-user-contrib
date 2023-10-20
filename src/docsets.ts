import fs from 'fs-extra';
import { got } from 'got';
import tar from 'tar';
import { temporaryFile } from 'tempy';
import { logger } from './logger.js';
import { Metadata } from './metadata.js';

export interface DocsetAuthor {
  name: string;
  link: string;
}

export interface DocsetVersion {
  version: string;
  archive: string;
  author?: DocsetAuthor;
}

/* eslint-disable @typescript-eslint/naming-convention */
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
/* eslint-enable @typescript-eslint/naming-convention */

export async function getAvailableDocsets(mirror?: string): Promise<Docset[]> {
  mirror = mirror !== undefined ? mirror + '.' : '';

  const url = `https://${mirror}kapeli.com/feeds/zzz/user_contributed/build/index.json`;
  const response = await got.get(url, { responseType: 'json' });

  const body = response.body as any;

  return Object.keys(body.docsets).map(key => {
    return {
      id: key,
      ...body.docsets[key],
    };
  });
}

export async function downloadDocset(
  docset: Docset,
  metadata: Metadata,
  showProgress: boolean = true,
): Promise<string> {
  return new Promise((resolve, reject) => {
    // By default a random url is chosen, just like how Zeal would download a docset
    // If a mirror is specified with --mirror, metadata.urls will only contain one url
    const archiveUrl = metadata.urls[Math.floor(Math.random() * metadata.urls.length)];

    // eslint-disable-next-line import/namespace
    const tempPath = temporaryFile({ name: `${docset.name}.tar.gz` });
    const writeStream = fs
      .createWriteStream(tempPath)
      .on('finish', () => resolve(tempPath))
      .on('error', err => reject(err));

    logger.info(`Downloading docset from ${archiveUrl}`);
    if (showProgress) {
      const bar = logger.progress();
      got
        .stream(archiveUrl)
        .on('downloadProgress', progress => bar.update(progress.percent))
        .on('error', err => reject(err))
        .pipe(writeStream);
    } else {
      got
        .stream(archiveUrl)
        .on('error', err => reject(err))
        .pipe(writeStream);
    }
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
