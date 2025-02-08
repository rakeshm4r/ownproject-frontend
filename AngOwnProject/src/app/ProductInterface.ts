export interface Product {
  productId: number;
  productName: string;
  productPrice: number;
  noOfItems: number;
  categoryName: string;
  productImageBase64: string;
  productDescription?: string; // Optional description field
}
