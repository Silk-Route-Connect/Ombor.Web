import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import OrderLineRow from "components/order/Create/OrderLineRow";
import OrderSourcePicker from "components/order/Create/OrderSourcePicker";
import GhostButton from "components/shared/Buttons/GhostButton";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import PartnerPicker from "components/transaction/Create/PartnerPicker";
import ProductSearchBar from "components/transaction/Create/ProductSearchBar";
import { balancePresentation, initialsOf } from "components/transaction/Create/saleBalance";
import WarehousePicker from "components/transaction/Create/WarehousePicker";
import { CartItem } from "hooks/transactions/useTransactionEntry";
import { observer } from "mobx-react-lite";
import { CreateOrderRequest, OrderSource } from "models/order";
import { Partner } from "models/partner";
import { Product } from "models/product";
import { orderDetailPath, PATHS } from "routing/paths";
import { useStore } from "stores/StoreContext";
import { designTokens, numericSx } from "theme";
import { formatCurrency } from "utils/formatCurrency";

import AddIcon from "@mui/icons-material/Add";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import CheckIcon from "@mui/icons-material/Check";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import SearchIcon from "@mui/icons-material/Search";
import { Avatar, Box, ButtonBase, InputBase, Link, Typography } from "@mui/material";

const loaded = <T,>(value: T[] | "loading"): T[] => (value === "loading" ? [] : value);

