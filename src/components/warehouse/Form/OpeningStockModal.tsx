import React, { useEffect, useMemo } from "react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import EntityAutocomplete from "components/shared/Autocomplete/Autocomplete";
import GhostButton from "components/shared/Buttons/GhostButton";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import FormDialogHeader from "components/shared/Dialog/Form/FormDialogHeader";
import FormFieldLabel from "components/shared/Forms/FormFieldLabel";
import MoneyField from "components/shared/Inputs/MoneyField";
import NumericField from "components/shared/Inputs/NumericField";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { useDirtyClose } from "hooks/shared/useDirtyClose";
import { useFormKeyboardSubmit } from "hooks/shared/useFormKeyboardSubmit";
import { emptyLine, useOpeningStockForm } from "hooks/warehouse/useOpeningStockForm";
import { observer } from "mobx-react-lite";
import { Product } from "models/product";
import { Warehouse, WarehouseStockItem } from "models/warehouse";
import { OpeningStockFormValues } from "schemas/WarehouseSchema";
import { useStore } from "stores/StoreContext";
import { designTokens, numericSx } from "theme";
import { formatCurrency, formatQuantity } from "utils/formatCurrency";
import { MEASUREMENT_SHORT } from "utils/productUtils";

import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
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
	Stack,
	TextField,
	Typography,
} from "@mui/material";

export interface OpeningStockModalProps {
	isOpen: boolean;
	isSaving: boolean;
	warehouse: Warehouse;
	/** Current stock in this warehouse — already-held products are excluded from the picker. */
	stock: WarehouseStockItem[];
	onSave: (payload: OpeningStockFormValues) => void;
	onClose: () => void;
}

const toNumberOrZero = (raw: string): number => {
	const value = raw.trim();
	return value === "" ? 0 : Number(value);
};

