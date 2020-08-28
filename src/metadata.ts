import * as path from 'path';
import * as fs from 'fs-extra';
import { Docset } from './docsets';
import { logger } from './logger';

export interface Metadata {
  // A link to the xml feed, zeal-user-contrib sets this to a zealusercontributions.herokuapp.com feed
  // eslint-disable-next-line @typescript-eslint/naming-convention
  feed_url: string;

  // An array of archive url's
  urls: string[];

  // Should be Docset.id
  name: string;

  // Should be Docset.title
  title: string;

  // Should be Docset.version
  version: string;
}

// A mirror is a subdomain of kapeli.com where docsets are downloaded from
export const availableMirrors = ['sanfrancisco', 'newyork', 'london', 'frankfurt'];

export function getMetadata(docset: Docset, mirror?: string): Metadata {
  const mirrors = mirror !== undefined ? [mirror] : availableMirrors;
  const mirrorUrls = mirrors.map(m => {
    return `https://${m}.kapeli.com/feeds/zzz/user_contributed/build/${docset.id}/${docset.archive}`;
  });

  return {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    feed_url: `https://zealusercontributions.herokuapp.com/docsets/${docset.id}.xml`,
    urls: mirrorUrls,
    name: docset.id,
    title: docset.name,
    version: docset.version,
  };
}

export function saveMetadata(metadata: Metadata, docsetDirectory: string): void {
  const metaPath = path.resolve(docsetDirectory, 'meta.json');
  logger.info(`Writing metadata to ${metaPath}`);
  fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2));
}
