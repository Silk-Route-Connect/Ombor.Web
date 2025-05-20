import React, { useCallback, useEffect, useMemo, useState } from "react";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import CloseIcon from "@mui/icons-material/Close";
import { InputAdornment } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import { translate } from "i18n/i18n";
import { Measurement, Product } from "models/product";

import { CategoryOption } from "../Header/ProductHeader";

export type ProductFormPayload = {
	categoryId: number;
	name: string;
	sku: string;
	measurement: Measurement;
	description?: string;
	barcode?: string;
	supplyPrice: number;
	salePrice: number;
	retailPrice: number;
	quantityInStock: number;
	lowStockThreshold: number;
};

export interface ProductFormModalProps {
	isOpen: boolean;
	product?: Product | null;
	categories: CategoryOption[];
	onClose: () => void;
	onSave: (payload: ProductFormPayload) => void;
}

const MEASUREMENTS: Measurement[] = ["Gram", "Kilogram", "Ton", "Piece", "Box", "Unit", "None"];

const ProductFormModal: React.FC<ProductFormModalProps> = ({
	isOpen,
	product,
	categories,
	onClose,
	onSave,
}) => {
	const [categoryId, setCategoryId] = useState<number>(0);
	const [name, setName] = useState("");
	const [sku, setSku] = useState("");
	const [measurement, setMeasurement] = useState<Measurement>("None");
	const [barcode, setBarcode] = useState("");
	const [supplyPrice, setSupplyPrice] = useState<number>(0);
	const [salePrice, setSalePrice] = useState<number>(0);
	const [retailPrice, setRetailPrice] = useState<number>(0);
	const [quantityInStock, setQuantityInStock] = useState<number>(0);
	const [lowStockThreshold, setLowStockThreshold] = useState<number>(0);
	const [description, setDescription] = useState("");

	useEffect(() => {
		if (isOpen) {
			setCategoryId(product?.categoryId ?? categories[0]?.id ?? 0);
			setName(product?.name ?? "");
			setSku(product?.sku ?? "");
			setMeasurement(product?.measurement ?? "None");
			setBarcode(product?.barcode ?? "");
			setSupplyPrice(product?.supplyPrice ?? 0);
			setSalePrice(product?.salePrice ?? 0);
			setRetailPrice(product?.retailPrice ?? 0);
			setQuantityInStock(product?.quantityInStock ?? 0);
			setLowStockThreshold(product?.lowStockThreshold ?? 0);
			setDescription(product?.description ?? "");
		}
	}, [isOpen, product, categories]);

	const errors = useMemo(() => {
		const e: Record<string, string> = {};
		if (!name.trim()) {
			e.name = `${translate("fieldName")} is required`;
		}
		if (!sku.trim()) {
			e.sku = `${translate("fieldSku")} is required`;
		}
		if (!categoryId) {
			e.categoryId = `${translate("fieldCategory")} is required`;
		}
		if (supplyPrice < 0) {
			e.supplyPrice = "Supply price cannot be negative";
		}
		if (salePrice < 0) {
			e.salePrice = "Sale price cannot be negative";
		} else if (salePrice < supplyPrice) {
			e.salePrice = "Sale price must be ≥ supply price";
		}
		if (retailPrice < 0) {
			e.retailPrice = "Retail price cannot be negative";
		} else if (retailPrice < supplyPrice) {
			e.retailPrice = "Retail price must be ≥ supply price";
		}
		if (quantityInStock < 0) {
			e.quantityInStock = "Stock cannot be negative";
		}
		if (lowStockThreshold < 0) {
			e.lowStockThreshold = "Threshold cannot be negative";
		}
		return e;
	}, [
		name,
		sku,
		categoryId,
		supplyPrice,
		salePrice,
		retailPrice,
		quantityInStock,
		lowStockThreshold,
	]);

	const isValid = Object.keys(errors).length === 0;

	const handleSave = () => {
		if (!isValid) return;
		const payload: ProductFormPayload = {
			categoryId,
			name: name.trim(),
			sku: sku.trim(),
			measurement,
			description: description.trim() || undefined,
			barcode: barcode.trim() || undefined,
			supplyPrice,
			salePrice,
			retailPrice,
			quantityInStock,
			lowStockThreshold,
		};
		onSave(payload);
	};

	const titleKey = product ? "updateProductTitle" : "createProductTitle";

	function generateSku(): string {
		return Math.random().toString(36).substring(2, 10).toUpperCase();
	}

	const onGenerate = useCallback(() => {
		setSku(generateSku());
	}, [setSku]);

	return (
		<Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="md">
			<DialogTitle sx={{ m: 0, p: 2 }}>
				{translate(titleKey)}
				<IconButton
					aria-label="close"
					onClick={onClose}
					sx={{
						position: "absolute",
						right: 8,
						top: 8,
						color: (theme) => theme.palette.grey[500],
					}}
				>
					<CloseIcon />
				</IconButton>
			</DialogTitle>

			<DialogContent dividers>
				<Grid container rowSpacing={4} columnSpacing={{ xs: 2, sm: 3 }}>
					{/* Name */}
					<Grid size={{ xs: 12, sm: 4 }}>
						<TextField
							label={translate("fieldName")}
							value={name}
							onChange={(e) => setName(e.target.value)}
							fullWidth
						/>
					</Grid>

					{/* Category */}
					<Grid size={{ xs: 12, sm: 4 }}>
						<FormControl fullWidth error={!!errors.categoryId}>
							<InputLabel>{translate("fieldCategory")}</InputLabel>
							<Select<number>
								value={categoryId}
								label={translate("fieldCategory")}
								onChange={(e: SelectChangeEvent<number>) => setCategoryId(Number(e.target.value))}
								MenuProps={{ PaperProps: { style: { maxHeight: 250 } } }}
							>
								{categories.map((c) => (
									<MenuItem key={c.id} value={c.id}>
										{c.name}
									</MenuItem>
								))}
							</Select>
							<FormHelperText>{errors.categoryId}</FormHelperText>
						</FormControl>
					</Grid>

					{/* Measurement */}
					<Grid size={{ xs: 12, sm: 4 }}>
						<FormControl fullWidth>
							<InputLabel>{translate("fieldMeasurement")}</InputLabel>
							<Select<Measurement>
								value={measurement}
								label={translate("fieldMeasurement")}
								onChange={(e: SelectChangeEvent<Measurement>) =>
									setMeasurement(e.target.value as Measurement)
								}
							>
								{MEASUREMENTS.map((m) => (
									<MenuItem key={m} value={m}>
										{translate(`measurement.${m}`)}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</Grid>

					{/* SKU */}
					<Grid size={{ xs: 12, sm: 6 }}>
						<TextField
							label={translate("fieldSku")}
							name="sku"
							value={sku}
							onChange={(e) => setSku(e.target.value)}
							fullWidth
							// Inject an end-adornment into the underlying Input
							slotProps={{
								input: {
									endAdornment: (
										<InputAdornment position="end">
											<IconButton onClick={onGenerate} size="small" edge="end">
												<AutorenewIcon fontSize="small" />
											</IconButton>
										</InputAdornment>
									),
								},
							}}
						/>
					</Grid>

					{/* Barcode */}
					<Grid size={{ xs: 12, sm: 6 }}>
						<TextField
							label={translate("fieldBarcode")}
							value={barcode}
							onChange={(e) => setBarcode(e.target.value)}
							fullWidth
						/>
					</Grid>

					{/* Supply Price */}
					<Grid size={{ xs: 12, sm: 4 }}>
						<TextField
							label={translate("fieldSupplyPrice")}
							type="number"
							value={supplyPrice}
							onChange={(e) => setSupplyPrice(Number(e.target.value))}
							error={!!errors.supplyPrice}
							helperText={errors.supplyPrice}
							fullWidth
							slotProps={{
								input: {
									inputMode: "decimal",
									onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
										e.target.select();
									},
								},
							}}
						/>
					</Grid>

					{/* Sale Price */}
					<Grid size={{ xs: 12, sm: 4 }}>
						<TextField
							label={translate("fieldSalePrice")}
							type="number"
							value={salePrice}
							onChange={(e) => setSalePrice(Number(e.target.value))}
							fullWidth
							slotProps={{
								input: {
									inputMode: "decimal",
									onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
										e.target.select();
									},
								},
							}}
						/>
					</Grid>

					{/* Retail Price */}
					<Grid size={{ xs: 12, sm: 4 }}>
						<TextField
							label={translate("fieldRetailPrice")}
							type="number"
							value={retailPrice}
							onChange={(e) => setRetailPrice(Number(e.target.value))}
							fullWidth
							slotProps={{
								input: {
									inputMode: "decimal",
									onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
										e.target.select();
									},
								},
							}}
						/>
					</Grid>

					{/* Quantity In Stock */}
					<Grid size={{ xs: 12, sm: 6 }}>
						<TextField
							label={translate("fieldQuantityInStock")}
							type="number"
							value={quantityInStock}
							onChange={(e) => setQuantityInStock(Number(e.target.value))}
							fullWidth
						/>
					</Grid>

					{/* Low Stock Threshold */}
					<Grid size={{ xs: 12, sm: 6 }}>
						<TextField
							label={translate("fieldLowStockThreshold")}
							type="number"
							value={lowStockThreshold}
							onChange={(e) => setLowStockThreshold(Number(e.target.value))}
							fullWidth
						/>
					</Grid>

					{/* Description */}
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
				</Grid>
			</DialogContent>

			<DialogActions>
				<Button onClick={onClose}>{translate("cancel")}</Button>
				<Button onClick={handleSave} variant="contained" color="primary" disabled={!isValid}>
					{product ? translate("update") : translate("create")}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default ProductFormModal;