/** Net discount amount of a cart line (percent of gross, or fixed capped at gross). */
const lineDiscountOf = (it: CartItem): number => {
	if (!it.discountValue) {
		return 0;
	}
	const gross = it.quantity * it.unitPrice;
	return it.discountType === "pct"
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
	const [source, setSource] = useState<OrderSource>("None");
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

	const products = loaded(productStore.saleProducts);
	const customers = loaded(partnerStore.customers);
	const warehouses = loaded(warehouseStore.filteredWarehouses);

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

	const addProduct = (product: Product) => {
		setItems((its) =>
			its.some((x) => x.product.id === product.id)
				? its.map((x) => (x.product.id === product.id ? { ...x, quantity: x.quantity + 1 } : x))
				: [
						...its,
						{
							product,
							quantity: 1,
							unitPrice: product.salePrice,
							discountValue: 0,
							discountType: "pct",
						},
					],
		);
	};
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
		source !== "None";

	const tone = client ? balancePresentation(client.balance) : null;
	const warehouseName = warehouses.find((w) => w.id === warehouseId)?.name ?? "";

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
			return;
		}
		const payload: CreateOrderRequest = {
			customerId: client.id,
			source,
			warehouseId,
			deliveryAddress: address.trim() || null,
			deliveryDate: deliveryDate || null,
			deliveryTime: deliveryTime || null,
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
			{/* breadcrumb */}
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					gap: "7px",
					mb: "14px",
					fontSize: 13,
					color: "text.secondary",
				}}
			>
				<Link
					component="button"
					underline="hover"
					onClick={tryLeave}
					sx={{ color: "text.secondary", fontSize: 13 }}
				>
					{t("order.title")}
				</Link>
				<ChevronRightIcon sx={{ fontSize: 14 }} />
				<Typography component="b" sx={{ fontSize: 13, fontWeight: 600, color: "text.primary" }}>
					{t("order.new.title")}
				</Typography>
			</Box>

			{/* header */}
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					gap: "16px",
					mb: "18px",
					flexWrap: "wrap",
				}}
			>
				<Box sx={{ display: "flex", alignItems: "center", gap: "14px" }}>
					<ButtonBase
						onClick={tryLeave}
						sx={{
							width: 38,
							height: 38,
							borderRadius: "8px",
							border: "1px solid",
							borderColor: designTokens.gray300,
							bgcolor: "background.paper",
							color: designTokens.gray600,
							"&:hover": { bgcolor: designTokens.gray50, borderColor: designTokens.gray400 },
						}}
					>
						<ChevronLeftIcon sx={{ fontSize: 20 }} />
					</ButtonBase>
					<Typography
						component="h1"
						sx={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em" }}
					>
						{t("order.new.title")}
					</Typography>
				</Box>
				<GhostButton onClick={tryLeave}>{t("order.new.cancel")}</GhostButton>
			</Box>

			{/* POS grid */}
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 360px" },
					alignItems: "start",
					gap: "18px",
				}}
			>
				{/* LEFT */}
				<Box sx={{ display: "flex", flexDirection: "column", gap: "16px", minWidth: 0 }}>
					{/* selectors */}
					<Box
						sx={{
							bgcolor: "background.paper",
							border: "1px solid",
							borderColor: "divider",
							borderRadius: "12px",
							boxShadow: 1,
							p: "16px 18px",
							display: "flex",
							flexDirection: "column",
							gap: "14px",
						}}
					>
						<Box
							sx={{
								display: "grid",
								gridTemplateColumns: { xs: "1fr", sm: "1.3fr 1fr 1fr" },
								gap: "14px",
							}}
						>
							<Field
								label={t("order.field.client")}
								required
								error={clientErr ? t("order.new.err.client") : undefined}
							>
								<PartnerPicker
									direction="Sale"
									partner={client}
									partners={customers}
									error={clientErr}
									onPick={setClient}
								/>
							</Field>
							<Field
								label={t("order.new.field.warehouse")}
								required
								error={warehouseErr ? t("order.new.err.warehouse") : undefined}
							>
								<WarehousePicker
									value={warehouseId}
									warehouses={warehouses}
									onChange={setWarehouseId}
								/>
							</Field>
							<Field label={t("order.field.source")}>
								<OrderSourcePicker value={source} onChange={setSource} />
							</Field>
						</Box>

						<Box
							sx={{
								display: "grid",
								gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
								gap: "14px",
							}}
						>
							<Field
								label={t("order.field.deliveryDate")}
								required
								error={deliveryErr ? t("order.new.err.deliveryDate") : undefined}
							>
								<DateTimeControl
									icon={<CalendarTodayOutlinedIcon sx={{ fontSize: 17 }} />}
									type="date"
									value={deliveryDate}
									error={deliveryErr}
									onChange={setDeliveryDate}
								/>
							</Field>
							<Field label={t("order.field.deliveryTime")} optional={t("order.new.optional")}>
								<DateTimeControl
									icon={<ScheduleOutlinedIcon sx={{ fontSize: 17 }} />}
									type="time"
									value={deliveryTime}
									onChange={setDeliveryTime}
								/>
							</Field>
						</Box>
					</Box>

					{/* product search */}
					<ProductSearchBar
						direction="Sale"
						products={products}
						warehouseId={warehouseId}
						inCart={inCart}
						inputRef={searchRef}
						onAdd={addProduct}
					/>

					{/* cart */}
					<Box
						sx={{
							bgcolor: "background.paper",
							border: "1px solid",
							borderColor: "divider",
							borderRadius: "12px",
							boxShadow: 1,
							overflow: "hidden",
						}}
					>
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								p: "14px 18px",
								borderBottom: items.length > 0 ? "1px solid" : "none",
								borderColor: "divider",
							}}
						>
							<Typography sx={{ fontSize: 15, fontWeight: 700 }}>
								{t("order.new.cart.title")}{" "}
								<Box component="span" sx={{ color: "text.disabled", fontWeight: 500 }}>
									· {items.length}
								</Box>
							</Typography>
							{items.length > 0 && (
								<ButtonBase
									onClick={() => setItems([])}
									sx={{ fontSize: 13, fontWeight: 600, color: "primary.main", px: "4px" }}
								>
									{t("order.new.cart.clear")}
								</ButtonBase>
							)}
						</Box>

						{items.length === 0 ? (
							<Box sx={{ p: "40px 24px", textAlign: "center" }}>
								<Box
									sx={{
										width: 46,
										height: 46,
										borderRadius: "50%",
										display: "grid",
										placeItems: "center",
										mx: "auto",
										mb: "12px",
										bgcolor: linesErr ? designTokens.errorBg : designTokens.primarySoft,
										color: linesErr ? "error.main" : "primary.main",
									}}
								>
									{linesErr ? <ErrorOutlineIcon /> : <SearchIcon />}
								</Box>
								<Typography
									sx={{
										fontSize: 14,
										fontWeight: 600,
										color: linesErr ? "error.main" : "text.primary",
									}}
								>
									{linesErr ? t("order.new.cart.emptyErrorTitle") : t("order.new.cart.emptyTitle")}
								</Typography>
								<Typography sx={{ fontSize: 13, color: "text.secondary", mt: "4px" }}>
									{t("order.new.cart.emptyBody")}
								</Typography>
							</Box>
						) : (
							<>
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
								<ButtonBase
									onClick={() => searchRef.current?.focus()}
									sx={{
										width: "100%",
										justifyContent: "flex-start",
										gap: "7px",
										p: "12px 18px",
										borderTop: "1px solid",
										borderColor: "divider",
										fontSize: 13.5,
										fontWeight: 600,
										color: "primary.main",
										"&:hover": { bgcolor: designTokens.primarySoft },
									}}
								>
									<AddIcon sx={{ fontSize: 16 }} />
									{t("order.new.cart.addProduct")}
								</ButtonBase>
							</>
						)}
					</Box>
				</Box>

				{/* RIGHT */}
				<Box
					sx={{
						bgcolor: "background.paper",
						border: "1px solid",
						borderColor: "divider",
						borderRadius: "12px",
						boxShadow: 1,
						position: "sticky",
						top: 16,
						overflow: "hidden",
					}}
				>
					{/* customer card */}
					{client && tone ? (
						<Box sx={{ p: "16px 18px", borderBottom: "1px solid", borderColor: "divider" }}>
							<Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
								<Avatar
									sx={{
										width: 40,
										height: 40,
										fontSize: 14,
										fontWeight: 700,
										bgcolor: designTokens.primarySoft,
										color: "primary.main",
									}}
								>
									{initialsOf(client.name)}
								</Avatar>
								<Box sx={{ minWidth: 0 }}>
									<Typography sx={{ fontSize: 15, fontWeight: 700 }} noWrap>
										{client.name}
									</Typography>
									<Typography sx={{ fontSize: 12.5, color: "text.secondary" }} noWrap>
										{t(`order.partnerType.${client.type}`)}
									</Typography>
								</Box>
							</Box>
							<Box sx={{ mt: "14px" }}>
								<Typography sx={{ fontSize: 12, color: "text.secondary" }}>
									{t(tone.labelKey)}
								</Typography>
								<Typography
									sx={{
										...numericSx,
										fontSize: 23,
										fontWeight: 800,
										color: tone.color,
										lineHeight: 1.05,
									}}
								>
									{formatCurrency(Math.abs(client.balance))}
									<Box
										component="span"
										sx={{ fontSize: 13, fontWeight: 600, color: "text.disabled", ml: "6px" }}
									>
										UZS
									</Box>
								</Typography>
							</Box>
						</Box>
					) : (
						<Box
							sx={{
								p: "16px 18px",
								borderBottom: "1px solid",
								borderColor: "divider",
								bgcolor: designTokens.gray25,
								display: "flex",
								alignItems: "center",
								gap: "11px",
								color: "text.secondary",
								fontSize: 13,
							}}
						>
							<PersonOutlineIcon sx={{ fontSize: 18, color: "text.disabled" }} />
							{t("order.new.pickClient")}
						</Box>
					)}

					{/* summary */}
					<Box sx={{ p: "16px 18px", display: "flex", flexDirection: "column", gap: "11px" }}>
						<SumRow label={t("order.field.client")} value={client?.name ?? "—"} text />
						<SumRow label={t("order.new.field.warehouse")} value={warehouseName || "—"} text />
						<SumRow
							label={t("order.new.summary.delivery")}
							value={
								deliveryDate
									? deliveryTime
										? `${deliveryDate} · ${deliveryTime}`
										: deliveryDate
									: "—"
							}
							valueColor={deliveryDate ? "text.primary" : "text.disabled"}
						/>
						<Box sx={{ height: "1px", bgcolor: "divider", my: "3px" }} />
						<SumRow label={t("order.new.summary.subtotal")} value={formatCurrency(subtotal)} />
						<SumRow
							label={t("order.new.summary.discount")}
							value={discTotal > 0 ? `−${formatCurrency(discTotal)}` : "—"}
							valueColor={discTotal > 0 ? "error.main" : "text.disabled"}
						/>
						<Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
							<Typography sx={{ fontSize: 15, fontWeight: 700 }}>
								{t("order.new.summary.total")}
							</Typography>
							<Typography
								sx={{
									...numericSx,
									fontSize: 22,
									fontWeight: 800,
									color: "primary.main",
									letterSpacing: "-0.02em",
								}}
							>
								{formatCurrency(total)}
								<Box
									component="span"
									sx={{ fontSize: 12, fontWeight: 600, color: "text.disabled", ml: "5px" }}
								>
									UZS
								</Box>
							</Typography>
						</Box>
					</Box>

					{/* address */}
					<SideBlock label={t("order.field.address")} optional={t("order.new.optional")}>
						<TextControl
							value={address}
							placeholder={t("order.edit.addressPlaceholder")}
							onChange={setAddress}
						/>
					</SideBlock>
					{/* note */}
					<SideBlock label={t("order.field.note")} optional={t("order.new.optional")}>
						<TextControl
							value={note}
							placeholder={t("order.edit.notePlaceholder")}
							onChange={setNote}
							multiline
						/>
					</SideBlock>

					{/* submit */}
					<Box
						sx={{
							p: "16px 18px",
							borderTop: "1px solid",
							borderColor: "divider",
							display: "flex",
							flexDirection: "column",
							gap: "10px",
						}}
					>
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								gap: "8px",
								p: "7px 10px",
								borderRadius: "6px",
								bgcolor: designTokens.infoBg,
								fontSize: 11.5,
								color: "text.secondary",
								lineHeight: 1.35,
							}}
						>
							<InfoOutlinedIcon sx={{ fontSize: 14, color: "info.main", flex: "0 0 auto" }} />
							{t("order.new.editableNote")}
						</Box>
						<PrimaryButton
							icon={<CheckIcon />}
							onClick={() => void submit()}
							fullWidth
							sx={{ height: 50, fontSize: 15 }}
						>
							{t("order.new.submit")}
						</PrimaryButton>
					</Box>
				</Box>
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

