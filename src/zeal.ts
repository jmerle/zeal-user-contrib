import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as ini from 'ini';
import * as Registry from 'winreg';

// Zeal uses QStandardPaths::DataLocation + '/docsets' as docsets directory
// See https://doc.qt.io/qt-5/qstandardpaths.html

function appendZeal(directory: string): string {
  return path.resolve(directory, 'Zeal/Zeal/docsets');
}

function getWindowsDirectories(): Promise<string[]> {
  return new Promise(resolve => {
    const defaultDirectories = [path.resolve(os.homedir(), 'AppData/Local'), process.env.PROGRAMDATA].map(appendZeal);

    const regKey = new Registry({
      hive: Registry.HKCU,
      key: '\\Software\\Zeal\\Zeal\\docsets',
    });

    regKey.values((err, items) => {
      if (err) {
        resolve(defaultDirectories);
      } else {
        const pathItem = items.find(item => item.name === 'path');

        if (pathItem !== undefined) {
          resolve([pathItem.value]);
        } else {
          resolve(defaultDirectories);
        }
      }
    });
  });
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

export async function getDocsetsDirectory(): Promise<string> {
  const directoriesToCheck = os.platform() === 'win32' ? await getWindowsDirectories() : getLinuxDirectories();

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
