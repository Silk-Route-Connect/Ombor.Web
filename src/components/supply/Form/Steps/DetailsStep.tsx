import React from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { Box, Button, Grid, IconButton, TextField } from "@mui/material";
import PartnerAutocomplete from "components/shared/Autocomplete/PartnerAutocomplete";
import ProductAutocomplete from "components/shared/Autocomplete/ProductAutocomplete";
import TemplateAutocomplete from "components/shared/Autocomplete/TemplateAutocomplete";
import NumericField from "components/shared/Inputs/NumericField";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import { IPartnerStore } from "stores/PartnerStore";
import { IProductStore } from "stores/ProductStore";

import { SupplyFormState } from "../useSupplyForm";

interface Props {
	form: SupplyFormState;
	productStore: IProductStore;
	partnersStore: IPartnerStore;
}

const LIST_HEIGHT = 300;

const DetailsStep: React.FC<Props> = observer(({ form, productStore, partnersStore }) => (
	<Grid container rowSpacing={3} columnSpacing={2}>
		<Grid container columnSpacing={2} size={{ xs: 12 }}>
			<Grid size={{ xs: 12, sm: 4 }}>
				<PartnerAutocomplete
					value={
						partnersStore.allSuppliers === "loading"
							? null
							: (partnersStore.allSuppliers.find((s) => s.id === form.supplierId) ?? null)
					}
					onChange={(s) => form.setSupplierId(s?.id ?? null)}
				/>
			</Grid>

			<Grid size={{ xs: 12, sm: 4 }}>
				<TextField
					label={translate("fieldDate")}
					type="date"
					fullWidth
					value={form.date.toISOString().substring(0, 10)}
					onChange={(e) => form.setDate(new Date(e.target.value))}
					slotProps={{ inputLabel: { shrink: true } }}
				/>
			</Grid>

			<Grid size={{ xs: 12, sm: 4 }}>
				<TemplateAutocomplete value={form.template} onChange={form.setTemplate} />
			</Grid>
		</Grid>

		<Grid container columnSpacing={2} alignItems="flex-end" size={{ xs: 12 }}>
			<Grid size={{ xs: 12, sm: 8 }}>
				<ProductAutocomplete
					type="Supply"
					value={
						form.productToAdd && productStore.allProducts !== "loading"
							? (productStore.allProducts.find((p) => p.id === form.productToAdd) ?? null)
							: null
					}
					onChange={(p) => form.setProductToAdd(p?.id ?? null)}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							console.log("clicked");
							e.preventDefault();
							form.addProduct();
						}
					}}
				/>
			</Grid>

			<Grid size={{ xs: 12, sm: 4 }}>
				<Button
					fullWidth
					variant="contained"
					startIcon={<AddIcon />}
					onClick={form.addProduct}
					sx={{ height: 56 }}
					disabled={!form.productToAdd}
				>
					{translate("add")}
				</Button>
			</Grid>
		</Grid>

		<Grid size={{ xs: 12 }}>
			<Box
				mt={2}
				sx={{
					height: LIST_HEIGHT,
					overflowY: "auto",
					border: 1,
					borderColor: "divider",
					borderRadius: 1,
					p: 1,
				}}
			>
				{form.items.length === 0 ? (
					<Box color="text.secondary">{translate("noItems")}</Box>
				) : (
					<Grid container rowSpacing={2}>
						{" "}
						{form.items.map((it, idx) => (
							<Grid container key={`${it.productId}-${idx}`} columnSpacing={1} alignItems="center">
								<Grid size={{ xs: 12, sm: 4 }}>
									<TextField
										value={it.productName}
										fullWidth
										disabled
										label={translate("fieldProduct")}
									/>
								</Grid>

								<Grid size={{ xs: 12, sm: 3 }}>
									<NumericField
										value={it.unitPrice}
										onChange={(e) => form.updateItem(idx, { unitPrice: +e.target.value })}
										label={translate("fieldUnitPrice")}
									/>
								</Grid>

								<Grid size={{ xs: 12, sm: 2 }}>
									<NumericField
										value={it.quantity}
										onChange={(e) => form.updateItem(idx, { quantity: +e.target.value })}
										label={translate("fieldQuantity")}
									/>
								</Grid>

								<Grid size={{ xs: 12, sm: 2 }}>
									<NumericField
										value={it.discount ?? 0}
										onChange={(e) => form.updateItem(idx, { discount: +e.target.value })}
										label={translate("fieldDiscount")}
									/>
								</Grid>

								<Grid size={{ xs: 12, sm: 1 }}>
									<IconButton onClick={() => form.removeItem(idx)} color="error">
										<DeleteIcon />
									</IconButton>
								</Grid>
							</Grid>
						))}
					</Grid>
				)}
			</Box>
		</Grid>
	</Grid>
));

export default DetailsStep;
