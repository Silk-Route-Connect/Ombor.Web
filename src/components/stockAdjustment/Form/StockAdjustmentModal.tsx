import React, { useEffect, useMemo, useState } from "react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import EntityAutocomplete from "components/shared/Autocomplete/Autocomplete";
import FormDialog from "components/shared/Dialog/Form/FormDialog";
import FormDialogFooter from "components/shared/Dialog/Form/FormDialogFooter";
import FormField from "components/shared/Forms/FormField";
import { recordTile } from "components/shared/IconTile/recordTile";
import NumericField from "components/shared/Inputs/NumericField";
import { isReady } from "helpers/Loading";
import { useDirtyClose } from "hooks/shared/useDirtyClose";
import { useFormKeyboardSubmit } from "hooks/shared/useFormKeyboardSubmit";
import { useStockAdjustmentForm } from "hooks/stockAdjustment/useStockAdjustmentForm";
import { observer } from "mobx-react-lite";
import { Product } from "models/product";
import { AdjustmentDirection, reasonsFor } from "models/stockAdjustment";
import { Warehouse } from "models/warehouse";
import { StockAdjustmentFormValues } from "schemas/StockAdjustmentSchema";
import { useStore } from "stores/StoreContext";
import { formatQuantity } from "utils/formatCurrency";
import { measurementShort } from "utils/productUtils";

import CheckIcon from "@mui/icons-material/Check";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { Box, InputAdornment, MenuItem, Stack, TextField, Typography } from "@mui/material";

import DirectionCard from "./DirectionCard";
import StockAdjustmentPreview from "./StockAdjustmentPreview";

export interface StockAdjustmentModalProps {
	isOpen: boolean;
	isSaving: boolean;
	warehouses: Warehouse[];
	onSave: (payload: StockAdjustmentFormValues) => void;
	onClose: () => void;
}

