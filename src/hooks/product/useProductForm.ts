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

	/** Persisted "main" existing image id (null if a new upload is the current main). */
	mainImageId: number | null;

	/** Current UI selection of main image (existing by id or new by index). */
	mainSelection: { kind: "existing"; imageId: number } | { kind: "new"; index: number } | null;

	setCategoryId: (categoryId: number) => void;
	setType: (type: ProductFormInputs["type"]) => void;

	enablePackaging: () => void;
	disablePackaging: () => void;

	addAttachments: (files: FileList) => void;
	removeAttachment: (index: number) => void;
	clearAttachments: () => void;

	markImageForRemoval: (imageId: number) => void;
	restoreMarkedImage: (imageId: number) => void;

	selectMainExisting: (imageId: number) => void;
	selectMainNew: (index: number) => void;

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

	const { control, formState, setValue, handleSubmit, reset, clearErrors, trigger } = form;

	const [initialImages, setInitialImages] = useState<ProductImage[]>([]);
	const [imagesToRemove, setImagesToRemove] = useState<number[]>([]);

	// UI selection for main image
	const [mainSelection, setMainSelection] = useState<
		{ kind: "existing"; imageId: number } | { kind: "new"; index: number } | null
	>(null);

	useEffect(() => {
		const initialValues = product ? mapProductToFormPayload(product) : { ...DEFAULT_VALUES };
		reset(initialValues);
		setInitialImages(product?.images ?? []);
		setImagesToRemove([]);

		if (product?.images?.length) {
			setMainSelection({ kind: "existing", imageId: product.images[0].id });
		} else {
			setMainSelection(null);
		}
	}, [isOpen, product, reset]);

	const existingImages = useMemo(
		() => initialImages.filter((img) => !imagesToRemove.includes(img.id)),
		[initialImages, imagesToRemove],
	);

	const attachments = useWatch({ control, name: "attachments" }) ?? [];

	// Keep main selection consistent as lists change
	useEffect(() => {
		if (mainSelection?.kind === "existing") {
			const stillExists = existingImages.some((i) => i.id === mainSelection.imageId);
			if (!stillExists) setMainSelection(null);
		} else if (mainSelection?.kind === "new") {
			if (mainSelection.index >= attachments.length) setMainSelection(null);
		}

		if (!mainSelection) {
			if (existingImages.length > 0) {
				setMainSelection({ kind: "existing", imageId: existingImages[0].id });
			} else if (attachments.length > 0) {
				setMainSelection({ kind: "new", index: 0 });
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [existingImages, attachments]);

	const mainImageId: number | null =
		mainSelection?.kind === "existing" ? mainSelection.imageId : null;

	const markImageForRemoval = useCallback((imageId: number) => {
		setImagesToRemove((prev) => (prev.includes(imageId) ? prev : [...prev, imageId]));
	}, []);

	const restoreMarkedImage = useCallback((imageId: number) => {
		setImagesToRemove((prev) => prev.filter((id) => id !== imageId));
	}, []);

	const watchedSalePrice = useWatch({ control, name: "salePrice" });
	const watchedPackaging = useWatch({ control, name: "packaging" });
	const watchedType = useWatch({ control, name: "type" });

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

	const addAttachments = useCallback(
		(files: FileList) => {
			const next = [...attachments, ...Array.from(files)];
			setValue("attachments", next, { shouldDirty: true, shouldValidate: true });

			if (!mainSelection && next.length > 0 && existingImages.length === 0) {
				setMainSelection({ kind: "new", index: 0 });
			}
		},
		[attachments, existingImages.length, mainSelection, setValue],
	);

	const removeAttachment = useCallback(
		(index: number) => {
			const next = attachments.filter((_, i) => i !== index);
			setValue("attachments", next, { shouldDirty: true, shouldValidate: true });

			if (mainSelection?.kind === "new" && mainSelection.index === index) {
				setMainSelection(null);
			}
		},
		[attachments, mainSelection, setValue],
	);

	const clearAttachments = useCallback(() => {
		setValue("attachments", [], { shouldDirty: true, shouldValidate: true });
		if (mainSelection?.kind === "new") {
			setMainSelection(null);
		}
	}, [mainSelection, setValue]);

	const selectMainExisting = useCallback((imageId: number) => {
		setMainSelection({ kind: "existing", imageId });
	}, []);

	const selectMainNew = useCallback((index: number) => {
		setMainSelection({ kind: "new", index });
	}, []);

	useEffect(() => {
		if (!watchedType) return;

		if (watchedType === "Supply") {
			setValue("salePrice", 0, { shouldDirty: true, shouldValidate: true });
			setValue("retailPrice", 0, { shouldDirty: true, shouldValidate: true });
			clearErrors(["salePrice", "retailPrice"]);
		} else if (watchedType === "Sale") {
			clearErrors(["supplyPrice"]);
		} else {
			clearErrors(["supplyPrice", "salePrice", "retailPrice"]);
		}

		void trigger(["supplyPrice", "salePrice", "retailPrice"]);
	}, [watchedType, setValue, clearErrors, trigger]);

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
		existingImages,
		imagesToRemove,

		mainImageId,
		mainSelection,

		setCategoryId,
		setType,

		enablePackaging: () =>
			setValue(
				"packaging",
				{ packSize: 2, packLabel: undefined, packBarcode: undefined },
				{ shouldDirty: true, shouldValidate: true },
			),
		disablePackaging: () =>
			setValue("packaging", undefined, { shouldDirty: true, shouldValidate: true }),

		addAttachments,
		removeAttachment,
		clearAttachments,

		markImageForRemoval,
		restoreMarkedImage,

		selectMainExisting,
		selectMainNew,

		submit,
	};
};
