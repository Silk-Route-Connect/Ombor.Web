import React, { useEffect, useMemo } from "react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import EntityAutocomplete from "components/shared/Autocomplete/Autocomplete";
import GhostButton from "components/shared/Buttons/GhostButton";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import FormDialogHeader from "components/shared/Dialog/Form/FormDialogHeader";
import FormFieldLabel from "components/shared/Forms/FormFieldLabel";
import NumericField from "components/shared/Inputs/NumericField";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { useDirtyClose } from "hooks/shared/useDirtyClose";
import { emptyLine, useTransferForm } from "hooks/transfer/useTransferForm";
import { observer } from "mobx-react-lite";
import { Product } from "models/product";
import { Warehouse } from "models/warehouse";
import { TransferFormValues } from "schemas/TransferSchema";
import { useStore } from "stores/StoreContext";
import { designTokens, numericSx } from "theme";
import { formatQuantity } from "utils/formatCurrency";
import { MEASUREMENT_SHORT } from "utils/productUtils";

import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	InputAdornment,
	LinearProgress,
	MenuItem,
	Stack,
	TextField,
	Typography,
} from "@mui/material";

export interface TransferFormModalProps {
	isOpen: boolean;
	isSaving: boolean;
	warehouses: Warehouse[];
	onSave: (payload: TransferFormValues) => void;
	onClose: () => void;
}

