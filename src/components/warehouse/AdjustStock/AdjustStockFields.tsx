import React from "react";
import ProductAutocomplete from "components/product/Autocomplete/ProductAutocomplete";
import NumericField from "components/shared/Inputs/NumericField";
import { UseAdjustStockFormResult } from "hooks/warehouse/useAdjustStockForm";
import { translate } from "i18n/i18n";

import {
	Box,
	Grid,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	TextField,
} from "@mui/material";

interface AdjustStockFieldsProps {
	form: UseAdjustStockFormResult;
}

const AdjustStockFields: React.FC<AdjustStockFieldsProps> = ({ form }) => {
	const {
		register,
		formState: { errors },
	} = form.form;

	const filteredItems = form.searchTerm.trim()
		? form.items.filter((item) =>
				item.productName.toLowerCase().includes(form.searchTerm.toLowerCase()),
			)
		: form.items;

	return (
		<Grid container rowSpacing={2} columnSpacing={2}>
			<Grid size={{ xs: 12, sm: 8 }}>
				<ProductAutocomplete
					value={null}
					type="Sale"
					onChange={(product) => {
						if (product) {
							form.addProduct(product);
						}
					}}
				/>
			</Grid>

			<Grid size={{ xs: 12, sm: 4 }}>
				<TextField
					label={translate("warehouse.adjustStock.search")}
					value={form.searchTerm}
					onChange={(e) => form.setSearchTerm(e.target.value)}
					fullWidth
					placeholder={translate("warehouse.adjustStock.searchPlaceholder")}
				/>
			</Grid>

			<Grid size={{ xs: 12 }}>
				<Box
					sx={{
						height: 300,
						overflowY: "auto",
						border: 1,
						borderColor: "divider",
						borderRadius: 1,
					}}
				>
					{filteredItems.length === 0 ? (
						<Box p={3} textAlign="center" color="text.secondary">
							{translate("warehouse.adjustStock.noItems")}
						</Box>
					) : (
						<Table size="small" stickyHeader>
							<TableHead>
								<TableRow>
									<TableCell>{translate("warehouse.adjustStock.product")}</TableCell>
									<TableCell align="right">
										{translate("warehouse.adjustStock.currentStock")}
									</TableCell>
									<TableCell align="right">{translate("warehouse.adjustStock.newStock")}</TableCell>
									<TableCell align="right">
										{translate("warehouse.adjustStock.lowStockThreshold")}
									</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{filteredItems.map((item, index) => (
									<TableRow key={item.productId}>
										<TableCell width="32%">{item.productName}</TableCell>
										<TableCell align="right" width="18%">
											{item.currentQuantity}
										</TableCell>
										<TableCell align="right" width="25%">
											<NumericField
												value={item.newQuantity}
												size="small"
												onChange={(e) => form.updateItem(index, { newQuantity: +e.target.value })}
											/>
										</TableCell>
										<TableCell align="right" width="25%">
											<NumericField
												value={item.lowStockThreshold ?? 0}
												size="small"
												onChange={(e) =>
													form.updateItem(index, { lowStockThreshold: +e.target.value })
												}
											/>
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
					label={translate("warehouse.adjustStock.notes")}
					{...register("notes")}
					error={!!errors.notes}
					helperText={errors.notes?.message}
					fullWidth
					required
					multiline
					rows={3}
					placeholder={translate("warehouse.adjustStock.notesPlaceholder")}
				/>
			</Grid>
		</Grid>
	);
};

export default AdjustStockFields;