const LINE_GRID = "1fr 108px 150px 132px 38px";

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
	const onKeyDown = useFormKeyboardSubmit(submit, isSaving);
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
			productStore.allProducts === "loading"
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
	const totalUnits = completeLines.reduce((sum, l) => sum + l.quantity, 0);
	const batchValue = completeLines.reduce((sum, l) => sum + l.quantity * l.unitCost, 0);

	// Semantic "add at least one line" message shown inline near the table after a
	// submit attempt; field-level errors surface per-row (no top-of-form banner).
	const noCompleteLines = completeLines.length === 0;
	const showNoLinesError = formState.isSubmitted && noCompleteLines;

	// A new row is only useful while un-stocked, un-picked products remain.
	const pickedIds = new Set((watchedItems ?? []).map((l) => l.productId).filter(Boolean));
	const canAddRow = activeProducts.some((p) => !stockedIds.has(p.id) && !pickedIds.has(p.id));

	return (
		<>
			<Dialog
				open={isOpen}
				onClose={requestClose}
				disableEscapeKeyDown={isSaving}
				disableRestoreFocus
				onKeyDown={onKeyDown}
				slotProps={{ paper: { sx: { width: 760, maxWidth: "96%", borderRadius: "12px" } } }}
			>
				<FormDialogHeader
					title={t("warehouse.opening.title")}
					subtitle={t("warehouse.opening.subtitle")}
					disabled={isSaving}
					onClose={requestClose}
				/>

				{isSaving && <LinearProgress />}

				<DialogContent dividers sx={{ pt: 2 }}>
					{/* column labels */}
					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: LINE_GRID,
							gap: "10px",
							px: "2px",
							mb: "8px",
						}}
					>
						<FormFieldLabel label={t("warehouse.opening.product")} required />
						<FormFieldLabel label={t("warehouse.opening.quantity")} required />
						<FormFieldLabel label={t("warehouse.opening.unitCost")} />
						<FormFieldLabel label={t("warehouse.opening.colValue")} />
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
								? MEASUREMENT_SHORT[product.measurement]
								: t("warehouse.opening.unitFallback");

							const pickedElsewhere = (watchedItems ?? [])
								.filter((_, i) => i !== index)
								.map((l) => l.productId);
							const options = activeProducts.filter(
								(p) =>
									p.id === productId || (!stockedIds.has(p.id) && !pickedElsewhere.includes(p.id)),
							);

							const rowError = formState.errors.items?.[index];
							const rowErrorMsg =
								rowError?.productId?.message ??
								rowError?.quantity?.message ??
								rowError?.unitCost?.message;
							const lineValue = productId > 0 && quantity > 0 ? quantity * unitCost : 0;
							const onlyLine = lines.fields.length === 1;

							return (
								<Box key={fieldRow.key}>
									<Box
										sx={{
											display: "grid",
											gridTemplateColumns: LINE_GRID,
											gap: "10px",
											alignItems: "center",
										}}
									>
										<Controller
											name={`items.${index}.productId` as const}
											control={control}
											render={({ field, fieldState }) => (
												<EntityAutocomplete<Product>
													label=""
													placeholder={t("warehouse.opening.productPlaceholder")}
													size="small"
													options={options}
													value={product}
													error={!!fieldState.error}
													additionalFilter={(p, text) => p.sku.toLowerCase().includes(text)}
													onChange={(p) => {
														field.onChange(p?.id ?? 0);
														// Prefill the unit cost from the product's supply price
														// (design parity) — only if the user hasn't entered one.
														if (p && !((watchedItems?.[index]?.unitCost ?? 0) > 0)) {
															setValue(`items.${index}.unitCost` as const, p.supplyPrice ?? 0, {
																shouldDirty: true,
															});
														}
													}}
												/>
											)}
										/>
										<Controller
											name={`items.${index}.quantity` as const}
											control={control}
											render={({ field, fieldState }) => (
												<NumericField
													{...field}
													value={field.value || ""}
													size="small"
													min={0}
													disabled={isSaving}
													error={!!fieldState.error}
													onChange={(e) => field.onChange(toNumberOrZero(e.target.value))}
													slotProps={{
														input: {
															endAdornment: <InputAdornment position="end">{unit}</InputAdornment>,
														},
													}}
												/>
											)}
										/>
										<Controller
											name={`items.${index}.unitCost` as const}
											control={control}
											render={({ field, fieldState }) => (
												<MoneyField
													value={field.value || 0}
													onChange={(v) => field.onChange(v)}
													size="small"
													placeholder="0"
													disabled={isSaving}
													error={!!fieldState.error}
													slotProps={{
														input: {
															endAdornment: <InputAdornment position="end">UZS</InputAdornment>,
														},
													}}
												/>
											)}
										/>
										<Typography
											sx={{
												...numericSx,
												fontWeight: 700,
												textAlign: "right",
												color: lineValue > 0 ? "text.primary" : "text.disabled",
											}}
										>
											{lineValue > 0 ? formatCurrency(lineValue) : "—"}
										</Typography>
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
									{rowErrorMsg && (
										<Typography sx={{ fontSize: 12, color: "error.main", mt: "6px" }}>
											{rowErrorMsg}
										</Typography>
									)}
								</Box>
							);
						})}
					</Stack>

					{showNoLinesError && (
						<Typography sx={{ mt: "8px", color: "error.main", fontSize: 12.5 }}>
							{t("warehouse.opening.noLinesBanner")}
						</Typography>
					)}

					<Button
						onClick={() => lines.append(emptyLine())}
						disabled={!canAddRow}
						startIcon={<AddIcon sx={{ fontSize: "18px !important" }} />}
						sx={{ mt: "8px", color: "primary.main", fontWeight: 600, px: 1 }}
					>
						{t("warehouse.opening.addLine")}
					</Button>

					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							gap: "22px",
							mt: "18px",
							p: "14px 18px",
							bgcolor: designTokens.gray25,
							border: "1px solid",
							borderColor: "divider",
							borderRadius: "8px",
						}}
					>
						<Box>
							<Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
								{t("warehouse.opening.summaryPositions")}
							</Typography>
							<Typography sx={{ ...numericSx, fontWeight: 700, fontSize: 16, mt: "2px" }}>
								{completeLines.length}
							</Typography>
						</Box>
						<Box>
							<Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
								{t("warehouse.opening.summaryUnits")}
							</Typography>
							<Typography sx={{ ...numericSx, fontWeight: 700, fontSize: 16, mt: "2px" }}>
								{formatQuantity(totalUnits)}
							</Typography>
						</Box>
						<Box sx={{ flexGrow: 1 }} />
						<Box sx={{ textAlign: "right" }}>
							<Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
								{t("warehouse.opening.summaryValue")}
							</Typography>
							<Typography
								sx={{
									...numericSx,
									fontWeight: 700,
									fontSize: 16,
									mt: "2px",
									color: "primary.main",
								}}
							>
								{formatCurrency(batchValue)}
								<Box
									component="span"
									sx={{ fontSize: 11.5, fontWeight: 600, color: "text.disabled", ml: "5px" }}
								>
									UZS
								</Box>
							</Typography>
						</Box>
					</Box>

					<Stack sx={{ gap: "7px", mt: "20px" }}>
						<FormFieldLabel label={t("warehouse.opening.note")} />
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
					</Stack>

					<Box
						sx={{
							display: "flex",
							gap: "10px",
							alignItems: "flex-start",
							mt: "16px",
							p: "11px 13px",
							bgcolor: "primary.light",
							border: "1px solid",
							borderColor: designTokens.primaryLine,
							borderRadius: "8px",
						}}
					>
						<InfoOutlinedIcon
							sx={{ fontSize: 16, color: "primary.main", mt: "1px", flex: "0 0 auto" }}
						/>
						<Typography sx={{ fontSize: 12.5, color: "primary.dark", lineHeight: 1.55 }}>
							{t("warehouse.opening.auditHintBefore")}{" "}
							<Box component="b">{t("warehouse.opening.auditHintBold")}</Box>{" "}
							{t("warehouse.opening.auditHintAfter")}
						</Typography>
					</Box>
				</DialogContent>

				<DialogActions
					sx={{
						px: "24px",
						py: "14px",
						gap: "14px",
						borderTop: "1px solid",
						borderColor: "divider",
						bgcolor: designTokens.gray25,
						flexWrap: "wrap",
					}}
				>
					<Typography sx={{ ...numericSx, fontSize: 12.5, color: "text.secondary" }}>
						{t("warehouse.opening.footerSummary", {
							count: completeLines.length,
							value: formatCurrency(batchValue),
						})}
					</Typography>
					<Box sx={{ flexGrow: 1 }} />
					<GhostButton onClick={requestClose} disabled={isSaving}>
						{t("common.cancel")}
					</GhostButton>
					<PrimaryButton icon={<CheckIcon />} onClick={submit} disabled={!canSave}>
						{t("warehouse.opening.submit")}
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

export default observer(OpeningStockModal);
