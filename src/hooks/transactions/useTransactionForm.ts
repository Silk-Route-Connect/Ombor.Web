import { useEffect, useMemo, useState } from "react";
import {
	TransactionFormLinePayload,
	TransactionFormPayload,
} from "components/shared/Transaction/Form/TransactionFormModal";
import { Partner } from "models/partner";
import { PaymentCurrency, PaymentMethod } from "models/payment";
import { Product } from "models/product";
import { Template } from "models/template";
import { CreateTransactionLine, TransactionRecord } from "models/transaction";
import { IPartnerStore } from "stores/PartnerStore";
import { IProductStore } from "stores/ProductStore";
import { ITemplateStore } from "stores/TemplateStore";

export type TransactionFormMode = "Sale" | "Supply";

export interface TransactionFormState {
	mode: TransactionFormMode;

	partner: Partner | null;
	partnerId: number | null;
	setPartnerId(id: number | null): void;

	date: Date;
	setDate(date: Date): void;

	template: Template | null;
	templateId: number | null;
	setTemplateId(id: number | null): void;

	selectedProduct: Product | null;
	selectedProductId: number | null;
	setSelectedProductId(id: number | null): void;

	lines: TransactionFormLinePayload[];
	addLine(): void;
	updateLine(index: number, patch: Partial<TransactionFormLinePayload>): void;
	removeLine(index: number): void;

	paymentMethod: PaymentMethod;
	setPaymentMethod(method: PaymentMethod): void;

	currency: PaymentCurrency;
	setCurrency(currency: PaymentCurrency): void;

	exchangeRate: number;
	setExchangeRate(rate: number): void;

	totalPaid: number;
	setTotalPaid(amount: number): void;

	notes: string;
	setNotes(notes: string): void;

	attachments: File[];
	addAttachments(files: FileList): void;
	removeAttachment(index: number): void;

	totalDue: number;
	totalDiscount: number;
	totalPaidLocal: number;
	advanceAmount: number;
	debtAmount: number;
	isDetailsValid: boolean;
	isPaymentValid: boolean;
	isFormValid: boolean;

	reset(): void;
	buildPayload(): TransactionFormPayload;
}

interface TransactionFormOptions {
	mode: TransactionFormMode;
	initial?: TransactionRecord | null;
	productStore: IProductStore;
	templateStore: ITemplateStore;
	partnerStore: IPartnerStore;
}

