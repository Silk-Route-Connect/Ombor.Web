import React from "react";
import AttachmentPicker from "components/shared/AttachmentPicker/AttachmentPicker";
import { TransactionFormType } from "hooks/transactions/useCreateTransactionForm";
import { translate } from "i18n/i18n";

import { Grid, TextField } from "@mui/material";

interface Props {
	form: TransactionFormType;
}

const NotesSection: React.FC<Props> = ({ form }) => (
	<Grid container spacing={1} sx={{ minHeight: 50 /* reserve space */ }}>
		<Grid size={{ xs: 12 }}>
			<TextField
				multiline
				minRows={3}
				fullWidth
				label={translate("payment.notes")}
				value={form.notes}
				onChange={(e) => form.setNotes(e.target.value)}
			/>
		</Grid>

		<Grid size={{ xs: 12 }}>
			<AttachmentPicker
				listHeight={80}
				files={form.attachments}
				onAdd={form.addAttachments}
				onRemove={form.removeAttachment}
			/>
		</Grid>
	</Grid>
);

export default NotesSection;
