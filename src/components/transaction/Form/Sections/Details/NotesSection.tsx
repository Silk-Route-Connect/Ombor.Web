import React from "react";
import { useTranslation } from "react-i18next";
import AttachmentPicker from "components/shared/AttachmentPicker/AttachmentPicker";
import { TransactionFormType } from "hooks/transactions/useCreateTransactionForm";

import { Grid, TextField } from "@mui/material";

interface Props {
	form: TransactionFormType;
}

const NotesSection: React.FC<Props> = ({ form }) => {
	const { t } = useTranslation();

	return (
		<Grid container spacing={1} sx={{ minHeight: 50 /* reserve space */ }}>
			<Grid size={{ xs: 12 }}>
				<TextField
					multiline
					minRows={3}
					fullWidth
					label={t("payment.notes")}
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
};

export default NotesSection;
