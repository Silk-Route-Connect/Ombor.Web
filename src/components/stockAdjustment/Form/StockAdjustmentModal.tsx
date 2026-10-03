import React, { useEffect, useMemo, useState } from "react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import EntityAutocomplete from "components/shared/Autocomplete/Autocomplete";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import FormDialogFooter from "components/shared/Dialog/Form/FormDialogFooter";
import FormDialogHeader from "components/shared/Dialog/Form/FormDialogHeader";
import FormFieldLabel from "components/shared/Forms/FormFieldLabel";
import NumericField from "components/shared/Inputs/NumericField";
import { useDirtyClose } from "hooks/shared/useDirtyClose";
import { useFormKeyboardSubmit } from "hooks/shared/useFormKeyboardSubmit";
import { useStockAdjustmentForm } from "hooks/stockAdjustment/useStockAdjustmentForm";
import { observer } from "mobx-react-lite";
import { Product } from "models/product";
import { AdjustmentDirection, reasonsFor } from "models/stockAdjustment";
import { Warehouse } from "models/warehouse";
import { StockAdjustmentFormValues } from "schemas/StockAdjustmentSchema";
import { useStore } from "stores/StoreContext";
import { designTokens, dialogPaperSx, numericSx } from "theme";
import { formatQuantity } from "utils/formatCurrency";
import { measurementShort } from "utils/productUtils";

import CheckIcon from "@mui/icons-material/Check";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import {
	Box,
	Dialog,
	DialogContent,
	InputAdornment,
	LinearProgress,
	MenuItem,
	Stack,
	TextField,
	Typography,
} from "@mui/material";

import DirectionCard from "./DirectionCard";

export interface StockAdjustmentModalProps {
	isOpen: boolean;
	isSaving: boolean;
	warehouses: Warehouse[];
	onSave: (payload: StockAdjustmentFormValues) => void;
	onClose: () => void;
}

const toNumberOrZero = (raw: string): number => {
	const value = raw.trim();
	return value === "" ? 0 : Number(value);
};

const PREV_CAP = {
	fontSize: 11,
	fontWeight: 600,
	color: "text.secondary",
	letterSpacing: "0.01em",
} as const;
const PREV_NUM = {
	...numericSx,
	fontWeight: 700,
	fontSize: 21,
	letterSpacing: "-0.01em",
	lineHeight: 1.1,
	color: "text.primary",
} as const;
const PREV_SEG = {
	p: "13px 16px",
	display: "flex",
	flexDirection: "column",
	gap: "3px",
	minWidth: 0,
} as const;
const PREV_ARROW = {
	display: "grid",
	placeItems: "center",
	px: "4px",
	color: "text.disabled",
	bgcolor: "background.paper",
} as const;

const PrevUnit: React.FC<{ children: React.ReactNode }> = ({ children }) => (
	<Box component="span" sx={{ fontSize: 12, fontWeight: 600, color: "text.disabled", ml: "5px" }}>
		{children}
	</Box>
);

/**
 * «Остаток после операции» live preview (ADJ-4, DSN-3 D2): Текущий → Корректировка
 * → После операции as one connected strip with a tinted result cell; the result
 * shows the resulting balance (the negative number on a below-zero списание, with
 * the «Ниже нуля» cap + error tint). A dashed skeleton stands in until a product
 * and a positive quantity are entered.
 */
