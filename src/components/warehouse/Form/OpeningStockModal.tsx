import React, { useEffect, useMemo, useState } from "react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import FormDialog from "components/shared/Dialog/Form/FormDialog";
import FormDialogFooter from "components/shared/Dialog/Form/FormDialogFooter";
import FormField from "components/shared/Forms/FormField";
import FormFieldLabel from "components/shared/Forms/FormFieldLabel";
import { recordTile } from "components/shared/IconTile/recordTile";
import InfoHint from "components/shared/InfoHint/InfoHint";
import { isReady } from "helpers/Loading";
import { useDirtyClose } from "hooks/shared/useDirtyClose";
import { useFormKeyboardSubmit } from "hooks/shared/useFormKeyboardSubmit";
import { emptyLine, useOpeningStockForm } from "hooks/warehouse/useOpeningStockForm";
import { observer } from "mobx-react-lite";
import { Product } from "models/product";
import { Warehouse, WarehouseStockItem } from "models/warehouse";
import { OpeningStockFormValues } from "schemas/WarehouseSchema";
import { useStore } from "stores/StoreContext";
import { measurementShort } from "utils/productUtils";

import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";

import OpeningStockLineRow, { OPENING_LINE_GRID } from "./OpeningStockLineRow";
import OpeningStockSummary from "./OpeningStockSummary";

export interface OpeningStockModalProps {
	isOpen: boolean;
	isSaving: boolean;
	warehouse: Warehouse;
	/** Current stock in this warehouse — already-held products are excluded from the picker. */
	stock: WarehouseStockItem[];
	onSave: (payload: OpeningStockFormValues) => void;
	onClose: () => void;
}

