import React, { useEffect, useMemo } from "react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import FormDialog from "components/shared/Dialog/Form/FormDialog";
import FormDialogFooter from "components/shared/Dialog/Form/FormDialogFooter";
import FormField from "components/shared/Forms/FormField";
import { recordTile } from "components/shared/IconTile/recordTile";
import { isReady } from "helpers/Loading";
import { useDirtyClose } from "hooks/shared/useDirtyClose";
import { useFormKeyboardSubmit } from "hooks/shared/useFormKeyboardSubmit";
import { emptyLine, useTransferForm } from "hooks/transfer/useTransferForm";
import { observer } from "mobx-react-lite";
import { Product } from "models/product";
import { Warehouse } from "models/warehouse";
import { TransferFormValues } from "schemas/TransferSchema";
import { useStore } from "stores/StoreContext";
import { numericSx } from "theme";
import { measurementShort } from "utils/productUtils";

import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Box, Button, MenuItem, Stack, TextField, Typography } from "@mui/material";

import TransferLineRow from "./TransferLineRow";

export interface TransferFormModalProps {
	isOpen: boolean;
	isSaving: boolean;
	warehouses: Warehouse[];
	onSave: (payload: TransferFormValues) => void;
	onClose: () => void;
}

const WarehouseSelect: React.FC<{
	value: number;
	warehouses: Warehouse[];
	disabled: boolean;
	error?: boolean;
	onChange: (id: number) => void;
}> = ({ value, warehouses, disabled, error, onChange }) => (
	<TextField
		select
		size="small"
		fullWidth
		value={value ? String(value) : ""}
		onChange={(e) => onChange(Number(e.target.value))}
		disabled={disabled}
		error={error}
	>
		{warehouses.map((warehouse) => (
			<MenuItem key={warehouse.id} value={String(warehouse.id)}>
				{warehouse.name}
			</MenuItem>
		))}
	</TextField>
);

