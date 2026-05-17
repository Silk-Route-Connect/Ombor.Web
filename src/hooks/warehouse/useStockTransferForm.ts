import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, UseFormReturn, UseFormStateReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Warehouse, WarehouseItem } from "models/warehouse";
import {
	StockTransferFormInputs,
	StockTransferFormValues,
	StockTransferItemValues,
	StockTransferSchema,
} from "schemas/TransferStockSchema";
import { useStore } from "stores/StoreContext";

export type StockTransferFormPayload = StockTransferFormValues;

export interface UseStockTransferFormInput {
	isOpen: boolean;
	isSaving: boolean;
	warehouses: Warehouse[];
	onSave: (payload: StockTransferFormPayload) => void;
}

export interface UseStockTransferFormResult {
	form: UseFormReturn<StockTransferFormInputs>;
	formState: UseFormStateReturn<StockTransferFormInputs>;
	canSave: boolean;

	fromWarehouseId: number;
	toWarehouseId: number;
	setFromWarehouseId: (id: number) => void;
	setToWarehouseId: (id: number) => void;

	items: StockTransferItemValues[];
	searchTerm: string;
	setSearchTerm: (term: string) => void;

	sourceProducts: WarehouseItem[]; // Products with stock > 0 in source
	addProduct: (productId: number) => void;
	updateTransferQuantity: (index: number, quantity: number) => void;
	removeItem: (index: number) => void;

	submit: () => Promise<void>;
}

const DEFAULT_VALUES: StockTransferFormInputs = {
	fromWarehouseId: 0,
	toWarehouseId: 0,
	items: [],
	notes: null,
};

export const useStockTransferForm = ({
	isOpen,
	isSaving,
	warehouses,
	onSave,
}: UseStockTransferFormInput): UseStockTransferFormResult => {
	const { productStore } = useStore();
	const form = useForm<StockTransferFormInputs>({
		resolver: zodResolver(StockTransferSchema),
		mode: "onBlur",
		reValidateMode: "onChange",
		criteriaMode: "all",
		defaultValues: DEFAULT_VALUES,
	});

	const { watch, setValue, formState } = form;
	const [searchTerm, setSearchTerm] = useState("");

	const fromWarehouseId = watch("fromWarehouseId");
	const toWarehouseId = watch("toWarehouseId");
	const items = watch("items");
	const { reset } = form;

	const allProducts = productStore.allProducts === "loading" ? [] : productStore.allProducts;

	useEffect(() => {
		if (isOpen) {
			reset(DEFAULT_VALUES);
			setSearchTerm("");
		}
	}, [isOpen, reset]);

	const sourceWarehouse = useMemo(
		() => warehouses.find((w) => w.id === fromWarehouseId),
		[warehouses, fromWarehouseId],
	);

	const destWarehouse = useMemo(
		() => warehouses.find((w) => w.id === toWarehouseId),
		[warehouses, toWarehouseId],
	);

	const sourceProducts = useMemo(() => {
		if (!sourceWarehouse) return [];
		return sourceWarehouse.items.filter((item) => item.quantity > 0);
	}, [sourceWarehouse]);

	console.log([...sourceProducts]);

	const { getValues } = form;

	const setFromWarehouseId = useCallback(
		(id: number) => {
			const currentFromId = getValues("fromWarehouseId");
			const currentItems = getValues("items");

			// Don't do anything if setting to same warehouse
			if (currentFromId === id) {
				return;
			}

			// Clear items when changing source warehouse
			if (currentItems.length > 0) {
				console.log("clearing items because warehouse changed");
				setValue("items", [], { shouldValidate: true });
			}

			setValue("fromWarehouseId", id, {
				shouldDirty: true,
				shouldValidate: true,
			});
		},
		[setValue, getValues], // Removed items.length
	);

	const setToWarehouseId = useCallback(
		(id: number) => {
			setValue("toWarehouseId", id, {
				shouldDirty: true,
				shouldValidate: true,
			});
			// Recalculate destination stocks
			if (destWarehouse) {
				const updated = items.map((item) => {
					const destItem = destWarehouse.items.find((di) => di.productId === item.productId);
					return {
						...item,
						destinationCurrentStock: destItem?.quantity ?? 0,
					};
				});
				setValue("items", updated, { shouldValidate: true });
			}
		},
		[destWarehouse, items, setValue],
	);

	const addProduct = useCallback(
		(productId: number) => {
			const sourceItem = sourceProducts.find((p) => p.productId === productId);
			const product = allProducts.find((p) => p.id === productId);

			if (!sourceItem || !product) {
				console.log("Product not found in source or allProducts");
				return;
			}

			// Get current values directly from form
			const currentItems = form.getValues("items");
			const currentToWarehouseId = form.getValues("toWarehouseId");

			// Check if already added
			if (currentItems.some((item) => item.productId === productId)) {
				console.log("Product already added");
				return;
			}

			// Calculate destWarehouse fresh (don't depend on the memoized one)
			const destWarehouse = warehouses.find((w) => w.id === currentToWarehouseId);
			const destItem = destWarehouse?.items.find((i) => i.productId === productId);

			const newItem: StockTransferItemValues = {
				productId: product.id,
				productName: product.name,
				productSku: product.sku,
				availableQuantity: sourceItem.quantity,
				quantity: 0,
				destinationCurrentStock: destItem?.quantity ?? 0,
			};

			console.log("Adding product:", newItem);
			setValue("items", [...currentItems, newItem], {
				shouldDirty: true,
				shouldValidate: true,
			});
		},
		[sourceProducts, allProducts, warehouses, setValue, form], // Changed: removed destWarehouse, added warehouses
	);

	const updateTransferQuantity = useCallback(
		(index: number, quantity: number) => {
			const updated = items.map((item, i) =>
				i === index ? { ...item, quantity: quantity } : item,
			);
			setValue("items", updated, {
				shouldDirty: true,
				shouldValidate: true,
			});
		},
		[items, setValue],
	);

	const removeItem = useCallback(
		(index: number) => {
			setValue(
				"items",
				items.filter((_, i) => i !== index),
				{ shouldDirty: true, shouldValidate: true },
			);
		},
		[items, setValue],
	);

	const submit = form.handleSubmit(onSave);

	const canSave = formState.isValid && formState.isDirty && !isSaving;

	return {
		form,
		formState,
		canSave,
		items,

		fromWarehouseId,
		toWarehouseId,
		setFromWarehouseId,
		setToWarehouseId,

		searchTerm,
		setSearchTerm,

		sourceProducts,
		addProduct,
		updateTransferQuantity,
		removeItem,

		submit,
	};
};
