import React, { useMemo } from "react";
import { Controller, UseFormReturn, useWatch } from "react-hook-form";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import CloseIcon from "@mui/icons-material/Close";
import {
	Box,
	FormControlLabel,
	Grid,
	IconButton,
	InputAdornment,
	MenuItem,
	Switch,
	TextField,
	Typography,
} from "@mui/material";
import AttachmentPicker from "components/shared/AttachmentPicker/AttachmentPicker";
import CategoryAutocomplete from "components/shared/Autocomplete/CategoryAutocomplete";
import NumericField from "components/shared/Inputs/NumericField";
import { translate } from "i18n/i18n";
import { Category } from "models/category";
import { PRODUCT_MEASUREMENTS, PRODUCT_TYPES, ProductImage } from "models/product";
import { ProductFormInputs } from "schemas/ProductSchema";
import { useStore } from "stores/StoreContext";

export interface ProductFormFieldsProps {
	form: UseFormReturn<ProductFormInputs>;
	hasPackaging: boolean;
	packPrice: number | null;
	existingImages?: ProductImage[];
	disabled: boolean;

	enablePackaging: () => void;
	disablePackaging: () => void;
	onGenerateSku?: () => void;
	onRemoveExistingImage?: (imageId: number) => void;
	imagesBaseUrlResolver?: (url: string) => string;
}