export const useTransactionForm = ({
	mode,
	initial,
	productStore,
	templateStore,
	partnerStore,
}: TransactionFormOptions): TransactionFormState => {
	const [partnerId, setPartnerId] = useState<number | null>(initial?.partnerId ?? null);
	const [partner, setPartner] = useState<Partner | null>(null);
	const [date, setDate] = useState<Date>(initial?.date ?? new Date());
	const [template, setTemplate] = useState<Template | null>(null);
	const [templateId, setTemplateId] = useState<number | null>(null);
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
	const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
	const [lines, setLines] = useState<TransactionFormLinePayload[]>(
		initial?.lines.map((line) => ({
			id: line.id,
			transactionId: line.transactionId,
			productId: line.productId,
			productName: line.productName,
			unitPrice: line.unitPrice,
			quantity: line.quantity,
			discount: line.discount,
			total: line.total,
		})) ?? [],
	);
	const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash");
	const [currency, setCurrency] = useState<PaymentCurrency>("UZS");
	const [exchangeRate, setExchangeRate] = useState<number>(0);
	const [totalPaid, setTotalPaid] = useState<number>(0);
	const [notes, setNotes] = useState<string>(initial?.notes ?? "");
	const [attachments, setAttachments] = useState<File[]>([]);

	useEffect(() => {
		if (!templateId || templateStore.allTemplates === "loading") {
			return;
		}

		const template = templateStore.allTemplates.find((el) => el.id === templateId);
		if (!template) {
			return;
		}

		setTemplate(template);
		setLines(
			template.items.map((item) => ({
				productId: item.productId,
				productName: item.productName,
				unitPrice: item.unitPrice,
				quantity: item.quantity,
				discount: item.discount ?? 0,
				total: item.unitPrice * item.quantity - (item.discount ?? 0),
			})),
		);

		if (partnerStore.allPartners !== "loading") {
			const partner = partnerStore.allPartners.find((el) => el.id === template.partnerId);
			setPartner(partner ?? null);
			setPartnerId(template.partnerId);
		}
	}, [templateId, templateStore.allTemplates, partnerStore.allPartners]);

	useEffect(() => {
		if (selectedProductId && productStore.allProducts !== "loading") {
			const product = productStore.allProducts.find((el) => el.id === selectedProductId);
			setSelectedProduct(product ?? null);
		} else {
			setSelectedProduct(null);
		}
	}, [selectedProductId, productStore.allProducts]);

	useEffect(() => {
		if (partnerStore.allPartners !== "loading")
			setPartner(partnerStore.allPartners.find((p) => p.id === partnerId) ?? null);
	}, [partnerId, partnerStore.allPartners]);

	const addLine = () => {
		if (!selectedProductId || productStore.allProducts === "loading") {
			return;
		}

		const product = productStore.allProducts.find((el) => el.id === selectedProductId);

		if (!product) {
			return;
		}

		setLines((prev) => [
			...prev,
			{
				productId: product.id,
				productName: product.name,
				unitPrice: mode === "Sale" ? product.salePrice : product.supplyPrice,
				quantity: 1,
				discount: 0,
			},
		]);

		setSelectedProductId(null);
	};

	const removeLine = (index: number): void => {
		if (index < 0 || index >= lines.length) {
			return;
		}

		setLines((prev) => prev.filter((_, i) => i !== index));
	};

	const updateLine = (index: number, patch: Partial<CreateTransactionLine>): void => {
		if (index < 0 || index >= lines.length) {
			return;
		}

		setLines((prev) => {
			const updatedLines = [...prev];
			updatedLines[index] = { ...updatedLines[index], ...patch };

			return updatedLines;
		});
	};

	const addAttachments = (files: FileList) => {
		if (files.length === 0) {
			return;
		}

		setAttachments((prev) => [...prev, ...Array.from(files)]);
	};

	const removeAttachment = (index: number): void => {
		if (index < 0 || index >= attachments.length) {
			return;
		}

		setAttachments((prev) => prev.filter((_, i) => i !== index));
	};

	const reset = () => {
		setPartnerId(null);
		setDate(new Date());
		setTemplate(null);
		setTemplateId(null);
		setSelectedProductId(null);
		setLines([]);
		setPaymentMethod("Cash");
		setCurrency("UZS");
		setExchangeRate(1);
		setTotalPaid(0);
		setNotes("");
		setAttachments([]);
	};

	const totalDue = useMemo(
		() => lines.reduce((sum, i) => sum + i.quantity * i.unitPrice - (i.discount ?? 0), 0),
		[lines],
	);
	const totalPaidLocal = useMemo(
		() => (currency === "UZS" ? totalPaid : totalPaid * exchangeRate),
		[totalPaid, currency, exchangeRate],
	);

	const debt = totalDue - totalPaidLocal > 0 ? totalDue - totalPaidLocal : 0;

	const isDetailsValid = partnerId !== null && lines.length > 0;
	const isPaymentValid = isDetailsValid && (currency === "UZS" || exchangeRate > 0);
	const isFormValid = isDetailsValid && isPaymentValid;
	const advanceAmount = Math.max(totalPaidLocal - totalDue, 0);
	const totalDiscount = 0;

	const buildPayload = (): TransactionFormPayload => {
		return {
			partnerId: partnerId!,
			type: mode,
			notes: notes,
			totalPaid: totalPaid,
			exchangeRate: exchangeRate,
			currency: currency,
			paymentMethod: paymentMethod,
			lines: lines,
			attachments: attachments.length > 0 ? attachments : undefined,
			date: date,
		};
	};

	return {
		mode,
		partner,
		partnerId,
		setPartnerId,
		date,
		setDate,
		template,
		templateId,
		setTemplateId,
		selectedProduct,
		selectedProductId,
		setSelectedProductId,
		lines,
		addLine: addLine,
		removeLine: removeLine,
		updateLine: updateLine,
		paymentMethod,
		setPaymentMethod,
		currency,
		setCurrency,
		exchangeRate,
		setExchangeRate,
		totalPaid,
		setTotalPaid,
		notes,
		setNotes,
		attachments,
		addAttachments,
		removeAttachment,
		totalDue,
		totalDiscount,
		totalPaidLocal,
		debtAmount: debt,
		advanceAmount,
		isDetailsValid,
		isPaymentValid,
		isFormValid,
		reset,
		buildPayload,
	};
};
