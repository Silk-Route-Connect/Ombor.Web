import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import AttachmentPicker from "components/shared/AttachmentPicker/AttachmentPicker";
import FormField from "components/shared/Forms/FormField";
import { TransactionDirection } from "utils/transactionUtils";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { Box, ButtonBase, TextField } from "@mui/material";

import { POS_CARD_PADDING, posCardSx } from "./posStyles";

interface PosNotesProps {
	direction: TransactionDirection;
	notes: string;
	onNotesChange: (notes: string) => void;
	attachments: File[];
	onAddFiles: (files: FileList) => void;
	onRemoveFile: (index: number) => void;
}

/** «Примечание и вложения» — collapsed under the cart until needed. */
export const PosNotes: React.FC<PosNotesProps> = ({
	direction,
	notes,
	onNotesChange,
	attachments,
	onAddFiles,
	onRemoveFile,
}) => {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);

	return (
		<Box>
			<ButtonBase
				onClick={() => setOpen((o) => !o)}
				aria-expanded={open}
				sx={{
					gap: "8px",
					fontSize: 13,
					fontWeight: 600,
					color: "primary.main",
					p: "4px 2px",
					"& .MuiSvgIcon-root": { fontSize: 18 },
				}}
			>
				{open ? <ExpandMoreIcon /> : <KeyboardArrowRightIcon />}
				{t("transaction.new.notes.toggle")}
			</ButtonBase>
			{open && (
				<Box
					sx={{
						...posCardSx,
						mt: "8px",
						p: POS_CARD_PADDING,
						display: "flex",
						flexDirection: "column",
						gap: "16px",
					}}
				>
					<FormField label={t("transaction.new.notes.label")}>
						<TextField
							value={notes}
							onChange={(e) => onNotesChange(e.target.value)}
							placeholder={t(`transaction.new.notes.placeholder.${direction}`)}
							multiline
							minRows={3}
							fullWidth
						/>
					</FormField>
					<AttachmentPicker files={attachments} onAdd={onAddFiles} onRemove={onRemoveFile} />
				</Box>
			)}
		</Box>
	);
};

export default PosNotes;
