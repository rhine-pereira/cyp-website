export type Product = {
  id: string;
  title: string;
  description: string;
  images: string[];
  price: number;
  compareAtPrice?: number;
  inStock: boolean;
  active?: boolean;
};
