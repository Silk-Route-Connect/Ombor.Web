import React, { useCallback, useEffect, useState } from "react";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import CloseIcon from "@mui/icons-material/Close";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	Grid,
	IconButton,
	InputAdornment,
	InputLabel,
	MenuItem,
	Select,
	TextField,
	Typography,
} from "@mui/material";
import NumericField from "components/shared/Inputs/NumericField";
import { translate } from "i18n/i18n";
import { Measurement, Product, ProductImage, ProductType } from "models/product";

type CategoryOption = {
	id: number;
	name: string;
};

export type ProductFormPayload = {
	categoryId: number;
	name: string;
	sku: string;
	description?: string;
	barcode?: string;
	supplyPrice: number;
	salePrice: number;
	retailPrice: number;
	quantityInStock: number;
	lowStockThreshold: number;
	measurement: Measurement;
	type: ProductType;
	attachments?: File[];
	deletedImageIds?: number[];
};

export interface ProductFormModalProps {
	isOpen: boolean;
	product?: Product | null;
	categories: CategoryOption[];
	onClose: () => void;
	onSave: (payload: ProductFormPayload) => void;
}

const MEASUREMENTS: Measurement[] = ["Gram", "Kilogram", "Ton", "Piece", "Box", "Unit", "None"];
const TYPES: ProductType[] = ["All", "Sale", "Supply"];