/* ── small presentational helpers ── */

const Field: React.FC<{
	label: string;
	required?: boolean;
	optional?: string;
	error?: string;
	children: React.ReactNode;
}> = ({ label, required, optional, error, children }) => (
	<Box sx={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: 0 }}>
		<Typography
			component="span"
			sx={{
				fontSize: 11.5,
				fontWeight: 700,
				letterSpacing: "0.03em",
				textTransform: "uppercase",
				color: "text.disabled",
				display: "flex",
				alignItems: "center",
				gap: "6px",
			}}
		>
			{label}
			{required && (
				<Box component="span" sx={{ color: "error.main" }}>
					*
				</Box>
			)}
			{optional && (
				<Box component="span" sx={{ fontWeight: 500, textTransform: "none", letterSpacing: 0 }}>
					· {optional}
				</Box>
			)}
		</Typography>
		{children}
		{error && (
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					gap: "5px",
					fontSize: 12,
					color: "error.main",
					fontWeight: 600,
				}}
			>
				<ErrorOutlineIcon sx={{ fontSize: 12 }} />
				{error}
			</Box>
		)}
	</Box>
);

const DateTimeControl: React.FC<{
	icon: React.ReactNode;
	type: "date" | "time";
	value: string;
	error?: boolean;
	onChange: (v: string) => void;
}> = ({ icon, type, value, error, onChange }) => (
	<Box
		sx={{
			display: "flex",
			alignItems: "center",
			gap: "9px",
			height: 45,
			px: "12px",
			border: "1px solid",
			borderColor: error ? "error.main" : designTokens.gray300,
			borderRadius: "8px",
			bgcolor: "background.paper",
			color: error ? "error.main" : "text.disabled",
			"&:focus-within": { borderColor: "primary.main" },
		}}
	>
		{icon}
		<Box
			component="input"
			type={type}
			value={value}
			onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
			sx={{
				flex: 1,
				minWidth: 0,
				border: "none",
				outline: "none",
				bgcolor: "transparent",
				font: "inherit",
				fontSize: 14,
				color: "text.primary",
				...numericSx,
			}}
		/>
	</Box>
);

