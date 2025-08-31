import React, { useRef } from "react";
import AddIcon from "@mui/icons-material/Add";
import { Box, Button, FormControl, Grid, TextField, Typography } from "@mui/material";
import PartnerAutocomplete from "components/partner/Autocomplete/PartnerAutocomplete";
import ProductAutocomplete from "components/product/Autocomplete/ProductAutocomplete";
import { UseTemplateFormResult } from "hooks/templates/useTemplateForm";
import { translate } from "i18n/i18n";

import TemplateTypeSelect from "../Select/TemplateTypeSelect";
import { ItemsList } from "./ItemsList.tsx/ItemsList";

const LIST_HEIGHT = 300;

interface TemplateFormFieldsProps {
	form: UseTemplateFormResult;
}

const TemplateFormFields: React.FC<TemplateFormFieldsProps> = ({ form }) => {
	const {
		register,
		formState: { errors },
	} = form.form;

	const unitPriceRefs = useRef<(HTMLInputElement | null)[]>([]);
	const productAutocompleteRef = useRef<HTMLInputElement | null>(null);

	const handleAddItem = () => {
		const lastItemIndex = form.items.length;
		const existingIndex = form.items.findIndex((i) => i.productId === form.selectedProduct?.id);
		const focusIndex = existingIndex >= 0 ? existingIndex : lastItemIndex;

		form.addItem();

		queueMicrotask(() => {
			unitPriceRefs.current[focusIndex]?.focus();
		});
	};

	return (
		<Grid container rowSpacing={2} columnSpacing={2}>
			<Grid size={{ xs: 12, sm: 4 }}>
				<TextField
					label={translate("templateFieldName")}
					{...register("name")}
					error={!!errors.name}
					helperText={errors.name?.message}
					fullWidth
					slotProps={{
						input: { "aria-label": translate("templateFieldName") },
					}}
				/>
			</Grid>

			<Grid size={{ xs: 12, sm: 4 }}>
				<FormControl fullWidth>
					<TemplateTypeSelect type={form.templateType} onTypeChange={form.setTemplateType} />
				</FormControl>
			</Grid>

			<Grid size={{ xs: 12, sm: 4 }}>
				<PartnerAutocomplete
					value={form.selectedPartner}
					type={form.templateType === "Sale" ? "Customer" : "Supplier"}
					onChange={(p) => form.setPartnerId(p?.id ?? 0)}
				/>
			</Grid>

			<Grid size={{ xs: 12, sm: 8 }}>
				<ProductAutocomplete
					value={form.selectedProduct}
					type={form.form.getValues("type")}
					inputRef={productAutocompleteRef}
					onChange={form.setSelectedProduct}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							e.preventDefault();
							handleAddItem();
						}
					}}
				/>
			</Grid>

			<Grid size={{ xs: 12, sm: 4 }}>
				<Button
					fullWidth
					variant="contained"
					startIcon={<AddIcon />}
					onClick={handleAddItem}
					sx={{ height: 56 }}
					disabled={!form.selectedProduct}
				>
					{translate("add")}
				</Button>
			</Grid>

			<Grid size={{ xs: 12 }}>
				<Box
					sx={{
						height: LIST_HEIGHT,
						overflowY: "auto",
						border: 1,
						borderColor: "divider",
						borderRadius: 1,
						p: 1,
					}}
				>
					<ItemsList
						data={form.items}
						unitPriceRefs={unitPriceRefs}
						productAutocompleteRef={productAutocompleteRef}
						onUpdate={form.updateItem}
						onRemove={form.removeItem}
					/>
				</Box>
			</Grid>

			<Grid size={{ xs: 12 }}>
				<Typography variant="h6" color="text.secondary">
					{translate("transaction.total")}: {form.totalDue.toLocaleString()}
				</Typography>
				<Typography variant="h6" color="text.secondary">
					{translate("transaction.discount")}: {form.totalDiscount.toLocaleString()}
				</Typography>
			</Grid>
		</Grid>
	);
};

export default TemplateFormFields;