// trim trailing slashes from base, leading from path
const IMAGE_BASE_URL = process.env.REACT_APP_OMBOR_API_BASE_URL ?? "";
function getFullUrl(path?: string): string | undefined {
	if (!path) return undefined;
	const base = IMAGE_BASE_URL.replace(/\/+$/, "");
	const p = path.replace(/^\/+/, "");
	return `${base}/${p}`;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
	isOpen,
	product,
	categories,
	onClose,
	onSave,
}) => {
	// form fields
	const [name, setName] = useState("");
	const [categoryId, setCategoryId] = useState(0);
	const [measurement, setMeasurement] = useState<Measurement>("None");
	const [sku, setSku] = useState("");
	const [barcode, setBarcode] = useState("");
	const [supplyPrice, setSupplyPrice] = useState(0);
	const [salePrice, setSalePrice] = useState(0);
	const [retailPrice, setRetailPrice] = useState(0);
	const [type, setType] = useState<ProductType>("All");
	const [quantityInStock, setQuantityInStock] = useState(0);
	const [lowStockThreshold, setLowStockThreshold] = useState(0);
	const [description, setDescription] = useState("");

	// attachments
	const [attachments, setAttachments] = useState<File[]>([]);
	const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
	const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);

	// initialize on open
	useEffect(() => {
		if (!isOpen) return;
		setName(product?.name ?? "");
		setCategoryId(product?.categoryId ?? categories[0]?.id ?? 0);
		setMeasurement(product?.measurement ?? "None");
		setSku(product?.sku ?? "");
		setBarcode(product?.barcode ?? "");
		setSupplyPrice(product?.supplyPrice ?? 0);
		setSalePrice(product?.salePrice ?? 0);
		setRetailPrice(product?.retailPrice ?? 0);
		setType(product?.type ?? "All");
		setQuantityInStock(product?.quantityInStock ?? 0);
		setLowStockThreshold(product?.lowStockThreshold ?? 0);
		setDescription(product?.description ?? "");
		setAttachments([]);
		setExistingImages(product?.images ?? []);
		setDeletedImageIds([]);
	}, [isOpen, product, categories]);

	// clear dependent prices
	useEffect(() => {
		if (type === "Sale") setSupplyPrice(0);
		if (type === "Supply") {
			setSalePrice(0);
			setRetailPrice(0);
		}
	}, [type]);

	const onGenerateSku = useCallback(() => {
		setSku(Math.random().toString(36).substring(2, 8).toUpperCase());
	}, []);

	const handleAttachmentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files) return;
		const files = Array.from(e.target.files).filter((f) => f.type.startsWith("image/"));
		if (files.length < e.target.files.length) {
			alert("Only image files are allowed.");
		}
		setAttachments((prev) => [...prev, ...files]);
	};

	const handleRemoveExisting = (id: number) => {
		setExistingImages((prev) => prev.filter((img) => img.id !== id));
		setDeletedImageIds((prev) => [...prev, id]);
	};

	const handleRemoveNew = (idx: number) =>
		setAttachments((prev) => prev.filter((_, i) => i !== idx));

	const handleSave = () => {
		onSave({
			categoryId,
			name: name.trim(),
			sku: sku.trim(),
			description: description.trim() || undefined,
			barcode: barcode.trim() || undefined,
			supplyPrice,
			salePrice,
			retailPrice,
			quantityInStock,
			lowStockThreshold,
			measurement,
			type,
			attachments: attachments.length ? attachments : [],
			deletedImageIds: deletedImageIds.length ? deletedImageIds : [],
		});
	};

	const titleKey = product ? "updateProductTitle" : "createProductTitle";

	return (
		<Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="md">
			<DialogTitle sx={{ m: 0, p: 2 }}>
				{translate(titleKey)}
				<IconButton
					aria-label="close"
					onClick={onClose}
					sx={{ position: "absolute", right: 8, top: 8 }}
				>
					<CloseIcon />
				</IconButton>
			</DialogTitle>
			<DialogContent dividers>
				<Grid container rowSpacing={4} columnSpacing={{ xs: 2, sm: 3 }}>
					{/* 1. Name */}
					<Grid size={{ xs: 12, sm: 4 }}>
						<TextField
							label={translate("fieldName")}
							value={name}
							onChange={(e) => setName(e.target.value)}
							fullWidth
						/>
					</Grid>
					{/* 2. Category */}
					<Grid size={{ xs: 12, sm: 4 }}>
						<FormControl fullWidth>
							<InputLabel>{translate("fieldCategory")}</InputLabel>
							<Select<number>
								value={categoryId}
								label={translate("fieldCategory")}
								onChange={(e) => setCategoryId(Number(e.target.value))}
								MenuProps={{ PaperProps: { style: { maxHeight: 250 } } }}
							>
								{categories.map((c) => (
									<MenuItem key={c.id} value={c.id}>
										{c.name}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</Grid>
					{/* 3. Measurement */}
					<Grid size={{ xs: 12, sm: 4 }}>
						<FormControl fullWidth>
							<InputLabel>{translate("fieldMeasurement")}</InputLabel>
							<Select<Measurement>
								value={measurement}
								label={translate("fieldMeasurement")}
								onChange={(e) => setMeasurement(e.target.value as Measurement)}
							>
								{MEASUREMENTS.map((m) => (
									<MenuItem key={m} value={m}>
										{translate(`measurement.${m}`)}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</Grid>
					{/* 4. SKU */}
					<Grid size={{ xs: 12, sm: 6 }}>
						<TextField
							label={translate("fieldSku")}
							value={sku}
							onChange={(e) => setSku(e.target.value)}
							fullWidth
							slotProps={{
								input: {
									endAdornment: (
										<InputAdornment position="end">
											<IconButton onClick={onGenerateSku} size="small">
												<AutorenewIcon fontSize="small" />
											</IconButton>
										</InputAdornment>
									),
								},
							}}
						/>
					</Grid>
					{/* 5. Barcode */}
					<Grid size={{ xs: 12, sm: 6 }}>
						<TextField
							label={translate("fieldBarcode")}
							value={barcode}
							onChange={(e) => setBarcode(e.target.value)}
							fullWidth
						/>
					</Grid>
					{/* 6. Type */}
					<Grid size={{ xs: 12, sm: 3 }}>
						<FormControl fullWidth>
							<InputLabel>{translate("fieldType")}</InputLabel>
							<Select<ProductType>
								value={type}
								label={translate("fieldType")}
								onChange={(e) => setType(e.target.value as ProductType)}
							>
								{TYPES.map((t) => (
									<MenuItem key={t} value={t}>
										{translate(`type.${t}`)}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</Grid>
					{/* 7. Supply Price */}
					<Grid size={{ xs: 12, sm: 3 }}>
						<NumericField
							label={translate("fieldSupplyPrice")}
							value={supplyPrice}
							onChange={(e) => setSupplyPrice(+e.target.value)}
							disabled={type === "Sale"}
						/>
					</Grid>
					{/* 8. Sale Price */}
					<Grid size={{ xs: 12, sm: 3 }}>
						<NumericField
							label={translate("fieldSalePrice")}
							value={salePrice}
							onChange={(e) => setSalePrice(+e.target.value)}
							disabled={type === "Supply"}
						/>
					</Grid>
					{/* 9. Retail Price */}
					<Grid size={{ xs: 12, sm: 3 }}>
						<NumericField
							label={translate("fieldRetailPrice")}
							value={retailPrice}
							onChange={(e) => setRetailPrice(+e.target.value)}
							disabled={type === "Supply"}
						/>
					</Grid>
					{/* 10. Quantity In Stock */}
					<Grid size={{ xs: 12, sm: 6 }}>
						<NumericField
							label={translate("fieldQuantityInStock")}
							value={quantityInStock}
							onChange={(e) => setQuantityInStock(+e.target.value)}
						/>
					</Grid>
					{/* 11. Low Stock Threshold */}
					<Grid size={{ xs: 12, sm: 6 }}>
						<NumericField
							label={translate("fieldLowStockThreshold")}
							value={lowStockThreshold}
							onChange={(e) => setLowStockThreshold(+e.target.value)}
						/>
					</Grid>
					{/* 12. Description */}
					<Grid size={12}>
						<TextField
							label={translate("fieldDescription")}
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							fullWidth
							multiline
							minRows={3}
						/>
					</Grid>

					{/* 13. Existing Images (above attachments) */}
					{existingImages.length > 0 && (
						<Grid container size={12} columnSpacing={2} alignItems="center">
							<Grid size={12}>
								<Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
									{existingImages.map((img) => (
										<Box key={img.id} sx={{ position: "relative" }}>
											<Box
												component="img"
												src={getFullUrl(img.thumbnailUrl ?? img.originalUrl)}
												alt={img.name}
												sx={{ width: 80, height: 80, objectFit: "cover", borderRadius: 1 }}
											/>
											<IconButton
												size="small"
												onClick={() => handleRemoveExisting(img.id)}
												sx={{
													position: "absolute",
													top: -8,
													right: -8,
													bgcolor: "background.paper",
												}}
											>
												<CloseIcon fontSize="small" color="error" />
											</IconButton>
										</Box>
									))}
								</Box>
							</Grid>
						</Grid>
					)}

					{/* 14. Attachments */}
					<Grid container size={12} columnSpacing={2} alignItems="flex-start">
						<Grid size={{ xs: 12, sm: 4 }}>
							<Button variant="outlined" startIcon={<UploadFileIcon />} component="label" fullWidth>
								{translate("fieldAttachments")}
								<input
									type="file"
									hidden
									multiple
									onChange={handleAttachmentsChange}
									accept="image/*"
								/>
							</Button>
						</Grid>
						<Grid size={{ xs: 12, sm: 8 }}>
							<Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
								{attachments.map((file, idx) => (
									<Box
										key={`${file.name}-${idx}`}
										sx={{ display: "flex", alignItems: "center", gap: 1 }}
									>
										<Typography noWrap>{file.name}</Typography>
										<IconButton size="small" onClick={() => handleRemoveNew(idx)}>
											<CloseIcon fontSize="small" color="error" />
										</IconButton>
									</Box>
								))}
							</Box>
						</Grid>
					</Grid>
				</Grid>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>{translate("cancel")}</Button>
				<Button onClick={handleSave} variant="contained" color="primary">
					{product ? translate("update") : translate("create")}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default ProductFormModal;
