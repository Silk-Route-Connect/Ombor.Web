import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import PartnerAutocomplete from "components/partner/Autocomplete/PartnerAutocomplete";
import EntityAutocomplete from "components/shared/Autocomplete/Autocomplete";
import GhostButton from "components/shared/Buttons/GhostButton";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import FormDialogHeader from "components/shared/Dialog/Form/FormDialogHeader";
import FormFieldLabel from "components/shared/Forms/FormFieldLabel";
import NumericField from "components/shared/Inputs/NumericField";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { useDirtyClose } from "hooks/shared/useDirtyClose";
import { observer } from "mobx-react-lite";
import { Order, OrderLineDiscountType, OrderSource, UpdateOrderRequest } from "models/order";
import { Partner } from "models/partner";
import { Measurement, Product } from "models/product";
import { useStore } from "stores/StoreContext";
import { designTokens, numericSx } from "theme";
import { formatCurrency } from "utils/formatCurrency";
import { lineNet } from "utils/orderUtils";

import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CheckIcon from "@mui/icons-material/Check";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import {
	Alert,
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	IconButton,
	InputAdornment,
	LinearProgress,
	MenuItem,
	TextField,
	Typography,
} from "@mui/material";

interface OrderFormModalProps {
	isOpen: boolean;
	isSaving: boolean;
	order: Order | null;
	onClose: () => void;
	onSave: (payload: UpdateOrderRequest) => void;
}

type EditLine = {
	productId: number;
	productName: string;
	sku: string;
	measurement: Measurement;
	quantity: number;
	unitPrice: number;
	discount: number;
	discountType: OrderLineDiscountType;
};

const SOURCE_OPTIONS: OrderSource[] = ["None", "Telegram", "OmborWeb"];

const QtyStepper: React.FC<{
	value: number;
	disabled: boolean;
	onChange: (qty: number) => void;
}> = ({ value, disabled, onChange }) => {
	const btnSx = {
		minWidth: 28,
		width: 28,
		height: 34,
		p: 0,
		fontSize: 17,
		color: "text.secondary",
		borderRadius: 0,
	} as const;
	return (
		<Box
			sx={{
				display: "inline-flex",
				alignItems: "center",
				border: "1px solid",
				borderColor: designTokens.gray300,
				borderRadius: "8px",
				overflow: "hidden",
			}}
		>
			<Button sx={btnSx} disabled={disabled || value <= 1} onClick={() => onChange(value - 1)}>
				−
			</Button>
			<Box
				component="input"
				value={value}
				disabled={disabled}
				onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
					const n = parseInt(e.target.value.replace(/[^\d]/g, ""), 10);
					onChange(Number.isNaN(n) || n < 1 ? 1 : n);
				}}
				sx={{
					width: 40,
					height: 34,
					border: "none",
					outline: "none",
					textAlign: "center",
					font: "inherit",
					fontWeight: 600,
					...numericSx,
					borderLeft: "1px solid",
					borderRight: "1px solid",
					borderColor: designTokens.gray200,
					bgcolor: "transparent",
				}}
			/>
			<Button sx={btnSx} disabled={disabled} onClick={() => onChange(value + 1)}>
				+
			</Button>
		</Box>
	);
};

const toNumberOrZero = (raw: string): number => {
	const v = raw.trim();
	return v === "" ? 0 : Number(v.replace(/[^\d]/g, ""));
};

