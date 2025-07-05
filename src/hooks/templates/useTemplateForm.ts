import { useCallback, useEffect, useMemo, useState } from "react";
import {
	TemplateFormItemPayload,
	TemplateFormPayload,
} from "components/template/Modal/TemplateFormModal";
import { Partner } from "models/partner";
import { Product } from "models/product";
import { Template, TemplateType } from "models/template";
import { IPartnerStore } from "stores/PartnerStore";
import { IProductStore } from "stores/ProductStore";

export interface ITemplateFormState {
	totalDue: number;
	totalDiscount: number;
	isFormValid: boolean;
	isFormTouched: boolean;

	partner: Partner | null;
	setPartner(partner: Partner | null): void;

	name: string | null;
	setName(name: string | null): void;

	type: TemplateType | null;
	setType(type: TemplateType | null): void;

	selectedProduct: Product | null;
	setSelectedProduct(produc: Product | null): void;

	items: TemplateFormItemPayload[];
	addItem(): void;
	updateItem(index: number, patch: Partial<TemplateFormItemPayload>): void;
	removeItem(index: number): void;

	reset(): void;
	buildPayload(): TemplateFormPayload | null;
}

interface TemplateFormOptions {
	initial?: Template | null;
	productStore: IProductStore;
	partnerStore: IPartnerStore;
}

export const useTemplateForm = ({
	initial,
	partnerStore,
	productStore,
}: TemplateFormOptions): ITemplateFormState => {
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
	const [partner, setPartner] = useState<Partner | null>(null);
	const [name, setName] = useState<string | null>(initial?.name ?? null);
	const [type, setType] = useState<TemplateType | null>(initial?.type ?? "Sale");
	const [items, setItems] = useState<TemplateFormItemPayload[]>(
		initial?.items.map((item) => ({
			id: item.id,
			productId: item.productId,
			productName: item.productName,
			unitPrice: item.unitPrice,
			discount: item.discount ?? 0,
			quantity: item.quantity,
		})) ?? [],
	);

	const mapTemplateItems = useCallback(
		(templateItems: Template["items"]): TemplateFormItemPayload[] =>
			templateItems.map((i) => ({
				id: i.id,
				productId: i.productId,
				productName: i.productName ?? "—",
				unitPrice: i.unitPrice,
				discount: i.discount ?? 0,
				quantity: i.quantity,
			})),
		[productStore],
	);

	const reset = useCallback(() => {
		console.log("resetting");
		setPartner(null);
		setName(null);
		setType("Sale");
		setItems([]);
		setSelectedProduct(null);
	}, []);

	useEffect(() => {
		console.log("inside of effect");
		if (!initial) {
			reset();
			return;
		}

		console.log("effect should update");
		console.log(initial.name);
		console.log(initial.type);
		console.log(initial.items.length);
		setName(initial.name ?? null);
		setType(initial.type ?? "Sale");
		setItems(mapTemplateItems(initial.items));
		setSelectedProduct(null);

		if (partnerStore.allPartners === "loading") {
			return;
		}

		const partner = partnerStore.allPartners.find((el) => el.id === initial.partnerId);
		setPartner(partner ?? null);
	}, [initial, partnerStore]);

	const addItem = (): void => {
		if (!selectedProduct) {
			return;
		}

		const isProductAlreadyAdded = items.some((el) => el.productId === selectedProduct.id);
		if (isProductAlreadyAdded) {
			return;
		}

		setItems((prev) => [
			...prev,
			{
				id: 0,
				productId: selectedProduct.id,
				productName: selectedProduct.name,
				unitPrice: type === "Sale" ? selectedProduct.salePrice : selectedProduct.supplyPrice,
				quantity: 1,
				discount: 0,
			},
		]);
		setSelectedProduct(null);
	};

	const updateItem = (index: number, patch: Partial<TemplateFormItemPayload>): void => {
		if (index < 0 || index >= items.length) {
			return;
		}

		setItems((prev) => {
			const updatedItems = [...prev];
			const itemToUpdate = updatedItems[index];
			updatedItems[index] = { ...itemToUpdate, ...patch };

			return updatedItems;
		});
	};

	const removeItem = (index: number): void => {
		if (index < 0 || index >= items.length) {
			return;
		}

		setItems((prev) => prev.filter((_, i) => i !== index));
	};

	const totalDue = useMemo(
		() => items.reduce((sum, item) => sum + item.unitPrice * item.quantity - item.discount, 0),
		[items],
	);
	const totalDiscount = useMemo(() => items.reduce((sum, item) => sum + item.discount, 0), [items]);

	const isFormValid = !!(partner && name && items.length > 0 && type);

	const isFormChanged =
		partner?.id !== initial?.partnerId && name !== initial?.name && type !== initial?.type;

	const buildPayload = (): TemplateFormPayload | null => {
		if (!isFormValid) {
			return null;
		}

		return {
			partnerId: partner.id,
			name: name,
			type: type,
			items: items,
		};
	};

	return {
		totalDue,
		totalDiscount,
		isFormValid,
		isFormTouched: isFormChanged,
		partner,
		setPartner,
		selectedProduct,
		setSelectedProduct,
		name,
		setName,
		type,
		setType,
		items,
		addItem,
		updateItem,
		removeItem,
		reset,
		buildPayload,
	};
};
