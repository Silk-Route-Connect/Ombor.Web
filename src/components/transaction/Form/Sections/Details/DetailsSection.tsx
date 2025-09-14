import React from "react";
import PartnerAutocomplete from "components/partner/Autocomplete/PartnerAutocomplete";
import TemplateAutocomplete from "components/template/Autocomplete/TemplateAutocomplete";
import { TransactionFormType } from "hooks/transactions/useCreateTransactionForm";
import { observer } from "mobx-react-lite";

import { Grid, Stack } from "@mui/material";

import { TransactionFormMode } from "../../TransactionForm";

interface DetailsSectionProps {
	form: TransactionFormType;
	mode: TransactionFormMode;
}

const DetailsSection: React.FC<DetailsSectionProps> = observer(({ form, mode }) => (
	<Stack spacing={2}>
		<Grid container spacing={2}>
			<Grid size={{ xs: 12, sm: 6 }}>
				<PartnerAutocomplete
					type={mode === "Sale" ? "Customer" : "Supplier"}
					value={form.selectedPartner}
					onChange={form.setSelectedPartner}
					size="small"
				/>
			</Grid>

			<Grid size={{ xs: 12, sm: 6 }}>
				<TemplateAutocomplete
					size="small"
					type={mode}
					partner={form.selectedPartner}
					value={form.selectedTemplate}
					onChange={form.setSelectedTemplate}
				/>
			</Grid>
		</Grid>
	</Stack>
));

export default DetailsSection;
