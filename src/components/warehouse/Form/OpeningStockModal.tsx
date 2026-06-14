import React, { useEffect, useMemo, useState } from "react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import ProductAutocomplete from "components/product/Autocomplete/ProductAutocomplete";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import FormDialogFooter from "components/shared/Dialog/Form/FormDialogFooter";
import FormDialogHeader from "components/shared/Dialog/Form/FormDialogHeader";
import FormFieldLabel from "components/shared/Forms/FormFieldLabel";
import NumericField from "components/shared/Inputs/NumericField";
import { useDirtyClose } from "hooks/shared/useDirtyClose";
import { useOpeningStockForm } from "hooks/warehouse/useOpeningStockForm";
import { observer } from "mobx-react-lite";
import { Product } from "models/product";
import { Warehouse, WarehouseStockItem } from "models/warehouse";
import { OpeningStockFormValues } from "schemas/WarehouseSchema";
import { useStore } from "stores/StoreContext";
import { designTokens, numericSx } from "theme";
import { formatCurrency, formatQuantity } from "utils/formatCurrency";
import { MEASUREMENT_SHORT } from "utils/productUtils";

import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import {
	Alert,
	Box,
	Dialog,
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
	/** Current stock in this warehouse — drives the availability hint. */
	stock: WarehouseStockItem[];
	onSave: (payload: OpeningStockFormValues) => void;
	onClose: () => void;
}

const toNumberOrZero = (raw: string): number => {
	const value = raw.trim();
	return value === "" ? 0 : Number(value);
};

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

	const { form, canSave, submit } = useOpeningStockForm({ isOpen, isSaving, onSave });
	const { control, setValue, formState } = form;

	const [selected, setSelected] = useState<Product | null>(null);
	const quantity = form.watch("quantity");
	const unitCost = form.watch("unitCost");

	const { discardOpen, requestClose, cancelDiscard, confirmDiscard } = useDirtyClose(
		formState.isDirty,
		isSaving,
		onClose,
	);

	// Populate the product picker (ProductAutocomplete reads productStore).
	useEffect(() => {
		if (isOpen) {
			productStore.getAll();
			setSelected(null);
		}
	}, [isOpen, productStore]);

	const unit = selected
		? MEASUREMENT_SHORT[selected.measurement]
		: t("warehouse.opening.unitFallback");

	const currentQty = useMemo(() => {
		if (!selected) {
			return 0;
		}
		return stock.find((item) => item.productId === selected.id)?.quantity ?? 0;
	}, [selected, stock]);

	const errorCount = Object.keys(formState.errors).length;
	const showErrorBanner = formState.isSubmitted && errorCount > 0;

	const showPreview = selected && quantity > 0 && unitCost > 0;
	const batchValue = showPreview ? Math.round(quantity * unitCost) : 0;
	const newBalance = showPreview ? currentQty + quantity : currentQty;

	const handleProductChange = (product: Product | null) => {
		setSelected(product);
		setValue("productId", product?.id ?? 0, { shouldDirty: true, shouldValidate: true });
	};

	return (
		<>
			<Dialog
				open={isOpen}
				onClose={requestClose}
				disableEscapeKeyDown={isSaving}
				disableRestoreFocus
				slotProps={{ paper: { sx: { width: 560, maxWidth: "94%", borderRadius: "12px" } } }}
			>
				<FormDialogHeader
					title={t("warehouse.opening.title")}
					subtitle={warehouse.name}
					disabled={isSaving}
					onClose={requestClose}
				/>

				{isSaving && <LinearProgress />}

				<DialogContent dividers sx={{ pt: 2 }}>
					{showErrorBanner && (
						<Alert
							severity="error"
							icon={<ErrorOutlineIcon />}
							variant="outlined"
							sx={{ mb: "16px" }}
						>
							{t("warehouse.opening.errorBanner")}
						</Alert>
					)}

					<Stack sx={{ gap: "16px" }}>
						<Stack sx={{ gap: "7px" }}>
							<FormFieldLabel label={t("warehouse.opening.product")} required />
							<ProductAutocomplete type="All" value={selected} onChange={handleProductChange} />
							{formState.errors.productId && (
								<Typography sx={{ fontSize: 12, color: "error.main" }}>
									{formState.errors.productId.message}
								</Typography>
							)}
							{selected && (
								<Typography sx={{ fontSize: 12, color: "text.secondary" }}>
									{t("warehouse.opening.currentStock")}{" "}
									<Box
										component="span"
										sx={{ ...numericSx, fontWeight: 700, color: designTokens.gray700 }}
									>
										{formatQuantity(currentQty)} {unit}
									</Box>
								</Typography>
							)}
						</Stack>

						<Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
							<Stack sx={{ gap: "7px" }}>
								<FormFieldLabel label={t("warehouse.opening.quantity")} required />
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
											error={!!fieldState.error}
											helperText={fieldState.error?.message}
											onChange={(e) => field.onChange(toNumberOrZero(e.target.value))}
											slotProps={{
												input: {
													endAdornment: <InputAdornment position="end">{unit}</InputAdornment>,
												},
											}}
										/>
									)}
								/>
							</Stack>
							<Stack sx={{ gap: "7px" }}>
								<FormFieldLabel label={t("warehouse.opening.unitCost")} required />
								<Controller
									name="unitCost"
									control={control}
									render={({ field, fieldState }) => (
										<NumericField
											{...field}
											value={field.value || ""}
											size="small"
											min={0}
											disabled={isSaving}
											error={!!fieldState.error}
											helperText={fieldState.error?.message}
											onChange={(e) => field.onChange(toNumberOrZero(e.target.value))}
											slotProps={{
												input: {
													endAdornment: <InputAdornment position="end">UZS</InputAdornment>,
												},
											}}
										/>
									)}
								/>
							</Stack>
						</Box>

						{showPreview && (
							<Box
								sx={{
									p: "11px 14px",
									bgcolor: designTokens.gray25,
									border: "1px solid",
									borderColor: "divider",
									borderRadius: "8px",
									fontSize: 13,
									color: designTokens.gray700,
								}}
							>
								{t("warehouse.opening.batchValue")}{" "}
								<Box component="b" sx={numericSx}>
									{formatCurrency(batchValue)} UZS
								</Box>{" "}
								· {t("warehouse.opening.newBalance")}{" "}
								<Box component="b" sx={numericSx}>
									{formatQuantity(newBalance)} {unit}
								</Box>
							</Box>
						)}

						<Stack sx={{ gap: "7px" }}>
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
					</Stack>
				</DialogContent>

				<FormDialogFooter
					onCancel={requestClose}
					onSave={submit}
					canSave={canSave}
					loading={isSaving}
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

export default observer(OpeningStockModal);
