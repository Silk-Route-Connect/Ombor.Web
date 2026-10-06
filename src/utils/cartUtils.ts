import type { CartItem } from "hooks/transactions/useTransactionEntry";
import { Product } from "models/product";

export interface AddToCartOptions {
	/** The line's starting price (sale or supply price). */
	unitPrice: number;
	/** A scanned packaging barcode: add one whole package. */
	asPackage?: boolean;
	/** The cart can count a line in packages (POS); otherwise a package adds its base units. */
	packages?: boolean;
}

/**
 * Adds a product to a cart: a new line, or one more display unit on its line —
 * a whole package when the line counts in packages or a package barcode was
 * scanned. Quantities stay in base units (rule 21).
 */
export function addToCart(
	items: CartItem[],
	product: Product,
	{ unitPrice, asPackage = false, packages = false }: AddToCartOptions,
): CartItem[] {
	const packSize = product.packaging?.size ?? null;
	const scannedPack = asPackage && packSize != null;
	const existing = items.find((item) => item.product.id === product.id);

	if (existing) {
		const step = scannedPack || (existing.inPackages && packSize != null) ? (packSize ?? 1) : 1;
		return items.map((item) =>
			item.product.id === product.id ? { ...item, quantity: item.quantity + step } : item,
		);
	}

	return [
		...items,
		{
			product,
			quantity: scannedPack ? packSize : 1,
			unitPrice,
			discountValue: 0,
			discountType: "Percentage",
			...(scannedPack && packages ? { inPackages: true } : {}),
		},
	];
}