const OrderFormModal: React.FC<OrderFormModalProps> = ({
	isOpen,
	isSaving,
	order,
	onClose,
	onSave,
}) => {
	const { t } = useTranslation();
	const { partnerStore, productStore } = useStore();

	const [client, setClient] = useState<Partner | null>(null);
	const [source, setSource] = useState<OrderSource>("None");
	const [lines, setLines] = useState<EditLine[]>([]);
	const [address, setAddress] = useState("");
	const [deliveryDate, setDeliveryDate] = useState("");
	const [deliveryTime, setDeliveryTime] = useState("");
	const [note, setNote] = useState("");
	const [submitted, setSubmitted] = useState(false);
	const [dirty, setDirty] = useState(false);

	const activeProducts = useMemo(
		() =>
			productStore.allProducts === "loading"
				? []
				: productStore.allProducts.filter((p) => !p.isArchived),
		[productStore.allProducts],
	);
	const allPartners = partnerStore.allPartners === "loading" ? [] : partnerStore.allPartners;

	// Reset the form from the order whenever the modal (re)opens.
	useEffect(() => {
		if (isOpen && order) {
			partnerStore.getAll();
			productStore.getAll();
			setClient(allPartners.find((p) => p.id === order.customerId) ?? null);
			setSource(order.source);
			setLines(order.lines.map((l) => ({ ...l })));
			setAddress(order.deliveryAddress ?? "");
			setDeliveryDate(order.deliveryDate ?? "");
			setDeliveryTime(order.deliveryTime ?? "");
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
	const total = lines.reduce((sum, l) => sum + lineNet(l), 0);

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
				discountType: "pct",
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
	const showBanner = clientErr || deliverErr || linesErr;
	const missing = [
		clientErr && t("order.field.clientLower"),
		deliverErr && t("order.field.deliveryDateLower"),
		linesErr && t("order.field.linesLower"),
	]
		.filter(Boolean)
		.join(", ");

	const submit = () => {
		setSubmitted(true);
		if (!client || !deliveryDate || lines.length === 0 || !order) {
			return;
		}
		onSave({
			id: order.id,
			customerId: client.id,
			source,
			deliveryAddress: address.trim() || null,
			deliveryDate: deliveryDate || null,
			deliveryTime: deliveryTime || null,
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

	const { discardOpen, requestClose, cancelDiscard, confirmDiscard } = useDirtyClose(
		dirty,
		isSaving,
		onClose,
	);

	const pickedIds = lines.map((l) => l.productId);

	return (
		<>
			<Dialog
				open={isOpen}
				onClose={requestClose}
				disableEscapeKeyDown={isSaving}
				disableRestoreFocus
				slotProps={{ paper: { sx: { width: 860, maxWidth: "95%", borderRadius: "12px" } } }}
			>
				<FormDialogHeader
					title={order ? t("order.edit.title", { number: order.orderNumber }) : ""}
					subtitle={t("order.edit.subtitle")}
					disabled={isSaving}
					onClose={requestClose}
				/>

				{isSaving && <LinearProgress />}

				<DialogContent dividers sx={{ pt: 2 }}>
					{showBanner && (
						<Alert
							severity="error"
							icon={<ErrorOutlineIcon />}
							variant="outlined"
							sx={{ mb: "16px" }}
						>
							{t("order.edit.errFields", { fields: missing })}
						</Alert>
					)}

					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
							gap: "18px",
							mb: "18px",
						}}
					>
						<Box>
							<FormFieldLabel label={t("order.field.client")} required />
							<Box sx={{ mt: "7px" }}>
								<PartnerAutocomplete
									type="Customer"
									size="small"
									value={client}
									onChange={(p) => {
										setClient(p);
										markDirty();
									}}
								/>
							</Box>
						</Box>
						<Box>
							<FormFieldLabel label={t("order.field.source")} />
							<TextField
								select
								size="small"
								fullWidth
								value={source}
								onChange={(e) => {
									setSource(e.target.value as OrderSource);
									markDirty();
								}}
								sx={{ mt: "7px" }}
							>
								{SOURCE_OPTIONS.map((s) => (
									<MenuItem key={s} value={s}>
										{t(`order.source.${s}`)}
									</MenuItem>
								))}
							</TextField>
						</Box>
					</Box>

					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
							gap: "18px",
							mb: "18px",
						}}
					>
						<Box>
							<FormFieldLabel label={t("order.field.deliveryDate")} required />
							<TextField
								type="date"
								size="small"
								fullWidth
								value={deliveryDate}
								disabled={isSaving}
								error={deliverErr}
								helperText={deliverErr ? t("order.edit.deliveryDateRequired") : undefined}
								onChange={(e) => {
									setDeliveryDate(e.target.value);
									markDirty();
								}}
								sx={{ mt: "7px" }}
							/>
						</Box>
						<Box>
							<FormFieldLabel label={t("order.field.deliveryTime")} />
							<TextField
								type="time"
								size="small"
								fullWidth
								value={deliveryTime}
								disabled={isSaving}
								onChange={(e) => {
									setDeliveryTime(e.target.value);
									markDirty();
								}}
								sx={{ mt: "7px" }}
							/>
						</Box>
					</Box>

					<FormFieldLabel label={t("order.field.lines")} required />
					<Box sx={{ mt: "8px", mb: "12px" }}>
						<EntityAutocomplete<Product>
							label=""
							placeholder={t("order.edit.productPlaceholder")}
							size="small"
							options={activeProducts.filter((p) => !pickedIds.includes(p.id))}
							value={null}
							disabled={isSaving}
							additionalFilter={(p, text) => p.sku.toLowerCase().includes(text)}
							onChange={(p) => p && addProduct(p)}
						/>
					</Box>

					<Box
						sx={{
							border: "1px solid",
							borderColor: linesErr ? designTokens.errorBorder : "divider",
							borderRadius: "12px",
							overflow: "hidden",
						}}
					>
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								p: "12px 16px",
								bgcolor: designTokens.gray25,
								borderBottom: "1px solid",
								borderColor: "divider",
							}}
						>
							<Typography sx={{ fontSize: 14, fontWeight: 700 }}>
								{t("order.field.lines")}{" "}
								<Box component="span" sx={{ color: "text.disabled", fontWeight: 500 }}>
									· {lines.length}
								</Box>
							</Typography>
							{lines.length > 0 && (
								<Typography sx={{ fontSize: 13, color: "text.secondary" }}>
									{t("order.edit.total")}:{" "}
									<Box component="b" sx={{ ...numericSx, color: "text.primary", fontWeight: 700 }}>
										{formatCurrency(total)}
									</Box>{" "}
									UZS
								</Typography>
							)}
						</Box>

						{lines.length === 0 ? (
							<Box sx={{ p: "28px 18px", textAlign: "center" }}>
								<Box
									sx={{
										width: 46,
										height: 46,
										borderRadius: "50%",
										mx: "auto",
										mb: "12px",
										display: "grid",
										placeItems: "center",
										bgcolor: designTokens.gray100,
										color: designTokens.gray500,
									}}
								>
									<Inventory2OutlinedIcon sx={{ fontSize: 22 }} />
								</Box>
								<Typography sx={{ fontSize: 14, fontWeight: 600 }}>
									{t("order.edit.emptyTitle")}
								</Typography>
								<Typography sx={{ fontSize: 12.5, color: "text.secondary", mt: "3px" }}>
									{t("order.edit.emptyBody")}
								</Typography>
							</Box>
						) : (
							lines.map((line, index) => (
								<Box
									key={line.productId}
									sx={{
										p: "14px 16px",
										borderBottom: "1px solid",
										borderColor: "divider",
										"&:last-of-type": { borderBottom: "none" },
									}}
								>
									<Box sx={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
										<Box sx={{ minWidth: 0 }}>
											<Typography sx={{ fontSize: 14, fontWeight: 600 }}>
												{line.productName}
											</Typography>
											<Typography
												sx={{ ...numericSx, fontSize: 12, color: "text.disabled", mt: "2px" }}
											>
												{line.sku}
											</Typography>
										</Box>
										<Box component="span" sx={{ ...numericSx, fontWeight: 700, fontSize: 15 }}>
											{formatCurrency(lineNet(line))}
										</Box>
									</Box>
									<Box
										sx={{
											display: "flex",
											alignItems: "flex-end",
											gap: "14px",
											flexWrap: "wrap",
											mt: "10px",
										}}
									>
										<Box>
											<Typography sx={labelSx}>{t("order.edit.qty")}</Typography>
											<QtyStepper
												value={line.quantity}
												disabled={isSaving}
												onChange={(q) => updateLine(index, { quantity: q })}
											/>
										</Box>
										<Box>
											<Typography sx={labelSx}>{t("order.edit.unitPrice")}</Typography>
											<NumericField
												value={line.unitPrice || ""}
												size="small"
												min={0}
												disabled={isSaving}
												onChange={(e) =>
													updateLine(index, { unitPrice: toNumberOrZero(e.target.value) })
												}
												sx={{ width: 140 }}
												slotProps={{
													input: {
														endAdornment: <InputAdornment position="end">UZS</InputAdornment>,
														sx: { ...numericSx, fontWeight: 600 },
													},
												}}
											/>
										</Box>
										<Box>
											<Typography sx={labelSx}>{t("order.edit.discount")}</Typography>
											<Box sx={{ display: "flex", gap: "6px" }}>
												<NumericField
													value={line.discount || ""}
													size="small"
													min={0}
													disabled={isSaving}
													onChange={(e) =>
														updateLine(index, { discount: toNumberOrZero(e.target.value) })
													}
													sx={{ width: 84 }}
													slotProps={{ input: { sx: { ...numericSx } } }}
												/>
												<Box
													sx={{
														display: "inline-flex",
														border: "1px solid",
														borderColor: designTokens.gray300,
														borderRadius: "8px",
														overflow: "hidden",
													}}
												>
													{(["pct", "fixed"] as OrderLineDiscountType[]).map((dt) => {
														const on = line.discountType === dt;
														return (
															<Button
																key={dt}
																onClick={() => updateLine(index, { discountType: dt })}
																disabled={isSaving}
																sx={{
																	minWidth: 34,
																	height: 40,
																	p: 0,
																	borderRadius: 0,
																	color: on ? "primary.main" : "text.secondary",
																	bgcolor: on ? designTokens.primarySoft : "transparent",
																}}
															>
																{dt === "pct" ? "%" : <AttachMoneyIcon sx={{ fontSize: 16 }} />}
															</Button>
														);
													})}
												</Box>
											</Box>
										</Box>
										<Box sx={{ ml: "auto" }}>
											<IconButton
												onClick={() => removeLine(index)}
												aria-label={t("common.delete")}
												sx={{
													width: 38,
													height: 38,
													color: designTokens.gray500,
													"&:hover": { bgcolor: designTokens.errorBg, color: "error.main" },
												}}
											>
												<DeleteOutlineIcon sx={{ fontSize: 19 }} />
											</IconButton>
										</Box>
									</Box>
								</Box>
							))
						)}
					</Box>

					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
							gap: "18px",
							mt: "18px",
						}}
					>
						<Box>
							<FormFieldLabel label={t("order.field.address")} />
							<TextField
								size="small"
								fullWidth
								value={address}
								placeholder={t("order.edit.addressPlaceholder")}
								disabled={isSaving}
								onChange={(e) => {
									setAddress(e.target.value);
									markDirty();
								}}
								sx={{ mt: "7px" }}
							/>
						</Box>
						<Box>
							<FormFieldLabel label={t("order.field.note")} />
							<TextField
								size="small"
								fullWidth
								value={note}
								placeholder={t("order.edit.notePlaceholder")}
								disabled={isSaving}
								onChange={(e) => {
									setNote(e.target.value);
									markDirty();
								}}
								sx={{ mt: "7px" }}
							/>
						</Box>
					</Box>

					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							gap: "8px",
							mt: "16px",
							fontSize: 12.5,
							color: "text.secondary",
						}}
					>
						<InfoOutlinedIcon sx={{ fontSize: 15, color: "text.disabled" }} />
						{t("order.edit.warehouseHint")}
					</Box>
				</DialogContent>

				<DialogActions
					sx={{
						px: "24px",
						py: "14px",
						gap: "10px",
						borderTop: "1px solid",
						borderColor: "divider",
						bgcolor: designTokens.gray25,
					}}
				>
					<Box sx={{ flexGrow: 1 }} />
					<GhostButton onClick={requestClose} disabled={isSaving}>
						{t("common.cancel")}
					</GhostButton>
					<PrimaryButton icon={<CheckIcon />} onClick={submit}>
						{t("common.save")}
					</PrimaryButton>
				</DialogActions>
			</Dialog>

			<ConfirmDialog
				isOpen={discardOpen}
				icon={<ReportProblemOutlinedIcon sx={{ fontSize: 22 }} />}
				iconTone="warning"
				title={t("common.dialog.discardChanges.title")}
				content={t("common.dialog.discardChanges.body")}
				confirmLabel={t("common.dialog.discardChanges.confirm")}
				cancelLabel={t("common.dialog.discardChanges.cancel")}
				confirmVariant="danger"
				onConfirm={confirmDiscard}
				onCancel={cancelDiscard}
			/>
		</>
	);
};

const labelSx = {
	fontSize: 10.5,
	fontWeight: 600,
	letterSpacing: ".04em",
	textTransform: "uppercase",
	color: "text.disabled",
	mb: "4px",
} as const;

export default observer(OrderFormModal);