const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
	isOpen,
	isSaving,
	warehouses,
	onSave,
	onClose,
}) => {
	const { t } = useTranslation();
	const { productStore } = useStore();

	const [selected, setSelected] = useState<Product | null>(null);

	// Compute over-stock from the submitted values (no stale closure), then defer
	// to the page's onSave. The block is contextual (rule 20) — it needs the live
	// per-warehouse availability, so it lives here rather than in the zod schema.
	const guardedSave = (values: StockAdjustmentFormValues) => {
		const avail =
			selected?.warehouseItems.find((i) => i.warehouseId === values.warehouseId)?.quantity ?? 0;
		if (values.direction === "Decrease" && values.quantity > avail) {
			return;
		}
		onSave(values);
	};

	const { form, canSave, submit } = useStockAdjustmentForm({
		isOpen,
		isSaving,
		onSave: guardedSave,
	});
	const { control, setValue, formState, watch } = form;
	const onKeyDown = useFormKeyboardSubmit(submit, isSaving, { requireModifier: true });

	const warehouseId = watch("warehouseId");
	const direction = watch("direction") as AdjustmentDirection;
	const quantity = watch("quantity");

	const { discardOpen, requestClose, cancelDiscard, confirmDiscard } = useDirtyClose(
		formState.isDirty,
		isSaving,
		onClose,
	);

	// Default to the first active warehouse on open; clear the picked product.
	useEffect(() => {
		if (isOpen) {
			productStore.getAll();
			setSelected(null);
			if (warehouses.length > 0) {
				setValue("warehouseId", warehouses[0].id, { shouldDirty: false });
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen]);

	const activeProducts: Product[] = useMemo(
		() =>
			!isReady(productStore.allProducts)
				? []
				: productStore.allProducts.filter((p) => !p.isArchived),
		[productStore.allProducts],
	);

	const unit = selected ? measurementShort(t, selected.measurement) : t("adjustment.unitFallback");

	const avail = useMemo(
		() => selected?.warehouseItems.find((i) => i.warehouseId === warehouseId)?.quantity ?? 0,
		[selected, warehouseId],
	);

	const overStock = direction === "Decrease" && selected != null && quantity > avail;
	// «Остаток после операции» preview (ADJ-4): signed change + the resulting
	// balance, which a Списание may not take below zero (rule 20).
	const signedDelta = direction === "Decrease" ? -quantity : quantity;
	const afterBalance = avail + signedDelta;

	const reasons = reasonsFor(direction);

	const handleProductChange = (product: Product | null) => {
		setSelected(product);
		setValue("productId", product?.id ?? 0, { shouldDirty: true, shouldValidate: true });
	};

	const handleDirectionChange = (next: AdjustmentDirection) => {
		setValue("direction", next, { shouldDirty: true });
		// Reason sets differ by direction — clear so the user re-picks.
		setValue("reason", "", { shouldDirty: true, shouldValidate: formState.isSubmitted });
	};

	return (
		<FormDialog
			open={isOpen}
			size="md"
			title={t("adjustment.title.create")}
			subtitle={t("adjustment.form.subtitle")}
			tile={recordTile("Adjustment")}
			busy={isSaving}
			onClose={requestClose}
			onKeyDown={onKeyDown}
			discard={{ open: discardOpen, onConfirm: confirmDiscard, onCancel: cancelDiscard }}
			footer={
				<FormDialogFooter
					onCancel={requestClose}
					onSave={submit}
					canSave={canSave}
					loading={isSaving}
					submitLabel={t("adjustment.form.submit")}
					submitIcon={<CheckIcon />}
					commitNote={t("adjustment.form.commitNote")}
				/>
			}
		>
			<Stack sx={{ gap: "16px" }}>
				<FormField label={t("adjustment.field.warehouse")} required>
					<Controller
						name="warehouseId"
						control={control}
						render={({ field, fieldState }) => (
							<TextField
								select
								size="small"
								fullWidth
								value={field.value ? String(field.value) : ""}
								onChange={(e) => field.onChange(Number(e.target.value))}
								disabled={isSaving}
								error={!!fieldState.error}
								helperText={fieldState.error?.message}
							>
								{warehouses.map((warehouse) => (
									<MenuItem key={warehouse.id} value={String(warehouse.id)}>
										{warehouse.name}
									</MenuItem>
								))}
							</TextField>
						)}
					/>
				</FormField>

				<FormField label={t("adjustment.field.direction")}>
					<Box
						role="radiogroup"
						sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}
					>
						<DirectionCard
							direction="Decrease"
							active={direction === "Decrease"}
							title={t("adjustment.direction.Decrease")}
							subtitle={t("adjustment.form.decreaseHint")}
							onSelect={() => handleDirectionChange("Decrease")}
						/>
						<DirectionCard
							direction="Increase"
							active={direction === "Increase"}
							title={t("adjustment.direction.Increase")}
							subtitle={t("adjustment.form.increaseHint")}
							onSelect={() => handleDirectionChange("Increase")}
						/>
					</Box>
				</FormField>

				<FormField label={t("adjustment.field.product")} required>
					<EntityAutocomplete<Product>
						placeholder={t("adjustment.form.productPlaceholder")}
						size="small"
						options={activeProducts}
						value={selected}
						error={!!formState.errors.productId}
						helperText={formState.errors.productId?.message}
						additionalFilter={(p, text) => p.sku.toLowerCase().includes(text)}
						onChange={handleProductChange}
					/>
				</FormField>

				<Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
					<FormField label={t("adjustment.field.quantity")} required>
						<Controller
							name="quantity"
							control={control}
							render={({ field, fieldState }) => (
								<NumericField
									{...field}
									size="small"
									disabled={isSaving}
									error={!!fieldState.error || overStock}
									helperText={fieldState.error?.message}
									slotProps={{
										input: {
											endAdornment: <InputAdornment position="end">{unit}</InputAdornment>,
										},
									}}
								/>
							)}
						/>
					</FormField>

					<FormField label={t("adjustment.field.reason")} required>
						<Controller
							name="reason"
							control={control}
							render={({ field, fieldState }) => (
								<TextField
									select
									size="small"
									fullWidth
									value={field.value ?? ""}
									onChange={(e) => field.onChange(e.target.value)}
									disabled={isSaving}
									error={!!fieldState.error}
									helperText={fieldState.error?.message}
									slotProps={{ select: { displayEmpty: true } }}
								>
									<MenuItem value="" disabled>
										<Box component="span" sx={{ color: "text.disabled" }}>
											{t("adjustment.form.reasonPlaceholder")}
										</Box>
									</MenuItem>
									{reasons.map((reason) => (
										<MenuItem key={reason} value={reason}>
											{t(`adjustment.reason.${reason}`)}
										</MenuItem>
									))}
								</TextField>
							)}
						/>
					</FormField>
				</Box>

				<FormField label={t("adjustment.form.previewTitle")}>
					<StockAdjustmentPreview
						unit={unit}
						avail={avail}
						direction={direction}
						quantity={quantity}
						afterBalance={afterBalance}
						overStock={overStock}
						hasInput={selected != null}
					/>
					{overStock && (
						<Typography
							sx={{
								display: "inline-flex",
								alignItems: "center",
								gap: "6px",
								fontSize: 12,
								color: "error.main",
								mt: "2px",
							}}
						>
							<ErrorOutlineIcon sx={{ fontSize: 14 }} />
							{t("adjustment.form.floorNote", {
								available: formatQuantity(avail),
								requested: formatQuantity(quantity),
								unit,
							})}
						</Typography>
					)}
				</FormField>

				<FormField label={t("adjustment.field.note")}>
					<Controller
						name="note"
						control={control}
						render={({ field, fieldState }) => (
							<TextField
								{...field}
								value={field.value ?? ""}
								size="small"
								fullWidth
								multiline
								minRows={2}
								placeholder={t("adjustment.form.notePlaceholder")}
								disabled={isSaving}
								error={!!fieldState.error}
								helperText={fieldState.error?.message}
							/>
						)}
					/>
				</FormField>
			</Stack>
		</FormDialog>
	);
};

export default observer(StockAdjustmentModal);