const TextControl: React.FC<{
	value: string;
	placeholder: string;
	multiline?: boolean;
	onChange: (v: string) => void;
}> = ({ value, placeholder, multiline, onChange }) => (
	<InputBase
		value={value}
		placeholder={placeholder}
		multiline={multiline}
		minRows={multiline ? 2 : undefined}
		onChange={(e) => onChange(e.target.value)}
		sx={{
			border: "1px solid",
			borderColor: designTokens.gray300,
			borderRadius: "6px",
			p: "8px 11px",
			fontSize: 13.5,
			"&:focus-within": { borderColor: "primary.main" },
		}}
	/>
);

const SideBlock: React.FC<{ label: string; optional?: string; children: React.ReactNode }> = ({
	label,
	optional,
	children,
}) => (
	<Box
		sx={{
			p: "14px 18px",
			borderTop: "1px solid",
			borderColor: "divider",
			display: "flex",
			flexDirection: "column",
			gap: "7px",
		}}
	>
		<Typography sx={{ fontSize: 12.5, fontWeight: 700, color: designTokens.gray700 }}>
			{label}
			{optional && (
				<Box component="span" sx={{ fontWeight: 500, color: "text.disabled" }}>
					{" "}
					· {optional}
				</Box>
			)}
		</Typography>
		{children}
	</Box>
);

const SumRow: React.FC<{
	label: string;
	value: string;
	valueColor?: string;
	text?: boolean;
}> = ({ label, value, valueColor, text }) => (
	<Box
		sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 14 }}
	>
		<Box component="span" sx={{ color: "text.secondary" }}>
			{label}
		</Box>
		<Box
			component="span"
			sx={{
				...(text ? {} : numericSx),
				fontWeight: 600,
				color: valueColor ?? "text.primary",
				maxWidth: "60%",
				textAlign: "right",
				overflow: "hidden",
				textOverflow: "ellipsis",
				whiteSpace: "nowrap",
			}}
		>
			{value}
		</Box>
	</Box>
);

export default NewOrder;
