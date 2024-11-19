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
export interface BasketItem {
  id: string;
  price: number;
  name: string;
  itemType: string;
  category1: string;
}
export interface Bill {
  items: BasketItem[];
  totalPrice: number;
  discountAmount: number;
}
