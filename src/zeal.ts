import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

// Zeal uses QStandardPaths::DataLocation + '/docsets' as docsets directory
// See https://doc.qt.io/qt-5/qstandardpaths.html

function getWindowsDirectories(): string[] {
  return [path.resolve(os.homedir(), 'AppData/Local'), process.env.PROGRAMDATA];
}

function getLinuxDirectories(): string[] {
  return [path.resolve(os.homedir(), '.local/share'), '/usr/local/share', '/usr/share'];
}

export function getDocsetsDirectory(): string {
  let directoriesToCheck = os.platform() === 'win32' ? getWindowsDirectories() : getLinuxDirectories();
  directoriesToCheck = directoriesToCheck.map(directory => path.resolve(directory, 'Zeal/Zeal/docsets'));

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
