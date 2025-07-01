import { useEffect, useMemo, useState } from "react";
import { PaymentCurrency, PaymentMethod } from "models/payment";
import { CreateSupplyItem, Supply } from "models/supply";
import { Template } from "models/template";
import { useStore } from "stores/StoreContext";

import { SupplyFormPayload } from "./SupplyFormModal";

export interface SupplyFormState {
	supplierId: number | null;
	setSupplierId(id: number | null): void;

	date: Date;
	setDate(d: Date): void;

	template: Template | null;
	setTemplate(t: Template | null): void;

	selectedProductId: number | null;
	setSelectedProductId(id: number | null): void;

	items: CreateSupplyItem[];
	addProduct(): void;
	removeItem(idx: number): void;
	updateItem(idx: number, patch: Partial<CreateSupplyItem>): void;

	paymentMethod: PaymentMethod;
	setPaymentMethod(type: PaymentMethod): void;

	currency: PaymentCurrency;
	setCurrency(c: PaymentCurrency): void;

	exchangeRate: number;
	setExchangeRate(v: number): void;

	paymentAmount: number;
	setPaymentAmount(v: number): void;

	notes: string;
	setNotes(v: string): void;

	attachments: File[];
	removeAttachment(index: number): void;
	handleAttachmentsChange(e: React.ChangeEvent<HTMLInputElement>): void;

	totalDue: number;
	debtAmount: number;

	isDetailsValid: boolean;
	isPaymentValid: boolean;
	buildPayload(): SupplyFormPayload;
}

export const useSupplyForm = (initialSupply: Supply | null | undefined): SupplyFormState => {
	const [supplierId, setSupplierId] = useState<number | null>(initialSupply?.supplierId ?? null);
	const [date, setDate] = useState<Date>(initialSupply?.date ?? new Date());
	const [template, setTemplate] = useState<Template | null>(null);
	const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
	const [items, setItems] = useState<CreateSupplyItem[]>(
		initialSupply?.items.map((i) => ({ ...i })) ?? [],
	);
	const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash");
	const [currency, setCurrency] = useState<PaymentCurrency>("UZS");
	const [exchangeRate, setExchangeRate] = useState<number>(1);
	const [paymentAmount, setPaymentAmount] = useState<number>(initialSupply?.totalPaid ?? 0);
	const [notes, setNotes] = useState<string>(initialSupply?.notes ?? "");
	const [attachments, setAttachments] = useState<File[]>([]);

	const { productStore } = useStore();

	useEffect(() => {
		if (!template) {
			return;
		}

		setSupplierId(template.partnerId);
		setItems(
			template.items.map((ti) => ({
				productId: ti.productId,
				productName: ti.productName,
				quantity: ti.quantity,
				unitPrice: ti.unitPrice,
				discount: ti.discount ?? 0,
			})),
		);
	}, [template]);

	const totalDue = useMemo(
		() => items.reduce((sum, i) => sum + i.quantity * i.unitPrice - (i.discount ?? 0), 0),
		[items],
	);
	const debtAmount = totalDue - paymentAmount;

	const addProduct = () => {
		if (!selectedProductId) return;
		if (productStore.allProducts === "loading") return;
		const p = productStore.allProducts.find((x) => x.id === selectedProductId);
		if (!p) return;
		setItems((prev) => [
			...prev,
			{
				productId: p.id,
				productName: p.name,
				unitPrice: p.supplyPrice,
				quantity: 1,
				discount: 0,
			},
		]);
		setSelectedProductId(null);
	};

	const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

	const updateItem = (idx: number, patch: Partial<CreateSupplyItem>) =>
		setItems((prev) => {
			const copy = [...prev];
			copy[idx] = { ...copy[idx], ...patch };
			return copy;
		});

	const handleAttachmentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files) return;
		setAttachments((prev) => [...prev, ...Array.from(e.target.files!)]);
	};

	const removeAttachment = (index: number): void => {
		const updated = attachments.filter((_, i) => i !== index);
		setAttachments(updated);
	};

	const isDetailsValid = supplierId !== null && items.length > 0;
	const isPaymentValid = isDetailsValid && (currency === "UZS" || exchangeRate > 0);

	const buildPayload = () => ({
		supplierId: supplierId!,
		date,
		items: items.map((item) => ({
			...item,
			productName: item.productName ?? "",
			discount: item.discount ?? 0,
		})),
		notes: notes.trim() || undefined,
		paymentMethod,
		currency,
		exchangeRate,
		totalPaid: paymentAmount,
		attachments,
	});

	return {
		supplierId,
		setSupplierId,
		date,
		setDate,
		template,
		setTemplate,
		selectedProductId,
		setSelectedProductId,
		items,
		addProduct,
		removeItem,
		updateItem,
		paymentMethod,
		setPaymentMethod,
		currency,
		setCurrency,
		exchangeRate,
		setExchangeRate,
		paymentAmount,
		setPaymentAmount,
		notes,
		setNotes,
		attachments,
		removeAttachment,
		handleAttachmentsChange,
		totalDue,
		debtAmount,
		isDetailsValid,
		isPaymentValid,
		buildPayload,
	};
};