const TransferFormModal: React.FC<TransferFormModalProps> = ({
	isOpen,
	isSaving,
	warehouses,
	onSave,
	onClose,
}) => {
	const { t } = useTranslation();
	const { productStore } = useStore();

	const { form, lines, canSave, submit } = useTransferForm({
		isOpen,
		isSaving,
		onSave: guardedSave,
	});
	const { control, setValue, formState, watch } = form;
	const onKeyDown = useFormKeyboardSubmit(submit, isSaving, { requireModifier: true });

	const fromWarehouseId = watch("fromWarehouseId");
	const toWarehouseId = watch("toWarehouseId");
	const watchedLines = watch("lines");

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

	const availFor = (productId: number): number =>
		productById.get(productId)?.warehouseItems.find((i) => i.warehouseId === fromWarehouseId)
			?.quantity ?? 0;

	const lineIsOver = (productId: number, quantity: number): boolean =>
		productId > 0 && quantity > availFor(productId);

	const anyOver = (watchedLines ?? []).some((l) => lineIsOver(l.productId, l.quantity));
	const fromName = warehouses.find((w) => w.id === fromWarehouseId)?.name ?? "";

	// Over-stock is contextual (rule 20) — block here, then defer to the page.
	function guardedSave(values: TransferFormValues) {
		const over = values.lines.some(
			(l) =>
				l.quantity >
				(productById
					.get(l.productId)
					?.warehouseItems.find((i) => i.warehouseId === values.fromWarehouseId)?.quantity ?? 0),
		);
		if (over) {
			return;
		}
		onSave(values);
	}

	const { discardOpen, requestClose, cancelDiscard, confirmDiscard } = useDirtyClose(
		formState.isDirty,
		isSaving,
		onClose,
	);

	// Default the route to the first two active warehouses on open.
	useEffect(() => {
		if (isOpen && warehouses.length > 0) {
			productStore.getAll();
			setValue("fromWarehouseId", warehouses[0].id, { shouldDirty: false });
			setValue("toWarehouseId", warehouses[1]?.id ?? 0, { shouldDirty: false });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen]);

	const sameWarehouse = fromWarehouseId > 0 && fromWarehouseId === toWarehouseId;
	const completeLines = (watchedLines ?? []).filter(
		(l) => l.productId > 0 && l.quantity > 0,
	).length;
	const noCompleteLines = completeLines === 0;

	return (
		<FormDialog
			open={isOpen}
			size="md"
			title={t("transfer.title.create")}
			subtitle={t("transfer.form.subtitle")}
			tile={recordTile("Transfer")}
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
					submitLabel={t("transfer.form.submit")}
					submitIcon={<CheckIcon />}
					commitNote={t("transfer.form.commitNote")}
					summary={
						<Typography sx={{ fontSize: 13, color: "text.secondary" }}>
							{t("transfer.form.positionsCount")}{" "}
							<Box component="b" sx={numericSx}>
								{completeLines}
							</Box>
						</Typography>
					}
				/>
			}
		>
			{/* route: from → to */}
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: "1fr 36px 1fr",
					gap: "10px",
					alignItems: "end",
					mb: sameWarehouse ? "6px" : "20px",
				}}
			>
				<FormField label={t("transfer.field.from")} required>
					<Controller
						name="fromWarehouseId"
						control={control}
						render={({ field }) => (
							<WarehouseSelect
								value={field.value}
								warehouses={warehouses}
								disabled={isSaving}
								onChange={field.onChange}
							/>
						)}
					/>
				</FormField>
				<Box sx={{ height: 38, display: "grid", placeItems: "center", color: "primary.main" }}>
					<ChevronRightIcon sx={{ fontSize: 20 }} />
				</Box>
				<FormField label={t("transfer.field.to")} required>
					<Controller
						name="toWarehouseId"
						control={control}
						render={({ field }) => (
							<WarehouseSelect
								value={field.value}
								warehouses={warehouses}
								disabled={isSaving}
								error={sameWarehouse}
								onChange={field.onChange}
							/>
						)}
					/>
				</FormField>
			</Box>
			{sameWarehouse && (
				<Typography sx={{ fontSize: 12, color: "error.main", mb: "16px" }}>
					{t("transfer.form.sameWarehouseField")}
				</Typography>
			)}

			<FormField label={t("transfer.field.lines")} required>
				<Stack sx={{ gap: "10px", mt: "4px" }}>
					{lines.fields.map((fieldRow, index) => {
						const line = watchedLines?.[index];
						const productId = line?.productId ?? 0;
						const quantity = line?.quantity ?? 0;
						const product = productById.get(productId) ?? null;
						const pickedElsewhere = (watchedLines ?? [])
							.filter((_, i) => i !== index)
							.map((l) => l.productId);
						return (
							<TransferLineRow
								key={fieldRow.key}
								index={index}
								control={control}
								product={product}
								picked={productId > 0}
								options={activeProducts.filter(
									(p) => p.id === productId || !pickedElsewhere.includes(p.id),
								)}
								quantity={quantity}
								unit={
									product ? measurementShort(t, product.measurement) : t("transfer.unitFallback")
								}
								avail={availFor(productId)}
								over={lineIsOver(productId, quantity)}
								fromName={fromName}
								onlyLine={lines.fields.length === 1}
								disabled={isSaving}
								availFor={availFor}
								onRemove={() => lines.remove(index)}
							/>
						);
					})}
				</Stack>
			</FormField>

			{anyOver && (
				<Typography sx={{ color: "error.main", fontSize: 12, mt: "8px" }}>
					{t("transfer.form.overStockBanner")}
				</Typography>
			)}
			{formState.isSubmitted && noCompleteLines && (
				<Typography sx={{ color: "error.main", fontSize: 12, mt: "8px" }}>
					{t("transfer.form.noLinesBanner")}
				</Typography>
			)}

			<Button
				onClick={() => lines.append(emptyLine())}
				startIcon={<AddIcon sx={{ fontSize: "18px !important" }} />}
				sx={{ mt: "8px", color: "primary.main", fontWeight: 600, px: 1 }}
			>
				{t("transfer.form.addLine")}
			</Button>

			<FormField label={t("transfer.field.note")} sx={{ mt: "20px" }}>
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
							placeholder={t("transfer.form.notePlaceholder")}
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

export default observer(TransferFormModal);
