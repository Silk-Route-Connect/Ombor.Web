import { useCallback, useEffect, useMemo, useState } from "react";
import {
	useFieldArray,
	useForm,
	UseFormReturn,
	UseFormStateReturn,
	useWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Partner } from "models/partner";
import { Product } from "models/product";
import { Template, TemplateType } from "models/template";
import {
	TemplateFormInputs,
	TemplateFormItemValues,
	TemplateFormValues,
	TemplateSchema,
} from "schemas/TemplateSchema";
import { useStore } from "stores/StoreContext";
import { getPrice } from "utils/productUtils";
import {
	calculateTemplateTotals,
	mapTemplateToPayload,
	TEMPLATE_FORM_DEFAULT_VALUES,
} from "utils/templateUtils";

export type TemplateFormPayload = TemplateFormValues;

export interface UseTemplateFormResult {
	form: UseFormReturn<TemplateFormInputs>;
	formState: UseFormStateReturn<TemplateFormInputs>;
	canSave: boolean;

	totalDue: number;
	totalDiscount: number;

	selectedPartner: Partner | null;
	setPartnerId: (partnerId: number) => void;

	templateType: TemplateType;
	setTemplateType: (type: TemplateType) => void;

	selectedProduct: Product | null;
	setSelectedProduct: (prod: Product | null) => void;

	items: TemplateFormInputs["items"];
	addItem: () => void;
	updateItem: (index: number, patch: Partial<TemplateFormInputs["items"][number]>) => void;
	removeItem: (index: number) => void;

	submit: () => Promise<void>;
}

export const useTemplateForm = ({
	isOpen,
	isSaving,
	template,
	onSave,
}: {
	isOpen: boolean;
	isSaving: boolean;
	template?: Template | null;
	onSave: (payload: TemplateFormPayload) => void;
	onClose: () => void;
}): UseTemplateFormResult => {
	const { partnerStore } = useStore();

	const form = useForm<TemplateFormInputs>({
		resolver: zodResolver(TemplateSchema),
		mode: "onBlur",
		reValidateMode: "onChange",
		criteriaMode: "all",
		defaultValues: TEMPLATE_FORM_DEFAULT_VALUES,
	});

	const { control, setValue, formState } = form;

	useEffect(() => {
		const initialValues = template ? mapTemplateToPayload(template) : TEMPLATE_FORM_DEFAULT_VALUES;
		form.reset(initialValues);
	}, [isOpen, template, form]);

	const partnerId = useWatch({ control, name: "partnerId" });
	const watchedType = useWatch({ control, name: "type" });
	const watchedItems = useWatch({ control, name: "items" });
	const { fields: items, append, update, remove } = useFieldArray({ name: "items", control });
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

	const { totalDue, totalDiscount } = useMemo(
		() => calculateTemplateTotals(watchedItems),
		[watchedItems],
	);

	const setPartnerId = useCallback(
		(id: number) => setValue("partnerId", id, { shouldDirty: true, shouldValidate: true }),
		[setValue],
	);

	const setTemplateType = useCallback(
		(type: TemplateType) => setValue("type", type, { shouldDirty: true, shouldValidate: true }),
		[setValue],
	);

	const addItem = useCallback(() => {
		if (!selectedProduct) return;

		if (items.some((item) => item.productId === selectedProduct.id)) {
			setSelectedProduct(null);
			return;
		}

		const unitPrice = getPrice(selectedProduct, watchedType);

		append({
			id: 0,
			productId: selectedProduct.id,
			productName: selectedProduct.name,
			quantity: 1,
			unitPrice,
			discount: 0,
		});

		setSelectedProduct(null);
	}, [selectedProduct, watchedType, items, append]);

	const updateItem = useCallback(
		(index: number, patch: Partial<TemplateFormItemValues>) => {
			update(index, { ...items[index], ...patch });
		},
		[items, update],
	);

	const removeItem = useCallback((index: number) => remove(index), [remove]);

	const submit = form.handleSubmit(onSave);

	const selectedPartner = useMemo(() => {
		if (partnerStore.customers === "loading" || partnerStore.suppliers === "loading") {
			return null;
		}

		const partner =
			watchedType === "Sale"
				? partnerStore.customers.find((el) => el.id === partnerId)
				: partnerStore.suppliers.find((el) => el.id === partnerId);

		return partner ?? null;
	}, [watchedType, partnerId, partnerStore.customers, partnerStore.suppliers]);

	const canSave = formState.isValid && formState.isDirty && !isSaving;

	return {
		form,
		formState,
		canSave,

		totalDue,
		totalDiscount,

		selectedPartner,
		setPartnerId,

		templateType: watchedType,
		setTemplateType,

		selectedProduct,
		setSelectedProduct,

		items,
		addItem,
		updateItem,
		removeItem,

		submit,
	};
};
