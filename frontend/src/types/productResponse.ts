import type { Product } from "./product";

export type ProductResponse = {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
};
