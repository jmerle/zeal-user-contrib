import axios from 'axios';

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
