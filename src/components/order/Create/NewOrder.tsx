import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import OrderHeaderCard from "components/order/Create/OrderHeaderCard";
import OrderLineRow from "components/order/Create/OrderLineRow";
import OrderSummaryCard from "components/order/Create/OrderSummaryCard";
import GhostButton from "components/shared/Buttons/GhostButton";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import LineEditorCard from "components/transaction/Create/LineEditorCard";
import PosPageHeader from "components/transaction/Create/PosPageHeader";
import { posColumnSx, posGridSx } from "components/transaction/Create/posStyles";
import ProductSearchBar from "components/transaction/Create/ProductSearchBar";
import { readyOr } from "helpers/Loading";
import { CartItem } from "hooks/transactions/useTransactionEntry";
import { observer } from "mobx-react-lite";
import { CreateOrderRequest, OrderSource } from "models/order";
import { Partner } from "models/partner";
import { Product } from "models/product";
import { orderDetailPath, PATHS } from "routing/paths";
import { analytics } from "services/telemetry";
import { useStore } from "stores/StoreContext";
import { addToCart } from "utils/cartUtils";
import { formatDate } from "utils/dateUtils";
import { toApiDeliveryTime } from "utils/orderUtils";

import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import { Box, Button } from "@mui/material";

/** Net discount amount of a cart line (percent of gross, or fixed capped at gross). */
const lineDiscountOf = (it: CartItem): number => {
	if (!it.discountValue) {
		return 0;
	}
	const gross = it.quantity * it.unitPrice;
	return it.discountType === "Percentage"
		? Math.round((gross * it.discountValue) / 100)
		: Math.min(it.discountValue, gross);
};
const lineGrossOf = (it: CartItem): number => it.quantity * it.unitPrice;
const lineTotalOf = (it: CartItem): number => lineGrossOf(it) - lineDiscountOf(it);

/**
 * Redesigned full-page New Order entry (`/orders/new`). An order is a pending
 * intent — a customer's requested goods before any stock or money moves — so this
 * mirrors the New Sale POS but with NO payment and NO immutability warning: it
 * collects the customer, the (intended) warehouse, source, requested delivery
 * date/time, the product-cart, address and note, then creates a Pending order.
 * Stock is shown per line for guidance only — it is never reserved here and never
 * blocks creation (the real stock check happens at delivery, rule 20).
 */