const OpeningStockModal: React.FC<OpeningStockModalProps> = ({
	isOpen,
	isSaving,
	warehouse,
	stock,
	onSave,
	onClose,
}) => {
	const { t } = useTranslation();
	const { productStore } = useStore();

	// At least one complete line (product + quantity > 0) is required — checked
	// here rather than in the schema so an in-progress row isn't flagged early.
	function guardedSave(values: OpeningStockFormValues) {
		const complete = values.items.filter((l) => l.productId > 0 && l.quantity > 0);
		if (complete.length === 0) {
			return;
		}
		onSave({ items: complete, note: values.note });
	}

	const { form, lines, canSave, submit } = useOpeningStockForm({
		isOpen,
		isSaving,
		onSave: guardedSave,
	});
	const { control, formState, watch, setValue } = form;
	const onKeyDown = useFormKeyboardSubmit(submit, isSaving, { requireModifier: true });
	const watchedItems = watch("items");

	const { discardOpen, requestClose, cancelDiscard, confirmDiscard } = useDirtyClose(
		formState.isDirty,
		isSaving,
		onClose,
	);

	useEffect(() => {
		if (isOpen) {
			productStore.getAll();
		}
	}, [isOpen, productStore]);

	const activeProducts: Product[] = useMemo(
		() =>
			!isReady(productStore.allProducts)
				? []
				: productStore.allProducts.filter((p) => !p.isArchived),
		[productStore.allProducts],
	);
	const productById = useMemo(
		() => new Map(activeProducts.map((p) => [p.id, p])),
		[activeProducts],
	);

	// Products already held in this warehouse route to Adjustments, not opening
	// stock (D7), so they're excluded from the picker.
	const stockedIds = useMemo(() => new Set(stock.map((s) => s.productId)), [stock]);

	const completeLines = (watchedItems ?? []).filter((l) => l.productId > 0 && l.quantity > 0);
	const batchValue = completeLines.reduce((sum, l) => sum + l.quantity * l.unitCost, 0);

	// Semantic "add at least one line" message shown inline near the table after a
	// submit attempt; field-level errors surface per-row (no top-of-form banner).
	const noCompleteLines = completeLines.length === 0;
	const showNoLinesError = formState.isSubmitted && noCompleteLines;

	// A new row is only useful while un-stocked, un-picked products remain.
	const pickedIds = new Set((watchedItems ?? []).map((l) => l.productId).filter(Boolean));
	const canAddRow = activeProducts.some((p) => !stockedIds.has(p.id) && !pickedIds.has(p.id));
	// The add button stays enabled (hard rule 5); a click with nothing left explains why.
	const [noMoreProducts, setNoMoreProducts] = useState(false);
	const addRow = () => {
		if (!canAddRow) {
			setNoMoreProducts(true);
			return;
		}
		setNoMoreProducts(false);
		lines.append(emptyLine());
	};

	return (
		<FormDialog
			open={isOpen}
			size="lg"
			title={t("warehouse.opening.title")}
			subtitle={t("warehouse.opening.subtitle")}
			tile={recordTile("OpeningStock")}
			busy={isSaving}
			onClose={requestClose}
			onKeyDown={onKeyDown}
			discard={{ open: discardOpen, onConfirm: confirmDiscard, onCancel: cancelDiscard }}
			footer={
				<FormDialogFooter
					canSave={canSave}
					loading={isSaving}
					onCancel={requestClose}
					onSave={submit}
					submitLabel={t("warehouse.opening.submit")}
					submitIcon={<CheckIcon />}
					commitNote={t("warehouse.opening.commitNote")}
				/>
			}
		>
			{/* column labels */}
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: OPENING_LINE_GRID,
					gap: "10px",
					px: "2px",
					mb: "8px",
				}}
			>
				<FormFieldLabel variant="caption" label={t("warehouse.opening.product")} required />
				<FormFieldLabel variant="caption" label={t("warehouse.opening.quantity")} required />
				<Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
					<FormFieldLabel variant="caption" label={t("warehouse.opening.threshold")} />
					<InfoHint text={t("warehouse.opening.thresholdHint")} />
				</Box>
				<FormFieldLabel variant="caption" label={t("warehouse.opening.unitCost")} />
				<FormFieldLabel variant="caption" label={t("warehouse.opening.colValue")} />
				<Box />
			</Box>

			<Stack sx={{ gap: "10px" }}>
				{lines.fields.map((fieldRow, index) => {
					const line = watchedItems?.[index];
					const productId = line?.productId ?? 0;
					const quantity = line?.quantity ?? 0;
					const unitCost = line?.unitCost ?? 0;
					const product = productById.get(productId) ?? null;
					const unit = product
						? measurementShort(t, product.measurement)
						: t("warehouse.opening.unitFallback");

					const pickedElsewhere = (watchedItems ?? [])
						.filter((_, i) => i !== index)
						.map((l) => l.productId);
					const options = activeProducts.filter(
						(p) => p.id === productId || (!stockedIds.has(p.id) && !pickedElsewhere.includes(p.id)),
					);

					const rowError = formState.errors.items?.[index];
					// The row line is this field's only message (inlineHint off), so a typed
					// «3,5» says why at once, ahead of the row's submit errors.
					const rowErrorMsg = Number.isNaN(quantity)
						? t("common.quantity.wholeOnly")
						: Number.isNaN(line?.lowStockThreshold)
							? t("warehouse.threshold.wholeOnly")
							: (rowError?.productId?.message ??
								rowError?.quantity?.message ??
								rowError?.lowStockThreshold?.message ??
								rowError?.unitCost?.message);
					const lineValue = productId > 0 && quantity > 0 ? quantity * unitCost : 0;
					const onlyLine = lines.fields.length === 1;

					return (
						<OpeningStockLineRow
							key={fieldRow.key}
							index={index}
							control={control}
							setValue={setValue}
							product={product}
							options={options}
							unit={unit}
							measurement={product?.measurement ?? "None"}
							unitCost={unitCost}
							lineValue={lineValue}
							errorMessage={rowErrorMsg}
							onlyLine={onlyLine}
							disabled={isSaving}
							onRemove={() => lines.remove(index)}
						/>
					);
				})}
			</Stack>

			{showNoLinesError && (
				<Typography sx={{ mt: "8px", color: "error.main", fontSize: 12 }}>
					{t("warehouse.opening.noLinesBanner")}
				</Typography>
			)}

			<Button
				onClick={addRow}
				disabled={isSaving}
				startIcon={<AddIcon />}
				sx={{ mt: "8px", color: "primary.main", fontWeight: 600, px: 1 }}
			>
				{t("warehouse.opening.addLine")}
			</Button>
			{noMoreProducts && !canAddRow && (
				<Typography
					component="output"
					sx={{ display: "block", fontSize: 12, color: "text.secondary", ml: 1 }}
				>
					{t("warehouse.opening.noMoreProducts")}
				</Typography>
			)}

			<OpeningStockSummary positions={completeLines.length} batchValue={batchValue} />

			<FormField label={t("warehouse.opening.note")} sx={{ mt: "20px" }}>
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
							placeholder={t("warehouse.opening.notePlaceholder")}
							disabled={isSaving}
							error={!!fieldState.error}
							helperText={fieldState.error?.message}
						/>
					)}
				/>
			</FormField>
		</FormDialog>
	);
};

export default observer(OpeningStockModal);
