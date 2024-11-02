export type SearchParams = Promise<{
  [key: string]: string | string[] | undefined;
}>;
export type Params = Promise<{ slug: string }>;
export interface CustomFile extends File {
  arrayBuffer(): Promise<ArrayBuffer>;
}