const ProductFormFields: React.FC<ProductFormFieldsProps> = ({
	form,
	hasPackaging,
	packPrice,
	existingImages = [],
	disabled,
	enablePackaging,
	disablePackaging,
	onGenerateSku,
	onRemoveExistingImage,
	imagesBaseUrlResolver,
}) => {
	const {
		control,
		setValue,
		formState: { errors },
	} = form;

	const { categoryStore } = useStore();

	// watch minimal fields needed for dynamic UI
	const type = useWatch({ control, name: "type" });
	const categoryId = useWatch({ control, name: "categoryId" });

	const categories: Category[] = useMemo(
		() => (categoryStore.allCategories === "loading" ? [] : categoryStore.allCategories),
		[categoryStore.allCategories],
	);

	const selectedCategory = useMemo(
		() => (categoryId ? (categories.find((c) => c.id === categoryId) ?? null) : null),
		[categories, categoryId],
	);

	const handlePackagingToggle = (checked: boolean) => {
		if (checked) enablePackaging();
		else disablePackaging();
	};

	const supplyDisabled = type === "Sale" || disabled;
	const saleRetailDisabled = type === "Supply" || disabled;

	const attachments = useWatch({ control, name: "attachments" }) ?? [];

	const addAttachments = (files: FileList) => {
		const next = [...attachments, ...Array.from(files)];
		setValue("attachments", next, { shouldDirty: true, shouldValidate: true });
	};

	const removeAttachment = (index: number) => {
		const next = attachments.filter((_, i) => i !== index);
		setValue("attachments", next, { shouldDirty: true, shouldValidate: true });
	};

	const getImgUrl = (src: string) => (imagesBaseUrlResolver ? imagesBaseUrlResolver(src) : src);

	console.log(errors);

	return (
		<Grid container rowSpacing={3} columnSpacing={{ xs: 2, sm: 3 }}>
			{/* Row 1: Name, Category, Measurement */}
			<Grid size={{ xs: 12, md: 4 }}>
				<Controller
					name="name"
					control={control}
					disabled={disabled}
					render={({ field }) => (
						<TextField
							{...field}
							label={translate("product.name")}
							fullWidth
							error={!!errors.name}
							helperText={errors.name?.message}
						/>
					)}
				/>
			</Grid>

			<Grid size={{ xs: 12, md: 4 }}>
				<CategoryAutocomplete
					value={selectedCategory}
					disabled={disabled}
					onChange={(val) =>
						setValue("categoryId", val?.id ?? 0, { shouldDirty: true, shouldValidate: true })
					}
				/>
				{errors.categoryId && (
					<Typography variant="caption" color="error">
						{errors.categoryId.message}
					</Typography>
				)}
			</Grid>

			<Grid size={{ xs: 12, md: 4 }}>
				<Controller
					name="measurement"
					control={control}
					render={({ field }) => (
						<TextField
							select
							label={translate("product.measurement")}
							fullWidth
							value={field.value}
							onChange={(e) => field.onChange(e.target.value)}
							error={!!errors.measurement}
							helperText={errors.measurement?.message}
							disabled={disabled}
						>
							{PRODUCT_MEASUREMENTS.map((m) => (
								<MenuItem key={m} value={m}>
									{translate(`product.measurement.${m}`)}
								</MenuItem>
							))}
						</TextField>
					)}
				/>
			</Grid>

			{/* Row 2: SKU, Barcode */}
			<Grid size={{ xs: 12, md: 6 }}>
				<Controller
					name="sku"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							label={translate("product.sku")}
							fullWidth
							error={!!errors.sku}
							helperText={errors.sku?.message}
							disabled={disabled}
							slotProps={{
								input: {
									endAdornment: onGenerateSku ? (
										<InputAdornment position="end">
											<IconButton
												onClick={onGenerateSku}
												size="small"
												aria-label={translate("action.generateSku")}
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
			</Grid>

			<Grid size={{ xs: 12, md: 6 }}>
				<Controller
					name="barcode"
					control={control}
					disabled={disabled}
					render={({ field }) => (
						<TextField
							{...field}
							label={translate("product.barcode")}
							error={!!errors.barcode}
							helperText={errors.barcode?.message}
							fullWidth
						/>
					)}
				/>
			</Grid>

			{/* Row 3: Type + Prices (kept together so changes are obvious) */}
			<Grid size={{ xs: 12, md: 3 }}>
				<Controller
					name="type"
					control={control}
					render={({ field }) => (
						<TextField
							value={field.value}
							select
							fullWidth
							label={translate("product.type")}
							error={!!errors.type}
							helperText={errors.type?.message}
							disabled={disabled}
							onChange={(e) => field.onChange(e.target.value)}
						>
							{PRODUCT_TYPES.map((t) => (
								<MenuItem key={t} value={t}>
									{translate(`product.type.${t}`)}
								</MenuItem>
							))}
						</TextField>
					)}
				/>
			</Grid>

			<Grid size={{ xs: 12, md: 3 }}>
				<Controller
					name="supplyPrice"
					control={control}
					render={({ field }) => (
						<NumericField
							{...field}
							value={field.value}
							label={translate("product.supplyPrice")}
							min={0}
							step={1}
							disabled={supplyDisabled}
							error={!!errors.supplyPrice}
							helperText={errors.supplyPrice?.message}
							onChange={(e) => {
								const value = e.target.value.trim();
								field.onChange(value === "" ? 0 : Number(value));
							}}
						/>
					)}
				/>
			</Grid>

			<Grid size={{ xs: 12, md: 3 }}>
				<Controller
					name="salePrice"
					control={control}
					render={({ field }) => (
						<NumericField
							{...field}
							value={field.value}
							label={translate("product.salePrice")}
							min={0}
							step={1}
							disabled={saleRetailDisabled}
							error={!!errors.salePrice}
							helperText={errors.salePrice?.message}
							onChange={(e) => {
								const value = e.target.value.trim();
								field.onChange(value === "" ? 0 : Number(value));
							}}
						/>
					)}
				/>
			</Grid>

			<Grid size={{ xs: 12, md: 3 }}>
				<Controller
					name="retailPrice"
					control={control}
					render={({ field }) => (
						<NumericField
							{...field}
							value={field.value}
							label={translate("product.retailPrice")}
							min={0}
							step={1}
							disabled={saleRetailDisabled}
							error={!!errors.retailPrice}
							helperText={errors.retailPrice?.message}
							onChange={(e) => {
								const value = e.target.value.trim();
								field.onChange(value === "" ? 0 : Number(value));
							}}
						/>
					)}
				/>
			</Grid>

			<Grid size={{ xs: 12 }}>
				<FormControlLabel
					control={
						<Switch
							checked={hasPackaging}
							disabled={disabled}
							onChange={(_, checked) => handlePackagingToggle(checked)}
						/>
					}
					label={translate("product.packaging")}
				/>
			</Grid>

			{hasPackaging && (
				<>
					<Grid size={{ xs: 12, sm: 3 }}>
						<Controller
							name="packaging.packSize"
							control={control}
							render={({ field }) => (
								<NumericField
									{...field}
									value={field.value}
									label={translate("product.packaging.size")}
									min={2}
									step={1}
									selectOnFocus
									error={!!errors.packaging?.packSize}
									helperText={errors.packaging?.packSize?.message}
									disabled={disabled}
									onChange={(e) => {
										const value = e.target.value.trim();
										field.onChange(value === "" ? 0 : Number(value));
									}}
								/>
							)}
						/>
					</Grid>

					<Grid size={{ xs: 12, sm: 3 }}>
						<Controller
							name="packaging.packLabel"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									label={translate("product.packaging.label")}
									error={!!errors.packaging?.packLabel}
									helperText={errors.packaging?.packLabel?.message}
									disabled={disabled}
								/>
							)}
						/>
					</Grid>

					<Grid size={{ xs: 12, sm: 3 }}>
						<Controller
							name="packaging.packBarcode"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									label={translate("product.packaging.barcode")}
									error={!!errors.packaging?.packBarcode}
									helperText={errors.packaging?.packBarcode?.message}
									disabled={disabled}
								/>
							)}
						/>
					</Grid>

					<Grid size={{ xs: 12, sm: 3 }}>
						<TextField
							label={translate("product.packaging.price")}
							value={packPrice ?? ""}
							aria-readonly
							slotProps={{
								input: {
									readOnly: true,
								},
							}}
							disabled={disabled}
						/>
					</Grid>
				</>
			)}

			<Grid size={{ xs: 12 }}>
				<Controller
					name="description"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							label={translate("product.description")}
							fullWidth
							multiline
							minRows={3}
							error={!!errors.description}
							helperText={errors.description?.message}
							disabled={disabled}
						/>
					)}
				/>
			</Grid>

			{existingImages.length > 0 && (
				<Grid size={{ xs: 12 }}>
					<Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
						{existingImages.map((img) => (
							<Box key={img.id} sx={{ position: "relative" }}>
								<Box
									component="img"
									src={getImgUrl(img.thumbnailUrl ?? img.originalUrl)}
									alt={img.name}
									sx={{ width: 80, height: 80, objectFit: "cover", borderRadius: 1 }}
								/>
								{onRemoveExistingImage && (
									<IconButton
										size="small"
										onClick={() => onRemoveExistingImage(img.id)}
										sx={{ position: "absolute", top: -8, right: -8, bgcolor: "background.paper" }}
										aria-label={translate("action.removeImage")}
										disabled={disabled}
									>
										<CloseIcon fontSize="small" color="error" />
									</IconButton>
								)}
							</Box>
						))}
					</Box>
				</Grid>
			)}

			<Grid size={{ xs: 12 }}>
				<AttachmentPicker
					files={attachments}
					disabled={disabled}
					onAdd={addAttachments}
					onRemove={removeAttachment}
				/>
				{errors.attachments && (
					<Typography variant="caption" color="error" sx={{ display: "block", mt: 0.5 }}>
						{errors.attachments.message as string}
					</Typography>
				)}
			</Grid>
		</Grid>
	);
};

export default ProductFormFields;