const toNumberOrZero = (raw: string): number => {
	const value = raw.trim();
	return value === "" ? 0 : Number(value);
};

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

	const fromWarehouseId = watch("fromWarehouseId");
	const toWarehouseId = watch("toWarehouseId");
	const watchedLines = watch("lines");

	const activeProducts: Product[] = useMemo(
		() =>
			productStore.allProducts === "loading"
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
		<>
			<Dialog
				open={isOpen}
				onClose={requestClose}
				disableEscapeKeyDown={isSaving}
				disableRestoreFocus
				slotProps={{ paper: { sx: { width: 680, maxWidth: "94%", borderRadius: "12px" } } }}
			>
				<FormDialogHeader
					title={t("transfer.title.create")}
					subtitle={t("transfer.form.subtitle")}
					disabled={isSaving}
					onClose={requestClose}
				/>

				{isSaving && <LinearProgress />}

				<DialogContent dividers sx={{ pt: 2 }}>
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
						<Stack sx={{ gap: "7px" }}>
							<FormFieldLabel label={t("transfer.field.from")} required />
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
						</Stack>
						<Box sx={{ height: 40, display: "grid", placeItems: "center", color: "primary.main" }}>
							<ChevronRightIcon sx={{ fontSize: 20 }} />
						</Box>
						<Stack sx={{ gap: "7px" }}>
							<FormFieldLabel label={t("transfer.field.to")} required />
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
						</Stack>
					</Box>
					{sameWarehouse && (
						<Typography sx={{ fontSize: 12, color: "error.main", mb: "16px" }}>
							{t("transfer.form.sameWarehouseField")}
						</Typography>
					)}

					{/* lines */}
					<FormFieldLabel label={t("transfer.field.lines")} required />
					<Stack sx={{ gap: "10px", mt: "10px" }}>
						{lines.fields.map((fieldRow, index) => {
							const line = watchedLines?.[index];
							const productId = line?.productId ?? 0;
							const quantity = line?.quantity ?? 0;
							const product = productById.get(productId) ?? null;
							const unit = product
								? MEASUREMENT_SHORT[product.measurement]
								: t("transfer.unitFallback");
							const avail = availFor(productId);
							const over = lineIsOver(productId, quantity);
							const pickedElsewhere = (watchedLines ?? [])
								.filter((_, i) => i !== index)
								.map((l) => l.productId);
							const options = activeProducts.filter(
								(p) => p.id === productId || !pickedElsewhere.includes(p.id),
							);
							const onlyLine = lines.fields.length === 1;

							return (
								<Box key={fieldRow.key}>
									<Box
										sx={{
											display: "grid",
											gridTemplateColumns: "1fr 150px 38px",
											gap: "10px",
											alignItems: "start",
										}}
									>
										<Controller
											name={`lines.${index}.productId` as const}
											control={control}
											render={({ field, fieldState }) => (
												<EntityAutocomplete<Product>
													label=""
													placeholder={t("transfer.form.productPlaceholder")}
													size="small"
													options={options}
													value={product}
													error={!!fieldState.error}
													additionalFilter={(p, text) => p.sku.toLowerCase().includes(text)}
													onChange={(p) => field.onChange(p?.id ?? 0)}
												/>
											)}
										/>
										<Controller
											name={`lines.${index}.quantity` as const}
											control={control}
											render={({ field, fieldState }) => (
												<NumericField
													{...field}
													value={field.value || ""}
													size="small"
													min={0}
													disabled={isSaving}
													error={!!fieldState.error || over}
													onChange={(e) => field.onChange(toNumberOrZero(e.target.value))}
													slotProps={{
														input: {
															endAdornment: <InputAdornment position="end">{unit}</InputAdornment>,
														},
													}}
												/>
											)}
										/>
										<Button
											onClick={() => !onlyLine && lines.remove(index)}
											disabled={onlyLine}
											aria-label={t("common.delete")}
											sx={{
												minWidth: 0,
												width: 38,
												height: 40,
												p: 0,
												border: "1px solid",
												borderColor: designTokens.gray300,
												color: "text.disabled",
												"&:hover": {
													color: "error.main",
													borderColor: designTokens.errorBorder,
													bgcolor: designTokens.errorBg,
												},
											}}
										>
											<DeleteOutlineIcon sx={{ fontSize: 18 }} />
										</Button>
									</Box>
									{productId > 0 && (
										<Typography
											sx={{
												fontSize: 12,
												mt: "6px",
												color: over ? "error.main" : "text.secondary",
											}}
										>
											{t("transfer.form.available", { warehouse: fromName })}{" "}
											<Box
												component="span"
												sx={{
													...numericSx,
													fontWeight: 700,
													color: over ? "error.main" : designTokens.gray700,
												}}
											>
												{formatQuantity(avail)} {unit}
											</Box>
											{over &&
												` ${t("transfer.form.overStockSuffix", { requested: formatQuantity(quantity), unit })}`}
										</Typography>
									)}
								</Box>
							);
						})}
					</Stack>

					{anyOver && (
						<Typography sx={{ color: "error.main", fontSize: 12.5, mt: "8px" }}>
							{t("transfer.form.overStockBanner")}
						</Typography>
					)}
					{formState.isSubmitted && noCompleteLines && (
						<Typography sx={{ color: "error.main", fontSize: 12.5, mt: "8px" }}>
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

					<Stack sx={{ gap: "7px", mt: "20px" }}>
						<FormFieldLabel label={t("transfer.field.note")} />
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
					</Stack>

					<Box
						sx={{
							display: "flex",
							gap: "10px",
							alignItems: "flex-start",
							mt: "16px",
							p: "11px 13px",
							bgcolor: designTokens.warningBg,
							border: "1px solid",
							borderColor: designTokens.accentSoft,
							borderRadius: "8px",
						}}
					>
						<InfoOutlinedIcon
							sx={{ fontSize: 16, color: "warning.main", mt: "1px", flex: "0 0 auto" }}
						/>
						<Typography sx={{ fontSize: 12.5, color: designTokens.saffron700, lineHeight: 1.55 }}>
							{t("transfer.form.immutableHintBefore")}{" "}
							<Box component="b">{t("transfer.form.immutableHintBold")}</Box>{" "}
							{t("transfer.form.immutableHintAfter")}
						</Typography>
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
					<Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
						{t("transfer.form.positionsCount")}{" "}
						<Box component="b" sx={numericSx}>
							{completeLines}
						</Box>
					</Typography>
					<Box sx={{ flexGrow: 1 }} />
					<GhostButton onClick={requestClose} disabled={isSaving}>
						{t("common.cancel")}
					</GhostButton>
					<PrimaryButton icon={<CheckIcon />} onClick={submit} disabled={!canSave}>
						{t("transfer.form.submit")}
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

export default observer(TransferFormModal);
