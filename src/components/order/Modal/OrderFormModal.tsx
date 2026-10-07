import React from "react";
import { useTranslation } from "react-i18next";
import PartnerAutocomplete from "components/partner/Autocomplete/PartnerAutocomplete";
import EntityAutocomplete from "components/shared/Autocomplete/Autocomplete";
import DateField from "components/shared/Date/DateField";
import TimeField from "components/shared/Date/TimeField";
import FormDialog from "components/shared/Dialog/Form/FormDialog";
import FormDialogFooter from "components/shared/Dialog/Form/FormDialogFooter";
import FormField from "components/shared/Forms/FormField";
import { recordTile } from "components/shared/IconTile/recordTile";
import { useDirtyClose } from "hooks/shared/useDirtyClose";
import { observer } from "mobx-react-lite";
import { Order, OrderSource, UpdateOrderRequest } from "models/order";
import { Product } from "models/product";
import { formatOptionalNumber } from "utils/formatEntityId";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Box, MenuItem, Stack, TextField } from "@mui/material";

import OrderEditLineList from "./OrderEditLineList";
import { useOrderEditForm } from "./useOrderEditForm";

interface OrderFormModalProps {
	isOpen: boolean;
	isSaving: boolean;
	order: Order | null;
	onClose: () => void;
	onSave: (payload: UpdateOrderRequest) => void;
}

const SOURCE_OPTIONS: OrderSource[] = ["Telegram", "OmborWeb"];

const OrderFormModal: React.FC<OrderFormModalProps> = ({
	isOpen,
	isSaving,
	order,
	onClose,
	onSave,
}) => {
	const { t } = useTranslation();

	const form = useOrderEditForm({ isOpen, order, onSave });
	const { lines, clientErr, deliverErr, linesErr } = form;

	const { discardOpen, requestClose, cancelDiscard, confirmDiscard } = useDirtyClose(
		form.dirty,
		isSaving,
		onClose,
	);

	const twoCols = {
		display: "grid",
		gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
		gap: "16px",
	};

	return (
		<FormDialog
			open={isOpen}
			size="lg"
			title={
				order
					? t("order.edit.title", {
							number: formatOptionalNumber(order.orderNumber, t("common.noNumberInline")),
						})
					: ""
			}
			subtitle={t("order.edit.subtitle")}
			tile={recordTile("Order")}
			busy={isSaving}
			onClose={requestClose}
			discard={{ open: discardOpen, onConfirm: confirmDiscard, onCancel: cancelDiscard }}
			footer={
				<FormDialogFooter
					canSave
					loading={isSaving}
					onCancel={requestClose}
					onSave={form.submit}
					offlineGate={false}
				/>
			}
		>
			<Stack sx={{ gap: "16px" }}>
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: { xs: "1fr", sm: "1.3fr 1fr 1fr" },
						gap: "16px",
					}}
				>
					<FormField label={t("order.field.client")} required>
						<PartnerAutocomplete
							type="Customer"
							size="small"
							value={form.client}
							error={clientErr}
							helperText={clientErr ? t("order.new.err.client") : undefined}
							onChange={form.setClient}
						/>
					</FormField>
					<FormField label={t("order.field.warehouse")}>
						<TextField
							select
							size="small"
							fullWidth
							value={form.warehouseId === "" ? "" : String(form.warehouseId)}
							disabled={isSaving}
							slotProps={{ select: { displayEmpty: true } }}
							onChange={(e) =>
								form.setWarehouseId(e.target.value === "" ? "" : Number(e.target.value))
							}
						>
							<MenuItem value="">
								<Box component="span" sx={{ color: "text.disabled" }}>
									{t("order.edit.warehouseNone")}
								</Box>
							</MenuItem>
							{form.warehouses.map((w) => (
								<MenuItem key={w.id} value={String(w.id)}>
									{w.name}
								</MenuItem>
							))}
						</TextField>
					</FormField>
					<FormField label={t("order.field.source")}>
						<TextField
							select
							size="small"
							fullWidth
							value={form.source}
							onChange={(e) => form.setSource(e.target.value as OrderSource)}
						>
							{SOURCE_OPTIONS.map((s) => (
								<MenuItem key={s} value={s}>
									{t(`order.source.${s}`)}
								</MenuItem>
							))}
						</TextField>
					</FormField>
				</Box>

				<Box sx={twoCols}>
					<FormField label={t("order.field.deliveryDate")} required>
						<DateField
							value={form.deliveryDate}
							disabled={isSaving}
							error={deliverErr}
							helperText={deliverErr ? t("order.edit.deliveryDateRequired") : undefined}
							onChange={form.setDeliveryDate}
						/>
					</FormField>
					<FormField label={t("order.field.deliveryTime")}>
						<TimeField
							value={form.deliveryTime}
							disabled={isSaving}
							clearable
							onChange={form.setDeliveryTime}
						/>
					</FormField>
				</Box>

				<FormField label={t("order.field.lines")} required>
					<EntityAutocomplete<Product>
						placeholder={t("order.edit.productPlaceholder")}
						size="small"
						options={form.activeProducts.filter((p) => !form.pickedIds.includes(p.id))}
						value={null}
						disabled={isSaving}
						additionalFilter={(p, text) => p.sku.toLowerCase().includes(text)}
						onChange={(p) => p && form.addProduct(p)}
					/>
				</FormField>

				<OrderEditLineList
					lines={lines}
					error={linesErr}
					disabled={isSaving}
					onUpdate={form.updateLine}
					onRemove={form.removeLine}
				/>

				<Box sx={twoCols}>
					<FormField label={t("order.field.address")}>
						<TextField
							size="small"
							fullWidth
							value={form.address}
							placeholder={t("order.edit.addressPlaceholder")}
							disabled={isSaving}
							onChange={(e) => form.setAddress(e.target.value)}
						/>
					</FormField>
					<FormField label={t("order.field.note")}>
						<TextField
							size="small"
							fullWidth
							value={form.note}
							placeholder={t("order.edit.notePlaceholder")}
							disabled={isSaving}
							onChange={(e) => form.setNote(e.target.value)}
						/>
					</FormField>
				</Box>

				<Box
					sx={{
						display: "flex",
						alignItems: "flex-start",
						gap: "8px",
						fontSize: 13,
						lineHeight: 1.5,
						color: "text.secondary",
					}}
				>
					<InfoOutlinedIcon sx={{ fontSize: 16, color: "text.disabled", mt: "1px" }} />
					{t("order.edit.warehouseHint")}
				</Box>
			</Stack>
		</FormDialog>
	);
};

export default observer(OrderFormModal);