const StockPreview: React.FC<{
	unit: string;
	avail: number;
	direction: AdjustmentDirection;
	quantity: number;
	afterBalance: number;
	overStock: boolean;
	hasInput: boolean;
}> = ({ unit, avail, direction, quantity, afterBalance, overStock, hasInput }) => {
	const { t } = useTranslation();

	if (!hasInput) {
		return (
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					gap: "10px",
					p: "15px 16px",
					border: "1px dashed",
					borderColor: designTokens.gray300,
					borderRadius: "8px",
					bgcolor: designTokens.gray25,
					fontSize: 12.5,
					color: "text.disabled",
				}}
			>
				<InfoOutlinedIcon sx={{ fontSize: 15, flex: "0 0 auto" }} />
				{t("adjustment.form.previewHint")}
			</Box>
		);
	}

	const isDown = direction === "Decrease";

	return (
		<Box
			sx={{
				display: "grid",
				gridTemplateColumns: "1fr auto 1fr auto 1fr",
				alignItems: "stretch",
				border: "1px solid",
				borderColor: overStock ? designTokens.errorBorder : "divider",
				borderRadius: "8px",
				overflow: "hidden",
				bgcolor: "background.paper",
			}}
		>
			<Box sx={PREV_SEG}>
				<Box sx={PREV_CAP}>{t("adjustment.form.previewCurrent")}</Box>
				<Box sx={PREV_NUM}>
					{formatQuantity(avail)}
					<PrevUnit>{unit}</PrevUnit>
				</Box>
			</Box>
			<Box sx={PREV_ARROW}>
				<ChevronRightIcon sx={{ fontSize: 18 }} />
			</Box>
			<Box sx={PREV_SEG}>
				<Box sx={PREV_CAP}>{t("adjustment.form.previewChange")}</Box>
				<Box sx={{ ...PREV_NUM, color: isDown ? "error.main" : "success.main" }}>
					{isDown ? "−" : "+"}
					{formatQuantity(quantity)}
					<PrevUnit>{unit}</PrevUnit>
				</Box>
			</Box>
			<Box sx={PREV_ARROW}>
				<ChevronRightIcon sx={{ fontSize: 18 }} />
			</Box>
			<Box sx={{ ...PREV_SEG, bgcolor: overStock ? designTokens.errorBg : designTokens.gray25 }}>
				<Box sx={{ ...PREV_CAP, color: overStock ? "error.main" : "text.secondary" }}>
					{overStock ? t("adjustment.form.previewNegative") : t("adjustment.form.previewAfter")}
				</Box>
				<Box sx={{ ...PREV_NUM, color: overStock ? "error.main" : "primary.main" }}>
					{formatQuantity(afterBalance)}
					<PrevUnit>{unit}</PrevUnit>
				</Box>
			</Box>
		</Box>
	);
};

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
			productStore.allProducts === "loading"
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
		<>
			<Dialog
				open={isOpen}
				onClose={requestClose}
				disableEscapeKeyDown={isSaving}
				disableRestoreFocus
				onKeyDown={onKeyDown}
				slotProps={{ paper: { sx: dialogPaperSx("md") } }}
			>
				<FormDialogHeader
					title={t("adjustment.title.create")}
					subtitle={t("adjustment.form.subtitle")}
					disabled={isSaving}
					onClose={requestClose}
				/>

				{isSaving && <LinearProgress />}

				<DialogContent dividers sx={{ pt: 2 }}>
					<Stack sx={{ gap: "16px" }}>
						<Stack sx={{ gap: "7px" }}>
							<FormFieldLabel label={t("adjustment.field.warehouse")} required />
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
						</Stack>

						<Stack sx={{ gap: "7px" }}>
							<FormFieldLabel label={t("adjustment.field.direction")} />
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
						</Stack>

						<Stack sx={{ gap: "7px" }}>
							<FormFieldLabel label={t("adjustment.field.product")} required />
							<EntityAutocomplete<Product>
								label=""
								placeholder={t("adjustment.form.productPlaceholder")}
								size="small"
								options={activeProducts}
								value={selected}
								error={!!formState.errors.productId}
								additionalFilter={(p, text) => p.sku.toLowerCase().includes(text)}
								onChange={handleProductChange}
							/>
							{formState.errors.productId && (
								<Typography sx={{ fontSize: 12, color: "error.main" }}>
									{formState.errors.productId.message}
								</Typography>
							)}
						</Stack>

						<Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
							<Stack sx={{ gap: "7px" }}>
								<FormFieldLabel label={t("adjustment.field.quantity")} required />
								<Controller
									name="quantity"
									control={control}
									render={({ field, fieldState }) => (
										<NumericField
											{...field}
											value={field.value || ""}
											size="small"
											min={0}
											disabled={isSaving}
											error={!!fieldState.error || overStock}
											onChange={(e) => field.onChange(toNumberOrZero(e.target.value))}
											slotProps={{
												input: {
													endAdornment: <InputAdornment position="end">{unit}</InputAdornment>,
												},
											}}
										/>
									)}
								/>
								{formState.errors.quantity && (
									<Typography sx={{ fontSize: 12, color: "error.main" }}>
										{formState.errors.quantity.message}
									</Typography>
								)}
							</Stack>

							<Stack sx={{ gap: "7px" }}>
								<FormFieldLabel label={t("adjustment.field.reason")} required />
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
							</Stack>
						</Box>

						<Stack sx={{ gap: "7px" }}>
							<FormFieldLabel label={t("adjustment.form.previewTitle")} />
							<StockPreview
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
						</Stack>

						<Stack sx={{ gap: "7px" }}>
							<FormFieldLabel label={t("adjustment.field.note")} />
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
						</Stack>
					</Stack>
				</DialogContent>

				<FormDialogFooter
					onCancel={requestClose}
					onSave={submit}
					canSave={canSave}
					loading={isSaving}
					submitLabel={t("adjustment.form.submit")}
					submitIcon={<CheckIcon />}
					commitNote={t("adjustment.form.commitNote")}
				/>
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

export default observer(StockAdjustmentModal);
