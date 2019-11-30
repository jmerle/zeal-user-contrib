import * as fs from 'fs-extra';
import * as ini from 'ini';
import * as os from 'os';
import * as path from 'path';
import { enumerateValuesSafe, HKEY } from 'registry-js';

// Zeal uses QStandardPaths::DataLocation + '/docsets' as docsets directory
// See https://doc.qt.io/qt-5/qstandardpaths.html

function appendZeal(directory: string): string {
  return path.resolve(directory, 'Zeal/Zeal/docsets');
}

function getWindowsDirectories(): string[] {
  const registryValues = enumerateValuesSafe(HKEY.HKEY_CURRENT_USER, 'Software\\Zeal\\Zeal\\docsets');
  const docsetValue = registryValues.find(value => value.name === 'path');

  if (docsetValue !== undefined) {
    return [docsetValue.data as string];
  }

  return [path.resolve(os.homedir(), 'AppData/Local'), process.env.PROGRAMDATA].map(appendZeal);
}

function getLinuxDirectories(): string[] {
  const configPath = path.resolve(os.homedir(), '.config/Zeal/Zeal.conf');
  if (fs.existsSync(configPath)) {
    const config = ini.parse(fs.readFileSync(configPath, 'utf-8'));

    if (config?.docsets?.path) {
      return [config.docsets.path];
    }
  }

  return [path.resolve(os.homedir(), '.local/share'), '/usr/local/share', '/usr/share'].map(appendZeal);
}

export function getDocsetsDirectory(): string {
  const directoriesToCheck = os.platform() === 'win32' ? getWindowsDirectories() : getLinuxDirectories();

  for (const directory of directoriesToCheck) {
    if (fs.existsSync(directory)) {
      return directory;
    }
  }

  const msg = `
Could not locate Zeal's docsets directory, please specify it with --output-directory.

Checked directories:
${directoriesToCheck.map(directory => `* ${directory}`).join('\n')}
  `.trim();

  throw new Error(msg);
}
