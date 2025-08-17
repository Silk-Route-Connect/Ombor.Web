import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, UseFormReturn, UseFormStateReturn, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Product, ProductImage } from "models/product";
import { ProductFormInputs, ProductFormValues, ProductSchema } from "schemas/ProductSchema";
import { mapProductToFormPayload } from "utils/productUtils";

export interface UseProductFormOptions {
	isOpen: boolean;
	isSaving: boolean;
	product?: Product | null;
	onSave: (payload: ProductFormValues) => void;
}

export interface UseProductFormResult {
	form: UseFormReturn<ProductFormInputs>;
	formState: UseFormStateReturn<ProductFormInputs>;
	canSave: boolean;

	hasPackaging: boolean;
	packSize: number;
	packPrice: number | null;
	attachments: File[];
	existingImages: ProductImage[];
	imagesToRemove: number[];

	setCategoryId: (categoryId: number) => void;
	setType: (type: ProductFormInputs["type"]) => void;
	enablePackaging: () => void;
	disablePackaging: () => void;
	addAttachments: (files: FileList) => void;
	removeAttachment: (index: number) => void;
	clearAttachments: () => void;
	markImageForRemoval: (imageId: number) => void;
	restoreMarkedImage: (imageId: number) => void;

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

	const [initialImages, setInitialImages] = useState<ProductImage[]>([]);
	const [imagesToRemove, setImagesToRemove] = useState<number[]>([]);

	useEffect(() => {
		const initialValues = product ? mapProductToFormPayload(product) : { ...DEFAULT_VALUES };
		form.reset(initialValues);
		setInitialImages(product?.images ?? []);
		setImagesToRemove([]);
	}, [isOpen, product, form]);

	const existingImages = useMemo(
		() => initialImages.filter((img) => !imagesToRemove.includes(img.id)),
		[initialImages, imagesToRemove],
	);

	const markImageForRemoval = useCallback((imageId: number) => {
		setImagesToRemove((prev) => (prev.includes(imageId) ? prev : [...prev, imageId]));
	}, []);

	const restoreMarkedImage = useCallback((imageId: number) => {
		setImagesToRemove((prev) => prev.filter((id) => id !== imageId));
	}, []);

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

	const attachments = useWatch({ control, name: "attachments" }) ?? [];

	const addAttachments = useCallback(
		(files: FileList) => {
			const next = [...attachments, ...Array.from(files)];
			setValue("attachments", next, { shouldDirty: true, shouldValidate: true });
		},
		[attachments, setValue],
	);

	const removeAttachment = useCallback(
		(index: number) => {
			const next = attachments.filter((_, i) => i !== index);
			setValue("attachments", next, { shouldDirty: true, shouldValidate: true });
		},
		[attachments, setValue],
	);

	const clearAttachments = useCallback(() => {
		setValue("attachments", [], { shouldDirty: true, shouldValidate: true });
	}, [setValue]);

	const submit = handleSubmit(onSave);

	const canSave = formState.isValid && formState.isDirty && !isSaving;

	return {
		form,
		formState,
		canSave,

		hasPackaging,
		packSize,
		packPrice,
		attachments,

		setCategoryId,
		setType,
		enablePackaging,
		disablePackaging,
		addAttachments,
		removeAttachment,
		clearAttachments,

		existingImages,
		imagesToRemove,
		markImageForRemoval,
		restoreMarkedImage,

		submit,
	};
};
