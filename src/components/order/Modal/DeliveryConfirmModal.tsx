import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import GhostButton from "components/shared/Buttons/GhostButton";
import FormDialogHeader from "components/shared/Dialog/Form/FormDialogHeader";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { observer } from "mobx-react-lite";
import { Order } from "models/order";
import { Product } from "models/product";
import { useStore } from "stores/StoreContext";
import { designTokens, numericSx } from "theme";
import { formatQuantity } from "utils/formatCurrency";
import { MEASUREMENT_SHORT } from "utils/productUtils";

import CheckIcon from "@mui/icons-material/Check";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import {
	Alert,
	Box,
	Dialog,
	DialogActions,
	DialogContent,
	LinearProgress,
	MenuItem,
	TextField,
	Typography,
} from "@mui/material";

interface DeliveryConfirmModalProps {
	isOpen: boolean;
	isSaving: boolean;
	order: Order | null;
	onClose: () => void;
	onConfirm: (warehouseId: number) => void;
}

const DeliveryConfirmModal: React.FC<DeliveryConfirmModalProps> = ({
	isOpen,
	isSaving,
	order,
	onClose,
	onConfirm,
}) => {
	const { t } = useTranslation();
	const { warehouseStore, productStore } = useStore();
	const [warehouseId, setWarehouseId] = useState<number>(0);
	const [tried, setTried] = useState(false);

	const warehouses = warehouseStore.allWarehouses === "loading" ? [] : warehouseStore.allWarehouses;
	const productById = useMemo(() => {
		const products = productStore.allProducts === "loading" ? [] : productStore.allProducts;
		return new Map<number, Product>(products.map((p) => [p.id, p]));
	}, [productStore.allProducts]);

	useEffect(() => {
		if (isOpen) {
			warehouseStore.getAll();
			productStore.getAll();
			setTried(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen]);

	// Default to the order's warehouse, else the first active warehouse.
	useEffect(() => {
		if (isOpen && warehouses.length > 0 && !warehouseId) {
			setWarehouseId(order?.warehouseId ?? warehouses[0].id);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen, warehouses.length]);

	if (!order) {
		return null;
	}

	const stockIn = (productId: number): number =>
		productById.get(productId)?.inventoryItems.find((i) => i.inventoryId === warehouseId)
			?.quantity ?? 0;

	const checks = order.lines.map((l) => {
		const have = stockIn(l.productId);
		return { line: l, have, ok: l.quantity <= have };
	});
	const shortCount = checks.filter((c) => !c.ok).length;
	const allOk = shortCount === 0;

	const handleConfirm = () => {
		setTried(true);
		if (allOk && warehouseId) {
			onConfirm(warehouseId);
		}
	};

	const handleClose = () => {
		if (!isSaving) {
			setWarehouseId(0);
			onClose();
		}
	};

	return (
		<Dialog
			open={isOpen}
			onClose={handleClose}
			disableEscapeKeyDown={isSaving}
			disableRestoreFocus
			slotProps={{ paper: { sx: { width: 560, maxWidth: "94%", borderRadius: "12px" } } }}
		>
			<FormDialogHeader
				title={t("order.deliver.title")}
				subtitle={t("order.deliver.subtitle", {
					number: order.orderNumber,
					customer: order.customerName,
				})}
				disabled={isSaving}
				onClose={handleClose}
			/>

			{isSaving && <LinearProgress />}

			<DialogContent dividers sx={{ pt: 2 }}>
				<Typography
					sx={{ fontSize: 13.5, color: designTokens.gray700, lineHeight: 1.6, mb: "18px" }}
				>
					{t("order.deliver.lead")}
				</Typography>

				<Typography sx={{ fontSize: 13, fontWeight: 600, color: designTokens.gray700, mb: "7px" }}>
					{t("order.deliver.warehouse")}
				</Typography>
				<TextField
					select
					size="small"
					fullWidth
					value={warehouseId ? String(warehouseId) : ""}
					onChange={(e) => setWarehouseId(Number(e.target.value))}
					disabled={isSaving}
					sx={{ mb: "18px" }}
					slotProps={{
						input: {
							startAdornment: (
								<WarehouseOutlinedIcon sx={{ fontSize: 16, color: "text.disabled", mr: "6px" }} />
							),
						},
					}}
				>
					{warehouses.map((w) => (
						<MenuItem key={w.id} value={String(w.id)}>
							{w.name}
						</MenuItem>
					))}
				</TextField>

				<Box
					sx={{
						border: "1px solid",
						borderColor: "divider",
						borderRadius: "8px",
						overflow: "hidden",
					}}
				>
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							p: "10px 13px",
							bgcolor: designTokens.gray25,
							borderBottom: "1px solid",
							borderColor: "divider",
							fontSize: 12.5,
							fontWeight: 700,
							color: designTokens.gray700,
						}}
					>
						<span>{t("order.deliver.stockCheck")}</span>
						{allOk ? (
							<Box
								component="span"
								sx={{
									display: "inline-flex",
									alignItems: "center",
									gap: "5px",
									color: "success.main",
								}}
							>
								<CheckIcon sx={{ fontSize: 13 }} />
								{t("order.deliver.enough")}
							</Box>
						) : (
							<Box
								component="span"
								sx={{
									display: "inline-flex",
									alignItems: "center",
									gap: "5px",
									color: "error.main",
								}}
							>
								<ErrorOutlineIcon sx={{ fontSize: 13 }} />
								{t("order.deliver.short", { count: shortCount })}
							</Box>
						)}
					</Box>
					{checks.map(({ line, have, ok }) => {
						const unit = MEASUREMENT_SHORT[line.measurement];
						return (
							<Box
								key={line.id}
								sx={{
									display: "flex",
									flexDirection: "column",
									gap: "4px",
									p: "9px 13px",
									borderBottom: "1px solid",
									borderColor: designTokens.gray25,
									"&:last-of-type": { borderBottom: "none" },
									...(ok ? null : { bgcolor: designTokens.errorBg }),
								}}
							>
								<Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
									<Box
										component="span"
										sx={{ flex: 1, fontSize: 13, fontWeight: 500, minWidth: 0 }}
									>
										{line.productName}
									</Box>
									<Box
										component="span"
										sx={{
											...numericSx,
											display: "inline-flex",
											alignItems: "center",
											gap: "5px",
											fontWeight: 600,
											whiteSpace: "nowrap",
											color: ok ? "success.main" : "error.main",
										}}
									>
										{ok ? (
											<CheckIcon sx={{ fontSize: 14 }} />
										) : (
											<ErrorOutlineIcon sx={{ fontSize: 13 }} />
										)}
										{t("order.deliver.inStock", { qty: formatQuantity(have), unit })}
									</Box>
								</Box>
								{ok ? (
									<Box
										component="span"
										sx={{ ...numericSx, fontSize: 12, color: "text.secondary" }}
									>
										{t("order.deliver.inOrder", { qty: formatQuantity(line.quantity), unit })}
									</Box>
								) : (
									<Box
										component="span"
										sx={{
											display: "inline-flex",
											alignItems: "center",
											gap: "6px",
											fontSize: 12,
											fontWeight: 600,
											color: "error.main",
										}}
									>
										<ErrorOutlineIcon sx={{ fontSize: 13 }} />
										{t("order.deliver.shortLine", {
											have: formatQuantity(have),
											need: formatQuantity(line.quantity),
											unit,
										})}
									</Box>
								)}
							</Box>
						);
					})}
				</Box>

				{tried && !allOk && (
					<Alert
						severity="error"
						icon={<ErrorOutlineIcon />}
						variant="outlined"
						sx={{ mt: "16px" }}
					>
						{t("order.deliver.blocked", {
							count: shortCount,
							warehouse: warehouses.find((w) => w.id === warehouseId)?.name ?? "",
						})}
					</Alert>
				)}

				{allOk && (
					<Box
						sx={{
							display: "flex",
							alignItems: "flex-start",
							gap: "8px",
							mt: "12px",
							p: "9px 12px",
							bgcolor: designTokens.gray25,
							borderRadius: "8px",
							fontSize: 12.5,
							color: "text.secondary",
							lineHeight: 1.4,
						}}
					>
						<InfoOutlinedIcon sx={{ fontSize: 14, color: "text.disabled", mt: "1px" }} />
						{t("order.deliver.hint")}
					</Box>
				)}
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
				<GhostButton onClick={handleClose} disabled={isSaving}>
					{t("common.cancel")}
				</GhostButton>
				<PrimaryButton icon={<CheckIcon />} onClick={handleConfirm}>
					{t("order.deliver.confirm")}
				</PrimaryButton>
			</DialogActions>
		</Dialog>
	);
};

export default observer(DeliveryConfirmModal);
