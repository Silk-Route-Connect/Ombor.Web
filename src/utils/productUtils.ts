import { Product } from "models/product";

export function isAvialableForSale(product: Product) {
	return product.quantityInStock >= 0;
}
