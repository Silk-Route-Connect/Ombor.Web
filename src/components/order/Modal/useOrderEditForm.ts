import { useEffect, useMemo, useState } from "react";
import { isReady, readyOr } from "helpers/Loading";
import { Order, OrderSource, UpdateOrderRequest } from "models/order";
import { Partner } from "models/partner";
import { Product } from "models/product";
import { useStore } from "stores/StoreContext";
import { shortDeliveryTime, toApiDeliveryTime } from "utils/orderUtils";

import { EditLine } from "./OrderEditLineRow";

interface UseOrderEditFormOptions {
	isOpen: boolean;
	order: Order | null;
	onSave: (payload: UpdateOrderRequest) => void;
}

/**
 * The order-edit modal's draft: every field reset from the order on open, the
 * line editors, and the submit that validates client / delivery date / lines
 * inline before saving. Each edit marks the draft dirty (the discard confirm).
 */
export function useOrderEditForm({ isOpen, order, onSave }: UseOrderEditFormOptions) {
	const { partnerStore, productStore, warehouseStore } = useStore();

	const [client, setClient] = useState<Partner | null>(null);
	const [source, setSource] = useState<OrderSource>("OmborWeb");
	const [warehouseId, setWarehouseId] = useState<number | "">("");
	const [lines, setLines] = useState<EditLine[]>([]);
	const [address, setAddress] = useState("");
	const [deliveryDate, setDeliveryDate] = useState("");
	const [deliveryTime, setDeliveryTime] = useState("");
	const [note, setNote] = useState("");
	const [submitted, setSubmitted] = useState(false);
	const [dirty, setDirty] = useState(false);

	const activeProducts = useMemo(
		() =>
			!isReady(productStore.allProducts)
				? []
				: productStore.allProducts.filter((p) => !p.isArchived),
		[productStore.allProducts],
	);
	const allPartners = readyOr(partnerStore.allPartners, []);
	const warehouses = useMemo(
		() => readyOr(warehouseStore.activeWarehouses, []),
		[warehouseStore.activeWarehouses],
	);

	// Reset the form from the order whenever the modal (re)opens.
	useEffect(() => {
		if (isOpen && order) {
			partnerStore.getAll();
			productStore.getAll();
			warehouseStore.getAll();
			setClient(allPartners.find((p) => p.id === order.customerId) ?? null);
			setSource(order.source);
			setWarehouseId(order.warehouseId ?? "");
			setLines(order.lines.map((l) => ({ ...l })));
			setAddress(order.deliveryAddress ?? "");
			setDeliveryDate(order.deliveryDate ?? "");
			setDeliveryTime(order.deliveryTime ? shortDeliveryTime(order.deliveryTime) : "");
			setNote(order.notes ?? "");
			setSubmitted(false);
			setDirty(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen, order?.id]);

	// Resolve the client object once partners finish loading (deep-link open).
	useEffect(() => {
		if (isOpen && order && !client) {
			const found = allPartners.find((p) => p.id === order.customerId);
			if (found) {
				setClient(found);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [allPartners.length]);

	const markDirty = () => setDirty(true);

	const addProduct = (p: Product) => {
		if (lines.some((l) => l.productId === p.id)) {
			return;
		}
		setLines((ls) => [
			...ls,
			{
				productId: p.id,
				productName: p.name,
				sku: p.sku,
				measurement: p.measurement,
				quantity: 1,
				unitPrice: p.salePrice,
				discount: 0,
				discountType: "Percentage",
			},
		]);
		markDirty();
	};
	const updateLine = (index: number, patch: Partial<EditLine>) => {
		setLines((ls) => ls.map((l, i) => (i === index ? { ...l, ...patch } : l)));
		markDirty();
	};
	const removeLine = (index: number) => {
		setLines((ls) => ls.filter((_, i) => i !== index));
		markDirty();
	};

	const clientErr = submitted && !client;
	const deliverErr = submitted && !deliveryDate;
	const linesErr = submitted && lines.length === 0;

	const submit = () => {
		setSubmitted(true);
		if (!client || !deliveryDate || lines.length === 0 || !order) {
			return;
		}
		onSave({
			id: order.id,
			customerId: client.id,
			source,
			warehouseId: warehouseId === "" ? null : warehouseId,
			deliveryAddress: address.trim() || null,
			deliveryDate: deliveryDate || null,
			deliveryTime: toApiDeliveryTime(deliveryTime),
			notes: note.trim() || null,
			lines: lines.map((l) => ({
				productId: l.productId,
				quantity: l.quantity,
				unitPrice: l.unitPrice,
				discount: l.discount,
				discountType: l.discountType,
			})),
		});
	};

	const edit =
		<T>(set: (value: T) => void) =>
		(value: T) => {
			set(value);
			markDirty();
		};

	return {
		client,
		source,
		warehouseId,
		lines,
		address,
		deliveryDate,
		deliveryTime,
		note,
		dirty,
		activeProducts,
		warehouses,
		pickedIds: lines.map((l) => l.productId),
		setClient: edit(setClient),
		setSource: edit(setSource),
		setWarehouseId: edit(setWarehouseId),
		setAddress: edit(setAddress),
		setDeliveryDate: edit(setDeliveryDate),
		setDeliveryTime: edit(setDeliveryTime),
		setNote: edit(setNote),
		addProduct,
		updateLine,
		removeLine,
		clientErr,
		deliverErr,
		linesErr,
		submit,
	};
}
