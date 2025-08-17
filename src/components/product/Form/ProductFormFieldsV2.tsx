/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable max-len */
import React, { useEffect, useRef, useState } from "react";
import { Controller, useWatch } from "react-hook-form";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import CloseIcon from "@mui/icons-material/Close";
import {
	Box,
	Button,
	IconButton,
	InputAdornment,
	MenuItem,
	Stack,
	TextField,
	Tooltip,
	Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import CategoryAutocomplete from "components/shared/Autocomplete/CategoryAutocomplete";
import NumericField from "components/shared/Inputs/NumericField";
import { UseProductFormResult } from "hooks/product/useProductForm";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import { getImageFullUrl } from "utils/productUtils";

type MainImageSelection = { kind: "existing"; imageId: number } | { kind: "new"; index: number };

export interface ProductFormFieldsTwoColumnProps {
	api: UseProductFormResult;
	disabled: boolean;
	onGenerateSku?: () => void;
	imagesBaseUrlResolver?: (url: string) => string;
}

function useFilePreviews(files: File[]): string[] {
	const [urls, setUrls] = useState<string[]>([]);
	useEffect(() => {
		const next = files.map((f) => URL.createObjectURL(f));
		setUrls(next);
		return () => next.forEach((u) => URL.revokeObjectURL(u));
	}, [files]);
	return urls;
}

const ProductFormFieldsTwoColumn: React.FC<ProductFormFieldsTwoColumnProps> = ({
	api,
	disabled,
	onGenerateSku,
	imagesBaseUrlResolver,
}) => {
	const {
		form,
		hasPackaging,
		packPrice,
		enablePackaging,
		disablePackaging,
		existingImages,
		attachments,
		addAttachments,
		removeAttachment,
		markImageForRemoval,
	} = api;

	const { control, setValue } = form;

	const type = useWatch({ control, name: "type" });
	const supplyDisabled = type === "Sale" || disabled;
	const saleRetailDisabled = type === "Supply" || disabled;

	const previews = useFilePreviews(attachments);

	const [mainImage, setMainImage] = useState<MainImageSelection | null>(null);

	// Keep main selection consistent with current lists
	useEffect(() => {
		if (mainImage?.kind === "existing") {
			const stillExists = existingImages.some((i) => i.id === mainImage.imageId);
			if (!stillExists) setMainImage(null);
		} else if (mainImage?.kind === "new") {
			if (mainImage.index >= attachments.length) setMainImage(null);
		}
		if (!mainImage) {
			if (existingImages.length > 0) {
				setMainImage({ kind: "existing", imageId: existingImages[0].id });
			} else if (attachments.length > 0) {
				setMainImage({ kind: "new", index: 0 });
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [existingImages, attachments]);

	const resolveUrl = (src: string) =>
		imagesBaseUrlResolver ? imagesBaseUrlResolver(src) : (getImageFullUrl(src) ?? src);

	const isMainExisting = (id: number) => mainImage?.kind === "existing" && mainImage.imageId === id;
	const isMainNew = (idx: number) => mainImage?.kind === "new" && mainImage.index === idx;

	// Single-image uploader (always visible circle). Makes uploaded file the main.
	const mainUploadInputRef = useRef<HTMLInputElement | null>(null);
	const openMainUpload = () => mainUploadInputRef.current?.click();

	const handleMainUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.currentTarget.files;
		if (files && files.length > 0) {
			const insertionIndex = attachments.length; // new file will appear at this index
			addAttachments(files);
			setMainImage({ kind: "new", index: insertionIndex });
		}
		// allow reselecting same file
		e.currentTarget.value = "";
	};

	// Multi-upload button (existing behavior)
	const multiUploadInputRef = useRef<HTMLInputElement | null>(null);
	const openMultiUpload = () => multiUploadInputRef.current?.click();
	const handleMultiUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.currentTarget.files;
		if (files && files.length > 0) {
			addAttachments(files);
		}
		e.currentTarget.value = "";
	};

	return (
		<Grid container spacing={3}>
			{/* Left column — Images 1/3 */}
			<Grid size={{ xs: 12, md: 4 }}>
				<Stack spacing={2}>
					<Typography variant="h6">{translate("product.images.title")}</Typography>

					{/* Always-visible circular main upload / main display */}
					<Stack alignItems="center" spacing={1}>
						<input
							ref={mainUploadInputRef}
							type="file"
							accept="image/*"
							hidden
							onChange={handleMainUploadChange}
							disabled={disabled}
						/>
						<Tooltip title={translate("product.images.mainUpload")}>
							<Box
								onClick={!disabled ? openMainUpload : undefined}
								sx={{
									width: 140,
									height: 140,
									borderRadius: "50%",
									border: (theme) => `2px dashed ${theme.palette.divider}`,
									display: "grid",
									placeItems: "center",
									cursor: disabled ? "default" : "pointer",
									overflow: "hidden",
									position: "relative",
									bgcolor: "background.default",
								}}
								aria-label={translate("product.images.mainUpload")}
							>
								{/* If there is a main image, show it inside the circle; otherwise show add icon */}
								{mainImage ? (
									<Box
										component="img"
										src={
											mainImage.kind === "existing"
												? resolveUrl(
														// eslint-disable-next-line max-len
														existingImages.find((i) => i.id === mainImage.imageId)?.thumbnailUrl ??
															// eslint-disable-next-line max-len
															existingImages.find((i) => i.id === mainImage.imageId)?.originalUrl ??
															"",
													)
												: previews[mainImage.index]
										}
										alt={translate("product.images.mainAlt")}
										sx={{ width: "100%", height: "100%", objectFit: "cover" }}
									/>
								) : (
									<Stack alignItems="center" spacing={0.5}>
										<AddCircleOutlineIcon fontSize="large" />
										<Typography variant="caption">{translate("product.images.setMain")}</Typography>
									</Stack>
								)}
							</Box>
						</Tooltip>
						<Typography variant="caption" color="text.secondary">
							{translate("product.images.mainHint")}
						</Typography>
					</Stack>

					{/* Upload more */}
					<Stack direction="row" alignItems="center" spacing={1}>
						<input
							ref={multiUploadInputRef}
							type="file"
							accept="image/*"
							multiple
							hidden
							onChange={handleMultiUploadChange}
							disabled={disabled}
						/>
						<Button
							variant="outlined"
							size="small"
							startIcon={<AddPhotoAlternateIcon />}
							onClick={openMultiUpload}
							disabled={disabled}
						>
							{translate("product.images.uploadMore")}
						</Button>
					</Stack>

					{/* Thumbnails grid (existing + new) */}
					<Typography variant="subtitle2" color="text.secondary">
						{translate("product.images.others")}
					</Typography>

					{/* Existing images */}
					{existingImages.length > 0 && (
						<Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
							{existingImages.map((img) => {
								const src = resolveUrl(img.thumbnailUrl ?? img.originalUrl);
								const selected = isMainExisting(img.id);
								return (
									<Box
										key={img.id}
										sx={{
											position: "relative",
											width: 96,
											height: 96,
											borderRadius: 1,
											cursor: disabled ? "default" : "pointer",
											// square within square: outer border + inner outline
											border: (theme) =>
												`2px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
											outline: (theme) =>
												`4px solid ${
													selected ? theme.palette.primary.light : theme.palette.background.paper
												}`,
											outlineOffset: "-6px",
											overflow: "hidden",
										}}
										onClick={() => !disabled && setMainImage({ kind: "existing", imageId: img.id })}
										role="button"
										tabIndex={0}
										onKeyDown={(e) => {
											if (!disabled && (e.key === "Enter" || e.key === " ")) {
												setMainImage({ kind: "existing", imageId: img.id });
												e.preventDefault();
											}
										}}
										aria-pressed={selected}
										aria-label={translate("product.images.makeMain")}
									>
										{/* delete existing (fully inside tile) */}
										<Tooltip title={translate("product.images.remove")}>
											<IconButton
												size="small"
												sx={{
													position: "absolute",
													top: 6,
													right: 6,
													bgcolor: "background.paper",
													boxShadow: 1,
													"&:hover": { bgcolor: "background.paper" },
												}}
												onClick={(e) => {
													e.stopPropagation();
													markImageForRemoval(img.id);
												}}
												disabled={disabled}
												aria-label={translate("product.images.remove")}
											>
												<CloseIcon fontSize="small" color="error" />
											</IconButton>
										</Tooltip>

										<Box
											component="img"
											src={src}
											alt={img.name}
											sx={{ width: "100%", height: "100%", objectFit: "cover" }}
										/>
									</Box>
								);
							})}
						</Box>
					)}

					{/* New uploads */}
					{attachments.length > 0 && (
						<Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
							{attachments.map((file, index) => {
								const selected = isMainNew(index);
								return (
									<Box
										key={`${file.name}-${index}`}
										sx={{
											position: "relative",
											width: 96,
											height: 96,
											borderRadius: 1,
											cursor: disabled ? "default" : "pointer",
											border: (theme) =>
												`2px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
											outline: (theme) =>
												`4px solid ${
													selected ? theme.palette.primary.light : theme.palette.background.paper
												}`,
											outlineOffset: "-6px",
											overflow: "hidden",
										}}
										onClick={() => !disabled && setMainImage({ kind: "new", index })}
										role="button"
										tabIndex={0}
										onKeyDown={(e) => {
											if (!disabled && (e.key === "Enter" || e.key === " ")) {
												setMainImage({ kind: "new", index });
												e.preventDefault();
											}
										}}
										aria-pressed={selected}
										aria-label={translate("product.images.makeMain")}
									>
										{/* delete upload (fully inside tile) */}
										<Tooltip title={translate("product.images.remove")}>
											<IconButton
												size="small"
												sx={{
													position: "absolute",
													top: 6,
													right: 6,
													bgcolor: "background.paper",
													boxShadow: 1,
													"&:hover": { bgcolor: "background.paper" },
												}}
												onClick={(e) => {
													e.stopPropagation();
													removeAttachment(index);
												}}
												disabled={disabled}
												aria-label={translate("product.images.remove")}
											>
												<CloseIcon fontSize="small" color="error" />
											</IconButton>
										</Tooltip>

										<Box
											component="img"
											src={previews[index]}
											alt={file.name}
											sx={{ width: "100%", height: "100%", objectFit: "cover" }}
										/>
									</Box>
								);
							})}
						</Box>
					)}
				</Stack>
			</Grid>

			{/* Right column — Fields 2/3 (one per row) */}
			<Grid size={{ xs: 12, md: 8 }}>
				<Stack spacing={2.5}>
					<Controller
						name="name"
						control={control}
						render={({ field, fieldState }) => (
							<TextField
								{...field}
								label={translate("product.name")}
								required
								fullWidth
								error={!!fieldState.error}
								helperText={fieldState.error?.message}
								disabled={disabled}
							/>
						)}
					/>

					<Controller
						name="categoryId"
						control={control}
						render={({ field, fieldState }) => (
							<>
								<CategoryAutocomplete
									mode="id"
									value={field.value === 0 ? null : (field.value as number | null)}
									disabled={disabled}
									onChange={(id) =>
										setValue("categoryId", id ?? 0, { shouldDirty: true, shouldValidate: true })
									}
								/>
								{fieldState.error && (
									<Typography variant="caption" color="error">
										{fieldState.error.message}
									</Typography>
								)}
							</>
						)}
					/>

					<Controller
						name="measurement"
						control={control}
						render={({ field, fieldState }) => (
							<TextField
								select
								fullWidth
								label={translate("product.measurement")}
								value={field.value}
								onChange={(e) => field.onChange(e.target.value)}
								error={!!fieldState.error}
								helperText={fieldState.error?.message}
								disabled={disabled}
							>
								{["Gram", "Kilogram", "Liter", "Unit", "None"].map((m) => (
									<MenuItem key={m} value={m}>
										{translate(`product.measurement.${m}`)}
									</MenuItem>
								))}
							</TextField>
						)}
					/>

					<Controller
						name="type"
						control={control}
						render={({ field, fieldState }) => (
							<TextField
								select
								fullWidth
								label={translate("product.type")}
								value={field.value}
								onChange={(e) => field.onChange(e.target.value)}
								error={!!fieldState.error}
								helperText={fieldState.error?.message}
								disabled={disabled}
							>
								{["Sale", "Supply", "All"].map((t) => (
									<MenuItem key={t} value={t}>
										{translate(`product.type.${t}`)}
									</MenuItem>
								))}
							</TextField>
						)}
					/>

					<Controller
						name="supplyPrice"
						control={control}
						render={({ field, fieldState }) => (
							<NumericField
								{...field}
								value={field.value}
								label={translate("product.supplyPrice")}
								min={0}
								step={1}
								disabled={supplyDisabled}
								error={!!fieldState.error}
								helperText={fieldState.error?.message}
								onChange={(e) => {
									const val = e.target.value.trim();
									field.onChange(val === "" ? 0 : Number(val));
								}}
							/>
						)}
					/>

					<Controller
						name="salePrice"
						control={control}
						render={({ field, fieldState }) => (
							<NumericField
								{...field}
								value={field.value}
								label={translate("product.salePrice")}
								min={0}
								step={1}
								disabled={saleRetailDisabled}
								error={!!fieldState.error}
								helperText={fieldState.error?.message}
								onChange={(e) => {
									const val = e.target.value.trim();
									field.onChange(val === "" ? 0 : Number(val));
								}}
							/>
						)}
					/>

					<Controller
						name="retailPrice"
						control={control}
						render={({ field, fieldState }) => (
							<NumericField
								{...field}
								value={field.value}
								label={translate("product.retailPrice")}
								min={0}
								step={1}
								disabled={saleRetailDisabled}
								error={!!fieldState.error}
								helperText={fieldState.error?.message}
								onChange={(e) => {
									const val = e.target.value.trim();
									field.onChange(val === "" ? 0 : Number(val));
								}}
							/>
						)}
					/>

					<Controller
						name="sku"
						control={control}
						render={({ field, fieldState }) => (
							<TextField
								{...field}
								label={translate("product.sku")}
								fullWidth
								required
								error={!!fieldState.error}
								helperText={fieldState.error?.message}
								disabled={disabled}
								slotProps={{
									input: {
										endAdornment: onGenerateSku ? (
											<InputAdornment position="end">
												<IconButton
													onClick={onGenerateSku}
													size="small"
													aria-label={translate("action.generateSku")}
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

					<Controller
						name="barcode"
						control={control}
						render={({ field, fieldState }) => (
							<TextField
								{...field}
								label={translate("product.barcode")}
								fullWidth
								error={!!fieldState.error}
								helperText={fieldState.error?.message}
								disabled={disabled}
							/>
						)}
					/>

					{/* Packaging toggle */}
					<Box>
						<Stack direction="row" alignItems="center" justifyContent="space-between">
							<Typography variant="subtitle1">{translate("product.packaging")}</Typography>
							<Button
								size="small"
								variant={hasPackaging ? "contained" : "outlined"}
								onClick={() => (hasPackaging ? disablePackaging() : enablePackaging())}
								disabled={disabled}
							>
								{hasPackaging ? translate("common.enabled") : translate("common.enable")}
							</Button>
						</Stack>
					</Box>

					{/* Packaging fields */}
					{hasPackaging && (
						<>
							<Controller
								name="packaging.packSize"
								control={control}
								render={({ field, fieldState }) => (
									<NumericField
										{...field}
										value={field.value}
										label={translate("product.packaging.size")}
										min={2}
										step={1}
										selectOnFocus
										error={!!fieldState.error}
										helperText={fieldState.error?.message}
										disabled={disabled}
										onChange={(e) => {
											const v = e.target.value.trim();
											field.onChange(v === "" ? 0 : Number(v));
										}}
									/>
								)}
							/>

							<Controller
								name="packaging.packLabel"
								control={control}
								render={({ field, fieldState }) => (
									<TextField
										{...field}
										label={translate("product.packaging.label")}
										fullWidth
										error={!!fieldState.error}
										helperText={fieldState.error?.message}
										disabled={disabled}
									/>
								)}
							/>

							<Controller
								name="packaging.packBarcode"
								control={control}
								render={({ field, fieldState }) => (
									<TextField
										{...field}
										label={translate("product.packaging.barcode")}
										fullWidth
										error={!!fieldState.error}
										helperText={fieldState.error?.message}
										disabled={disabled}
									/>
								)}
							/>

							<TextField
								label={translate("product.packaging.price")}
								value={packPrice ?? ""}
								fullWidth
								disabled
								slotProps={{ input: { readOnly: true } }}
							/>
						</>
					)}

					<Controller
						name="description"
						control={control}
						render={({ field, fieldState }) => (
							<TextField
								{...field}
								label={translate("product.description")}
								fullWidth
								multiline
								minRows={3}
								error={!!fieldState.error}
								helperText={fieldState.error?.message}
								disabled={disabled}
							/>
						)}
					/>
				</Stack>
			</Grid>
		</Grid>
	);
};

export default observer(ProductFormFieldsTwoColumn);
