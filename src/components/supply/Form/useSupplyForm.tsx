import { useEffect, useMemo, useState } from "react";
import { CreateSupplyItem, Supply } from "models/supply";
import { Template } from "models/template";
import { IProductStore } from "stores/ProductStore";
import { ITemplateStore } from "stores/TemplateStore";

import { SupplyFormPayload } from "./SupplyFormModal";

export type Currency = "uzs" | "usd" | "rub";

export interface SupplyFormState {
	supplierId: number | null;
	setSupplierId(id: number | null): void;
	date: Date;
	setDate(d: Date): void;
	template: Template | null;
	setTemplate(t: Template | null): void;
	productToAdd: number | null;
	setProductToAdd(id: number | null): void;
	items: CreateSupplyItem[];
	addProduct(): void;
	removeItem(idx: number): void;
	updateItem(idx: number, patch: Partial<CreateSupplyItem>): void;
	paymentType: "cash" | "card" | "transfer";
	setPaymentType(t: "cash" | "card" | "transfer"): void;
	currency: Currency;
	setCurrency(c: "uzs" | "usd" | "rub"): void;
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
	debt: number;
	isDetailsValid: boolean;
	isPaymentValid: boolean;
	buildPayload(): SupplyFormPayload;
}

export const useSupplyForm = (
	initialSupply: Supply | null | undefined,
	templateStore: ITemplateStore,
	productStore: IProductStore,
): SupplyFormState => {
	const [supplierId, setSupplierId] = useState<number | null>(initialSupply?.supplierId ?? null);
	const [date, setDate] = useState<Date>(initialSupply?.date ?? new Date());
	const [template, setTemplate] = useState<Template | null>(null);
	const [productToAdd, setProductToAdd] = useState<number | null>(null);
	const [items, setItems] = useState<CreateSupplyItem[]>(
		initialSupply?.items.map((i) => ({ ...i })) ?? [],
	);
	const [paymentType, setPaymentType] = useState<"cash" | "card" | "transfer">(
		initialSupply?.paymentType ?? "cash",
	);
	const [currency, setCurrency] = useState<"uzs" | "usd" | "rub">(initialSupply?.currency ?? "uzs");
	const [exchangeRate, setExchangeRate] = useState<number>(initialSupply?.exchangeRate ?? 0);
	const [paymentAmount, setPaymentAmount] = useState<number>(initialSupply?.totalPaid ?? 0);
	const [notes, setNotes] = useState<string>(initialSupply?.notes ?? "");
	const [attachments, setAttachments] = useState<File[]>([]);

	useEffect(() => {
		if (!template) return;
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
	const debt = totalDue - paymentAmount;

	const addProduct = () => {
		if (!productToAdd) return;
		if (productStore.allProducts === "loading") return;
		const p = productStore.allProducts.find((x) => x.id === productToAdd);
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
		setProductToAdd(null);
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
	const isPaymentValid = isDetailsValid && (currency === "uzs" || exchangeRate > 0);

	const buildPayload = () => ({
		supplierId: supplierId!,
		date,
		items: items.map((item) => ({
			...item,
			productName: item.productName ?? "",
			discount: item.discount ?? 0,
		})),
		notes: notes.trim() || undefined,
		paymentType,
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
		productToAdd,
		setProductToAdd,
		items,
		addProduct,
		removeItem,
		updateItem,
		paymentType,
		setPaymentType,
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
		debt,
		isDetailsValid,
		isPaymentValid,
		buildPayload,
	};
};
