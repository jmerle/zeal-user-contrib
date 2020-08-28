import * as path from 'path';
import * as fs from 'fs-extra';
import { Docset } from './docsets';
import { logger } from './logger';

function saveIcon(docsetDirectory: string, name: string, base64: string): void {
  const imagePath = path.resolve(docsetDirectory, `${name}.png`);
  logger.info(`Writing ${name} to ${imagePath}`);
  fs.writeFileSync(imagePath, Buffer.from(base64, 'base64'));
}

export function saveIcons(docset: Docset, docsetDirectory: string): void {
  if (docset.icon === undefined && docset['icon@2x'] === undefined) {
    logger.warn(`There are no icons available for ${docset.name}`);
  } else {
    if (docset.icon !== undefined) {
      saveIcon(docsetDirectory, 'icon', docset.icon);
    }

    if (docset['icon@2x'] !== undefined) {
      saveIcon(docsetDirectory, 'icon@2x', docset['icon@2x']);
    }
  }
}
