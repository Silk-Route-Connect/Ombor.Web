import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, UseFormReturn, UseFormStateReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Product } from "models/product";
import { Warehouse } from "models/warehouse";
import {
	AdjustStockFormInputs,
	AdjustStockFormValues,
	AdjustStockItemValues,
	AdjustStockSchema,
} from "schemas/AdjustStockSchema";
import { useStore } from "stores/StoreContext";

export type AdjustStockFormPayload = AdjustStockFormValues;

export interface UseAdjustStockFormInput {
	isOpen: boolean;
	isSaving: boolean;
	warehouse: Warehouse | null;
	onSave: (payload: AdjustStockFormPayload) => void;
}

export interface UseAdjustStockFormResult {
	form: UseFormReturn<AdjustStockFormInputs>;
	formState: UseFormStateReturn<AdjustStockFormInputs>;
	canSave: boolean;

	items: AdjustStockItemValues[];
	searchTerm: string;
	setSearchTerm: (term: string) => void;

	availableProducts: Product[]; // Products not yet in warehouse
	addProduct: (product: Product) => void;
	updateItem: (index: number, patch: Partial<AdjustStockItemValues>) => void;

	submit: () => Promise<void>;
}

const DEFAULT_VALUES: AdjustStockFormInputs = {
	items: [],
	notes: "",
};

export const useAdjustStockForm = ({
	isOpen,
	isSaving,
	warehouse,
	onSave,
}: UseAdjustStockFormInput): UseAdjustStockFormResult => {
	const { productStore } = useStore();
	const allProducts = productStore.allProducts === "loading" ? [] : productStore.allProducts;

	const form = useForm<AdjustStockFormInputs>({
		resolver: zodResolver(AdjustStockSchema),
		mode: "onBlur",
		reValidateMode: "onChange",
		criteriaMode: "all",
		defaultValues: DEFAULT_VALUES,
	});

	const { reset } = form;

	const { watch, setValue, formState } = form;
	const [searchTerm, setSearchTerm] = useState("");

	const items = watch("items");

	useEffect(() => {
		if (isOpen && warehouse) {
			const initialItems = warehouse.items.map((item) => {
				const product = allProducts.find((p) => p.id === item.productId);
				return {
					productId: item.productId,
					productName: product?.name ?? "",
					currentQuantity: item.quantity,
					newQuantity: item.quantity,
					lowStockThreshold: item.lowStockThreshold,
				};
			});

			reset({
				items: initialItems,
				notes: "",
			});
			setSearchTerm("");
		}
	}, [isOpen, warehouse, allProducts, reset]);

	const availableProducts = useMemo(() => {
		const existingIds = new Set(items.map((i) => i.productId));
		return allProducts.filter((p) => !existingIds.has(p.id));
	}, [allProducts, items]);

	const addProduct = useCallback(
		(product: Product) => {
			if (items.some((el) => el.productId === product.id)) {
				return;
			}

			const newItem: AdjustStockItemValues = {
				productId: product.id,
				productName: product.name,
				currentQuantity: 0,
				newQuantity: 0,
				lowStockThreshold: 0,
			};
			setValue("items", [...items, newItem], {
				shouldDirty: true,
				shouldValidate: true,
			});
		},
		[items, setValue],
	);

	const updateItem = useCallback(
		(index: number, patch: Partial<AdjustStockItemValues>) => {
			const updated = items.map((item, i) => (i === index ? { ...item, ...patch } : item));
			setValue("items", updated, {
				shouldDirty: true,
				shouldValidate: true,
			});
		},
		[items, setValue],
	);

	const submit = form.handleSubmit(onSave);

	const canSave = formState.isValid && formState.isDirty && !isSaving;

	return {
		form,
		formState,
		canSave,

		searchTerm,
		setSearchTerm,

		items,
		availableProducts,
		addProduct,
		updateItem,
		submit,
	};
};
