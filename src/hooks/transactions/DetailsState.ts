import { useCallback, useEffect, useMemo, useState } from "react";
import {
	TransactionFormLinePayload,
	TransactionFormMode,
} from "components/transaction/Form/TransactionForm";
import { Partner } from "models/partner";
import { Product } from "models/product";
import { Template, TemplateItem } from "models/template";
import { useStore } from "stores/StoreContext";

export interface DetailsHook {
	selectedPartner: Partner | null;
	setSelectedPartner(p: Partner | null): void;

	selectedTemplate: Template | null;
	setSelectedTemplate(t: Template | null): void;

	selectedProduct: Product | null;
	setSelectedProduct(p: Product | null): void;

	lines: TransactionFormLinePayload[];
	addLine(product: Product): void;
	updateLine(productId: number, patch: Partial<TransactionFormLinePayload>): void;
	removeLine(productId: number): void;

	totalDueLocal: number;

	detailsAreValid: boolean;
}

export function useTransactionDetails(mode: TransactionFormMode): DetailsHook {
	const { partnerStore, templateStore, productStore } = useStore();

	const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
	const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

	useEffect(() => {
		partnerStore.setSelectedPartner(selectedPartner?.id);
		templateStore.setSelectedPartner(selectedPartner);
	}, [partnerStore, templateStore, selectedPartner]);

	const [lines, setLines] = useState<TransactionFormLinePayload[]>([]);

	const getMaxQty = (productId: number): number | undefined => {
		if (mode !== "Sale" || productStore.allProducts === "loading") {
			return undefined;
		}

		return productStore.allProducts.find((p) => p.id === productId)?.quantityInStock;
	};

	const addLine = useCallback(
		(product: Product) => {
			if (mode === "Sale" && product.quantityInStock <= 0) {
				return;
			}

			setLines((prev) => {
				if (prev.some((line) => line.productId === product.id)) {
					return prev;
				}

				return [
					...prev,
					{
						productId: product.id,
						productName: product.name,
						unitPrice: mode === "Sale" ? product.salePrice : product.supplyPrice,
						quantity: 1,
						discount: 0,
					},
				];
			});
		},
		[mode],
	);

	const updateLine = useCallback(
		(productId: number, patch: Partial<TransactionFormLinePayload>) =>
			setLines((prev) =>
				prev.map((line) => {
					if (line.productId !== productId) {
						return line;
					}

					if (patch.quantity !== undefined) {
						const max = getMaxQty(productId);
						patch.quantity = max !== undefined ? Math.min(patch.quantity, max) : patch.quantity;
					}

					return { ...line, ...patch };
				}),
			),
		[getMaxQty],
	);

	const removeLine = useCallback(
		(productId: number) => setLines((prev) => prev.filter((l) => l.productId !== productId)),
		[],
	);

	const totalDueLocal = useMemo(
		() =>
			lines.reduce((sum, l) => sum + l.unitPrice * l.quantity * (1 - (l.discount ?? 0) / 100), 0),
		[lines],
	);

	useEffect(() => {
		if (!selectedTemplate) {
			return;
		}

		const items = selectedTemplate.items ?? [];

		setLines(
			items.map((it: TemplateItem) => ({
				productId: it.productId,
				productName: it.productName,
				unitPrice: it.unitPrice,
				quantity: it.quantity,
				discount: it.discount ?? 0,
			})),
		);
	}, [selectedTemplate]);

	const linesValid = useMemo(
		() => lines.every((line) => line.quantity > 0 && line.unitPrice > 0),
		[lines],
	);

	const detailsAreValid = linesValid && !!selectedPartner;

	return {
		selectedPartner,
		setSelectedPartner,

		selectedTemplate,
		setSelectedTemplate,

		selectedProduct,
		setSelectedProduct,

		lines,
		addLine,
		updateLine,
		removeLine,

		totalDueLocal,

		detailsAreValid,
	};
}
