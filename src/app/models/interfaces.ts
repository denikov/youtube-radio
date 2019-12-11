export interface NextSong {
  id: string;
  name: string;
}

export interface SongHistory {
  param: string;
  title?: string;
  id: string;
  author: string;
}

export interface AudioInfo {
  id: string;
  sources: Array<any>;
  title: string;
  length: string;
  related: Array<any>;
  author: string;
  active?: boolean;
};
