import React from "react";
import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Grid, TextField, Typography } from "@mui/material";
import PartnerAutocomplete from "components/shared/Autocomplete/PartnerAutocomplete";
import ProductAutocomplete from "components/shared/Autocomplete/ProductAutocomplete";
import TemplateAutocomplete from "components/shared/Autocomplete/TemplateAutocomplete";
import { TransactionFormMode, TransactionFormState } from "hooks/transactions/useTransactionForm";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";

import { LineList } from "../LineList/LineList";

interface TransactionFormDetailsProps {
	mode: TransactionFormMode;
	form: TransactionFormState;
}

const LIST_HEIGHT = 300;

const TransactionFormDetails: React.FC<TransactionFormDetailsProps> = observer(({ form }) => (
	<Grid container rowSpacing={3} columnSpacing={2}>
		<Grid container columnSpacing={2} size={{ xs: 12 }}>
			<Grid size={{ xs: 12, sm: 4 }}>
				<PartnerAutocomplete
					type={form.mode === "Supply" ? "Supplier" : "Customer"}
					value={form.partner}
					onChange={(value) => form.setPartnerId(value?.id ?? null)}
				/>
			</Grid>

			<Grid size={{ xs: 12, sm: 4 }}>
				<TextField
					label={translate("transaction.date")}
					type="date"
					fullWidth
					value={form.date.toISOString().substring(0, 10)}
					onChange={(e) => form.setDate(new Date(e.target.value))}
					slotProps={{ inputLabel: { shrink: true } }}
				/>
			</Grid>

			<Grid size={{ xs: 12, sm: 4 }}>
				<TemplateAutocomplete
					value={form.template}
					onChange={(value) => form.setTemplateId(value?.id ?? null)}
				/>
			</Grid>
		</Grid>

		<Grid container columnSpacing={2} alignItems="flex-end" size={{ xs: 12 }}>
			<Grid size={{ xs: 12, sm: 8 }}>
				<ProductAutocomplete
					type={form.mode === "Supply" ? "Supply" : "Sale"}
					value={form.selectedProduct}
					onChange={(p) => form.setSelectedProductId(p?.id ?? null)}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							e.preventDefault();
							form.addLine();
						}
					}}
				/>
			</Grid>

			<Grid size={{ xs: 12, sm: 4 }}>
				<Button
					fullWidth
					variant="contained"
					startIcon={<AddIcon />}
					onClick={form.addLine}
					sx={{ height: 56 }}
					disabled={!form.selectedProductId}
				>
					{translate("add")}
				</Button>
			</Grid>
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
				<LineList data={form.lines} onUpdate={form.updateLine} onRemove={form.removeLine} />
			</Box>
		</Grid>
		<Grid size={{ xs: 12 }}>
			<Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
				{translate("transaction.total")}: {form.totalDue.toLocaleString()}
			</Typography>
		</Grid>
	</Grid>
));

export default TransactionFormDetails;
