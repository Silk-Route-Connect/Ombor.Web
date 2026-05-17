import React from "react";
import ProductAutocomplete from "components/product/Autocomplete/ProductAutocomplete";
import NumericField from "components/shared/Inputs/NumericField";
import { UseStockTransferFormResult } from "hooks/warehouse/useStockTransferForm";
import { translate } from "i18n/i18n";
import { Warehouse } from "models/warehouse";

import DeleteIcon from "@mui/icons-material/Delete";
import {
	Box,
	FormControl,
	Grid,
	IconButton,
	InputLabel,
	MenuItem,
	Select,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	TextField,
	Typography,
} from "@mui/material";

interface TransferStockFieldsProps {
	form: UseStockTransferFormResult;
	warehouses: Warehouse[];
	canChangeSourceWarehouse: boolean;
}

const TransferStockFields: React.FC<TransferStockFieldsProps> = ({
	form,
	warehouses,
	canChangeSourceWarehouse,
}) => {
	const { register } = form.form;

	const availableProductIds = new Set(form.sourceProducts.map((sp) => sp.productId));
	const selectedProductIds = new Set(form.items.map((item) => item.productId));

	console.log(form.items);

	return (
		<Grid container rowSpacing={2} columnSpacing={2}>
			<Grid size={{ xs: 12, sm: 6 }}>
				<FormControl fullWidth required>
					<InputLabel>{translate("warehouse.transferStock.from")}</InputLabel>
					<Select
						value={form.fromWarehouseId || ""}
						onChange={(e) => form.setFromWarehouseId(+e.target.value)}
						label={translate("warehouse.transferStock.from")}
						readOnly={!canChangeSourceWarehouse}
					>
						{warehouses
							.filter((w) => w.isActive)
							.map((w) => (
								<MenuItem key={w.id} value={w.id}>
									{w.name}
								</MenuItem>
							))}
					</Select>
				</FormControl>
			</Grid>

			<Grid size={{ xs: 12, sm: 6 }}>
				<FormControl fullWidth required>
					<InputLabel>{translate("warehouse.transferStock.to")}</InputLabel>
					<Select
						value={form.toWarehouseId || ""}
						onChange={(e) => form.setToWarehouseId(+e.target.value)}
						label={translate("warehouse.transferStock.to")}
						disabled={!form.fromWarehouseId}
					>
						{warehouses
							.filter((w) => w.isActive && w.id !== form.fromWarehouseId)
							.map((w) => (
								<MenuItem key={w.id} value={w.id}>
									{w.name}
								</MenuItem>
							))}
					</Select>
				</FormControl>
			</Grid>

			<Grid size={{ xs: 12 }}>
				<ProductAutocomplete
					value={null}
					type="All"
					onChange={(product) => {
						if (product) {
							form.addProduct(product.id);
						}
					}}
				/>
				{form.fromWarehouseId > 0 && form.toWarehouseId > 0 && (
					<Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
						{translate("warehouse.transferStock.selectProductHint")}
					</Typography>
				)}
			</Grid>

			<Grid size={{ xs: 12 }}>
				<Box
					sx={{
						height: 300,
						overflowY: "auto",
						overflowX: "auto",
						border: 1,
						borderColor: "divider",
						borderRadius: 1,
					}}
				>
					{form.items.length === 0 ? (
						<Box p={3} textAlign="center" color="text.secondary">
							{translate("warehouse.transferStock.noItems")}
						</Box>
					) : (
						<Table size="small" stickyHeader sx={{ tableLayout: "fixed", width: "100%" }}>
							<TableHead>
								<TableRow>
									<TableCell sx={{ width: "30%" }}>
										{translate("warehouse.transferStock.product")}
									</TableCell>
									<TableCell align="right" sx={{ width: "15%" }}>
										{translate("warehouse.transferStock.available")}
									</TableCell>
									<TableCell align="right" sx={{ width: "15%" }}>
										{translate("warehouse.transferStock.transfer")}
									</TableCell>
									<TableCell align="right" sx={{ width: "25%" }}>
										{translate("warehouse.transferStock.result")}
									</TableCell>
									<TableCell sx={{ width: "5%" }} />
								</TableRow>
							</TableHead>
							<TableBody>
								{form.items.map((item, index) => (
									<TableRow key={item.productId}>
										<TableCell>
											{item.productName}
											<Typography variant="caption" display="block" color="text.secondary">
												{item.productSku}
											</Typography>
										</TableCell>
										<TableCell align="right">{item.availableQuantity}</TableCell>
										<TableCell align="right">
											<NumericField
												value={item.quantity}
												size="small"
												sx={{ maxWidth: 100 }}
												onChange={(e) => {
													const value = +e.target.value;
													const cappedValue = Math.min(value, item.availableQuantity);
													form.updateTransferQuantity(index, cappedValue);
												}}
											/>
										</TableCell>
										<TableCell align="right">
											<Typography variant="body2">
												{translate("stockTransfer.result.source")}:{" "}
												{item.availableQuantity - item.quantity}
											</Typography>
											<Typography variant="body2">
												{translate("stockTransfer.result.destination")}:{" "}
												{item.destinationCurrentStock + item.quantity}
											</Typography>
										</TableCell>
										<TableCell>
											<IconButton size="small" color="error" onClick={() => form.removeItem(index)}>
												<DeleteIcon fontSize="small" />
											</IconButton>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</Box>
			</Grid>

			<Grid size={{ xs: 12 }}>
				<TextField
					label={translate("warehouse.transferStock.notes")}
					{...register("notes")}
					fullWidth
					multiline
					rows={2}
					placeholder={translate("warehouse.transferStock.notesPlaceholder")}
				/>
			</Grid>
		</Grid>
	);
};

export default TransferStockFields;
