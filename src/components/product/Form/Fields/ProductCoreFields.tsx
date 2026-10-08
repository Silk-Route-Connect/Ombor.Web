import React from "react";
import { Control, Controller, UseFormSetValue, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import CategoryAutocomplete from "components/category/Autocomplete/CategoryAutocomplete";
import FormField from "components/shared/Forms/FormField";
import MoneyField from "components/shared/Inputs/MoneyField";
import UzsAdornment from "components/shared/Money/UzsAdornment";
import SegmentedControl from "components/shared/SegmentedControl/SegmentedControl";
import { ProductType } from "models/product";
import { ProductFormInputs } from "schemas/ProductSchema";

import AutorenewIcon from "@mui/icons-material/Autorenew";
import { Box, IconButton, InputAdornment, Stack, TextField, Typography } from "@mui/material";

import ProductMeasurementField from "./ProductMeasurementField";

export interface ProductFormCoreFieldsProps {
	control: Control<ProductFormInputs>;
	setValue: UseFormSetValue<ProductFormInputs>;
	disabled: boolean;
	/** Image block rendered in the 196px left column of the top grid. */
	imagesSlot: React.ReactNode;
	onGenerateSku?: () => void;
	skuAutofill?: boolean;
}

const TYPES: ProductType[] = ["Sale", "Supply", "All"];

const uzsSuffix = {
	input: { endAdornment: <UzsAdornment /> },
};

/**
 * Core fields laid out per the bundle's dialog: a 196px/1fr top grid (images
 * left; name, category, unit — no low-stock threshold: it is set per warehouse,
 * DR-41), then full-width rows — артикул/штрих-код,
 * «Тип товара» segmented control, and the type-dependent price pair. Labels sit
 * above the inputs (`.flabel`); inputs are 40px (`.tinput`, MUI small).
 */
const ProductFormCoreFields: React.FC<ProductFormCoreFieldsProps> = ({
	control,
	setValue,
	disabled,
	imagesSlot,
	onGenerateSku,
	skuAutofill,
}) => {
	const { t } = useTranslation();
	const type = useWatch({ control, name: "type" as const });

	const showSale = type === "Sale" || type === "All";
	const showSupply = type === "Supply" || type === "All";
	const priceColumns = (showSale ? 1 : 0) + (showSupply ? 1 : 0);

	return (
		<Box>
			{/* prod-top: 196px image column + field column, gap 22, mb 20 */}
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: { xs: "1fr", sm: "196px 1fr" },
					gap: "22px",
					mb: "20px",
				}}
			>
				<Box>{imagesSlot}</Box>

				{/* prod-fields: column, gap 14 */}
				<Stack sx={{ gap: "14px" }}>
					<FormField label={t("product.name")} required>
						<Controller
							name="name"
							control={control}
							render={({ field, fieldState }) => (
								<TextField
									{...field}
									size="small"
									fullWidth
									placeholder={t("product.form.namePlaceholder")}
									disabled={disabled}
									error={!!fieldState.error}
									helperText={fieldState.error?.message}
								/>
							)}
						/>
					</FormField>

					<FormField label={t("product.category")} required>
						<Controller
							name="categoryId"
							control={control}
							render={({ field, fieldState }) => (
								<CategoryAutocomplete
									mode="id"
									value={field.value ?? null}
									size="small"
									label=""
									placeholder={t("product.form.categoryPlaceholder")}
									disabled={disabled}
									error={!!fieldState.error}
									helperText={fieldState.error?.message}
									onChange={(id) =>
										setValue("categoryId", id, { shouldDirty: true, shouldValidate: true })
									}
								/>
							)}
						/>
					</FormField>

					<ProductMeasurementField control={control} disabled={disabled} />
				</Stack>
			</Box>

			{/* артикул + штрих-код, gap 16, mb 16 */}
			<Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", mb: "16px" }}>
				<FormField label={t("product.form.skuLabel")} required>
					<Controller
						name="sku"
						control={control}
						render={({ field, fieldState }) => (
							<TextField
								{...field}
								size="small"
								fullWidth
								placeholder={t("product.form.skuPlaceholder")}
								disabled={disabled}
								error={!!fieldState.error}
								helperText={
									fieldState.error?.message ??
									(skuAutofill ? t("product.form.skuHelper") : undefined)
								}
								slotProps={{
									input: {
										endAdornment: onGenerateSku ? (
											<InputAdornment position="end">
												<IconButton
													onClick={onGenerateSku}
													size="small"
													aria-label={t("action.generateSku")}
													disabled={disabled}
												>
													<AutorenewIcon fontSize="small" />
												</IconButton>
											</InputAdornment>
										) : undefined,
									},
								}}
							/>
						)}
					/>
				</FormField>
				<FormField label={t("product.barcode")}>
					<Controller
						name="barcode"
						control={control}
						render={({ field, fieldState }) => (
							<TextField
								{...field}
								value={field.value ?? ""}
								size="small"
								fullWidth
								placeholder={t("product.form.optionalPlaceholder")}
								disabled={disabled}
								error={!!fieldState.error}
								helperText={fieldState.error?.message}
							/>
						)}
					/>
				</FormField>
			</Box>

			{/* тип товара: flabel + seg-full, mb 16 */}
			<Box sx={{ mb: "16px" }}>
				<FormField label={t("product.type")}>
					<Controller
						name="type"
						control={control}
						render={({ field }) => (
							<SegmentedControl<ProductType>
								options={TYPES.map((option) => ({
									value: option,
									label: t(`product.type.${option}`),
								}))}
								value={field.value as ProductType}
								onChange={field.onChange}
								fullWidth
								variant="form"
								disabled={disabled}
							/>
						)}
					/>
					{/* Explain the chosen type — new users don't know that "Закупка" hides
					    a product from the sales POS. Teach it inline. */}
					<Typography sx={{ fontSize: 12, color: "text.secondary", lineHeight: 1.45 }}>
						{t(`product.form.typeHint.${type}`)}
					</Typography>
				</FormField>
			</Box>

			{/* prices (conditional by type), gap 14, mb 4 */}
			{priceColumns > 0 && (
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: `repeat(${priceColumns}, 1fr)`,
						gap: "14px",
						mb: "4px",
					}}
				>
					{showSale && (
						<FormField label={t("product.salePrice")} required>
							<Controller
								name="salePrice"
								control={control}
								render={({ field, fieldState }) => (
									<MoneyField
										value={field.value}
										onChange={field.onChange}
										onBlur={field.onBlur}
										name={field.name}
										inputRef={field.ref}
										size="small"
										disabled={disabled}
										error={!!fieldState.error}
										helperText={fieldState.error?.message}
										slotProps={uzsSuffix}
									/>
								)}
							/>
						</FormField>
					)}
					{showSupply && (
						<FormField label={t("product.supplyPrice")} required>
							<Controller
								name="supplyPrice"
								control={control}
								render={({ field, fieldState }) => (
									<MoneyField
										value={field.value}
										onChange={field.onChange}
										onBlur={field.onBlur}
										name={field.name}
										inputRef={field.ref}
										size="small"
										disabled={disabled}
										error={!!fieldState.error}
										helperText={fieldState.error?.message}
										slotProps={uzsSuffix}
									/>
								)}
							/>
						</FormField>
					)}
				</Box>
			)}
		</Box>
	);
};

export default ProductFormCoreFields;