export const NewOrder: React.FC = observer(() => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { productStore, partnerStore, warehouseStore, orderStore } = useStore();

	const [client, setClient] = useState<Partner | null>(null);
	const [warehouseId, setWarehouseId] = useState<number | null>(null);
	const [source, setSource] = useState<OrderSource>("OmborWeb");
	const [items, setItems] = useState<CartItem[]>([]);
	const [address, setAddress] = useState("");
	const [note, setNote] = useState("");
	const [deliveryDate, setDeliveryDate] = useState("");
	const [deliveryTime, setDeliveryTime] = useState("");
	const [tried, setTried] = useState(false);
	const [unsavedOpen, setUnsavedOpen] = useState(false);
	const searchRef = React.useRef<HTMLInputElement>(null);

	useEffect(() => {
		void productStore.getAll();
		void partnerStore.getAll();
		void warehouseStore.getAll();
	}, [productStore, partnerStore, warehouseStore]);

	const products = readyOr(productStore.saleProducts, []);
	const customers = readyOr(partnerStore.customers, []);
	const warehouses = readyOr(warehouseStore.activeWarehouses, []);

	// Seed the warehouse default once the list arrives (matches New Sale).
	useEffect(() => {
		if (warehouseId == null && warehouses.length > 0) {
			setWarehouseId(warehouses[0].id);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [warehouses.length]);

	const inCart = useMemo(() => new Set(items.map((i) => i.product.id)), [items]);
	const subtotal = items.reduce((s, l) => s + lineGrossOf(l), 0);
	const discTotal = items.reduce((s, l) => s + lineDiscountOf(l), 0);
	const total = Math.max(0, subtotal - discTotal);

	// Order lines count in base units — a scanned package adds its size.
	const addProduct = (product: Product, asPackage = false) =>
		setItems((its) => addToCart(its, product, { unitPrice: product.salePrice, asPackage }));
	const updateItem = (index: number, patch: Partial<CartItem>) =>
		setItems((its) => its.map((it, i) => (i === index ? { ...it, ...patch } : it)));
	const removeItem = (index: number) => setItems((its) => its.filter((_, i) => i !== index));

	const clientErr = tried && !client;
	const warehouseErr = tried && warehouseId == null;
	const deliveryErr = tried && !deliveryDate;
	const linesErr = tried && items.length === 0;
	const valid = !!client && warehouseId != null && !!deliveryDate && items.length > 0;

	const dirty =
		items.length > 0 ||
		client != null ||
		address.trim() !== "" ||
		note.trim() !== "" ||
		deliveryDate !== "" ||
		deliveryTime !== "" ||
		source !== "OmborWeb";

	const warehouseName = warehouses.find((w) => w.id === warehouseId)?.name ?? "";
	const delivery = deliveryDate
		? [formatDate(deliveryDate), deliveryTime].filter(Boolean).join(" · ")
		: "";

	const tryLeave = () => {
		if (dirty) {
			setUnsavedOpen(true);
		} else {
			navigate(PATHS.orders);
		}
	};

	const submit = async () => {
		setTried(true);
		if (!valid || client == null || warehouseId == null) {
			const failed = [
				!client ? "client" : null,
				warehouseId == null ? "warehouse" : null,
				!deliveryDate ? "delivery_date" : null,
				items.length === 0 ? "items" : null,
			].filter((f): f is string => f !== null);
			analytics.capture("form_validation_failed", {
				form: "new_order",
				field_count: failed.length,
				first_field: failed[0],
			});
			return;
		}
		const payload: CreateOrderRequest = {
			customerId: client.id,
			source,
			warehouseId,
			deliveryAddress: address.trim() || null,
			deliveryDate: deliveryDate || null,
			deliveryTime: toApiDeliveryTime(deliveryTime),
			notes: note.trim() || null,
			lines: items.map((it) => ({
				productId: it.product.id,
				quantity: it.quantity,
				unitPrice: it.unitPrice,
				discount: it.discountValue,
				discountType: it.discountType,
			})),
		};
		const created = await orderStore.create(payload);
		if (created) {
			navigate(orderDetailPath(created.id));
		}
	};

	return (
		<Box>
			<PosPageHeader
				title={t("order.new.title")}
				onBack={tryLeave}
				actions={<GhostButton onClick={tryLeave}>{t("order.new.cancel")}</GhostButton>}
			/>

			<Box sx={posGridSx}>
				<Box sx={posColumnSx}>
					<OrderHeaderCard
						customers={customers}
						client={client}
						onClientChange={setClient}
						warehouses={warehouses}
						warehouseId={warehouseId}
						onWarehouseChange={setWarehouseId}
						source={source}
						onSourceChange={setSource}
						deliveryDate={deliveryDate}
						onDeliveryDateChange={setDeliveryDate}
						deliveryTime={deliveryTime}
						onDeliveryTimeChange={setDeliveryTime}
						errors={{ client: clientErr, warehouse: warehouseErr, deliveryDate: deliveryErr }}
					/>

					<ProductSearchBar
						direction="Sale"
						products={products}
						catalogue={readyOr(productStore.allProducts, [])}
						warehouseId={warehouseId}
						inCart={inCart}
						inputRef={searchRef}
						onAdd={addProduct}
						onScan={addProduct}
					/>

					<LineEditorCard
						title={t("order.new.cart.title")}
						count={items.length}
						action={
							items.length > 0 && (
								<Button variant="text" size="small" onClick={() => setItems([])}>
									{t("order.new.cart.clear")}
								</Button>
							)
						}
						empty={{
							title: t("order.new.cart.emptyTitle"),
							errorTitle: t("order.new.cart.emptyErrorTitle"),
							body: t("order.new.cart.emptyBody"),
							showError: linesErr,
						}}
						addLabel={t("order.new.cart.addProduct")}
						onAdd={() => searchRef.current?.focus()}
					>
						{items.map((item, index) => (
							<OrderLineRow
								key={item.product.id}
								item={item}
								warehouseId={warehouseId}
								lineTotal={lineTotalOf(item)}
								lineDiscount={lineDiscountOf(item)}
								onChange={(patch) => updateItem(index, patch)}
								onRemove={() => removeItem(index)}
							/>
						))}
					</LineEditorCard>
				</Box>

				<OrderSummaryCard
					client={client}
					warehouseName={warehouseName}
					delivery={delivery}
					subtotal={subtotal}
					discTotal={discTotal}
					total={total}
					address={address}
					onAddressChange={setAddress}
					note={note}
					onNoteChange={setNote}
					onSubmit={() => void submit()}
				/>
			</Box>

			<ConfirmDialog
				isOpen={unsavedOpen}
				icon={<ReportProblemOutlinedIcon sx={{ fontSize: 22 }} />}
				iconTone="warning"
				title={t("order.new.dialog.unsaved.title")}
				content={t("order.new.dialog.unsaved.body")}
				cancelLabel={t("order.new.dialog.unsaved.stay")}
				confirmLabel={t("order.new.dialog.unsaved.leave")}
				confirmVariant="warning"
				onCancel={() => setUnsavedOpen(false)}
				onConfirm={() => {
					setUnsavedOpen(false);
					navigate(PATHS.orders);
				}}
			/>
		</Box>
	);
});

export default NewOrder;
