export type SearchParams = Promise<{
  [key: string]: string | string[] | undefined;
}>;
export type Params = Promise<{ slug: string; productSlug: string }>;
export interface CustomFile extends File {
  arrayBuffer(): Promise<ArrayBuffer>;
}
export interface CategoryFormValues {
  name: string;
  description: string;
  active: boolean;
  imageFile: File[];
}
