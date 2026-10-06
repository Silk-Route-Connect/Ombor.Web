import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Callout from "components/shared/Callout/Callout";
import FormDialog from "components/shared/Dialog/Form/FormDialog";
import FormDialogFooter from "components/shared/Dialog/Form/FormDialogFooter";
import FormField from "components/shared/Forms/FormField";
import { recordTile } from "components/shared/IconTile/recordTile";
import { readyOr } from "helpers/Loading";
import { observer } from "mobx-react-lite";
import { Order } from "models/order";
import { Product } from "models/product";
import { useStore } from "stores/StoreContext";
import { designTokens, radius } from "theme";
import { formatOptionalNumber } from "utils/formatEntityId";

import CheckIcon from "@mui/icons-material/Check";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import { Box, MenuItem, Stack, TextField, Typography } from "@mui/material";

import DeliveryStockCheck, { DeliveryLineCheck } from "./DeliveryStockCheck";

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

	const warehouses = readyOr(warehouseStore.allWarehouses, []);
	const productById = useMemo(() => {
		const products = readyOr(productStore.allProducts, []);
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
		productById.get(productId)?.warehouseItems.find((i) => i.warehouseId === warehouseId)
			?.quantity ?? 0;

	const checks: DeliveryLineCheck[] = order.lines.map((l) => {
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
		<FormDialog
			open={isOpen}
			size="md"
			title={t("order.deliver.title")}
			subtitle={t("order.deliver.subtitle", {
				number: formatOptionalNumber(order.orderNumber, t("common.noNumberInline")),
				customer: order.customerName,
			})}
			tile={recordTile("Order")}
			busy={isSaving}
			onClose={handleClose}
			footer={
				<FormDialogFooter
					canSave
					loading={isSaving}
					onCancel={handleClose}
					onSave={handleConfirm}
					submitLabel={t("order.deliver.confirm")}
					submitIcon={<CheckIcon />}
					offlineGate={false}
				/>
			}
		>
			<Stack sx={{ gap: "16px" }}>
				<Typography sx={{ fontSize: 14, color: designTokens.gray700, lineHeight: 1.6 }}>
					{t("order.deliver.lead")}
				</Typography>

				<FormField label={t("order.deliver.warehouse")}>
					<TextField
						select
						size="small"
						fullWidth
						value={warehouseId ? String(warehouseId) : ""}
						onChange={(e) => setWarehouseId(Number(e.target.value))}
						disabled={isSaving}
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
				</FormField>

				<DeliveryStockCheck checks={checks} shortCount={shortCount} />

				{tried && !allOk && (
					<Callout tone="danger" role="alert">
						{t("order.deliver.blocked", {
							count: shortCount,
							warehouse: warehouses.find((w) => w.id === warehouseId)?.name ?? "",
						})}
					</Callout>
				)}

				{allOk && (
					<Box
						sx={{
							display: "flex",
							alignItems: "flex-start",
							gap: "8px",
							p: "9px 12px",
							bgcolor: designTokens.bgSubtle,
							borderRadius: `${radius.md}px`,
							fontSize: 13,
							color: "text.secondary",
							lineHeight: 1.45,
						}}
					>
						<InfoOutlinedIcon sx={{ fontSize: 16, color: "text.disabled", mt: "1px" }} />
						{t("order.deliver.hint")}
					</Box>
				)}
			</Stack>
		</FormDialog>
	);
};

export default observer(DeliveryConfirmModal);
