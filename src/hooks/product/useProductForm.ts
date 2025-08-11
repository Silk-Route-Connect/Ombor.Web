import { useCallback, useEffect, useMemo } from "react";
import { useForm, UseFormReturn, UseFormStateReturn, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Product } from "models/product";
import { ProductFormInputs, ProductFormValues, ProductSchema } from "schemas/ProductSchema";
import { mapProductToFormPayload } from "utils/productUtils";

interface UseProductFormOptions {
	isOpen: boolean;
	isSaving: boolean;
	product?: Product | null;
	onSave: (payload: ProductFormValues) => void;
}

interface UseProductFormResult {
	form: UseFormReturn<ProductFormInputs>;
	formState: UseFormStateReturn<ProductFormInputs>;
	canSave: boolean;

	hasPackaging: boolean;
	packSize: number;
	packPrice: number | null;

	setCategoryId: (categoryId: number) => void;
	setType: (type: ProductFormInputs["type"]) => void;
	enablePackaging: () => void;
	disablePackaging: () => void;

	submit: () => Promise<void>;
}

const DEFAULT_VALUES: ProductFormInputs = {
	name: "",
	categoryId: 0,
	measurement: "Unit",
	type: "All",
	sku: "",
	description: undefined,
	barcode: undefined,

	supplyPrice: 0,
	salePrice: 0,
	retailPrice: 0,

	packaging: undefined,

	attachments: undefined,
	notes: undefined,
};

export type ProductFormPayload = ProductFormInputs;

export const useProductForm = ({
	isOpen,
	isSaving,
	product,
	onSave,
}: UseProductFormOptions): UseProductFormResult => {
	const form = useForm<ProductFormInputs>({
		resolver: zodResolver(ProductSchema),
		mode: "onBlur",
		reValidateMode: "onChange",
		criteriaMode: "all",
		defaultValues: DEFAULT_VALUES,
	});

	const { control, formState, setValue, handleSubmit } = form;

	useEffect(() => {
		const initialValues = product ? mapProductToFormPayload(product) : { ...DEFAULT_VALUES };
		form.reset(initialValues);
	}, [isOpen, product, form]);

	const watchedSalePrice = useWatch({ control, name: "salePrice" });
	const watchedPackaging = useWatch({ control, name: "packaging" });

	const hasPackaging = Boolean(watchedPackaging);
	const packSize = watchedPackaging?.packSize ?? 0;

	const packPrice = useMemo(() => {
		if (!hasPackaging || !packSize || !watchedSalePrice || watchedSalePrice <= 0) {
			return null;
		}

		return watchedSalePrice * packSize;
	}, [hasPackaging, packSize, watchedSalePrice]);

	const setCategoryId = useCallback(
		(categoryId: number) =>
			setValue("categoryId", categoryId, { shouldDirty: true, shouldValidate: true }),
		[setValue],
	);

	const setType = useCallback(
		(type: ProductFormInputs["type"]) =>
			setValue("type", type, { shouldDirty: true, shouldValidate: true }),
		[setValue],
	);

	const enablePackaging = useCallback(() => {
		setValue(
			"packaging",
			{ packSize: 2, packLabel: undefined, packBarcode: undefined },
			{ shouldDirty: true, shouldValidate: true },
		);
	}, [setValue]);

	const disablePackaging = useCallback(() => {
		setValue("packaging", undefined, { shouldDirty: true, shouldValidate: true });
	}, [setValue]);

	const submit = handleSubmit(onSave);

	const canSave = formState.isValid && formState.isDirty && !isSaving;
	console.log(formState.isValid);
	console.log(formState.isDirty);

	return {
		form,
		formState,
		canSave,

		hasPackaging,
		packSize,
		packPrice,

		setCategoryId,
		setType,
		enablePackaging,
		disablePackaging,

		submit,
	};
};
