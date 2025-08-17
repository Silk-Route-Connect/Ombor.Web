import React from "react";
import { Typography } from "@mui/material";
import AttachmentPicker from "components/shared/AttachmentPicker/AttachmentPicker";

export interface ProductAttachmentsFieldProps {
	attachments: File[];
	disabled: boolean;
	errorMessage?: string;
	addAttachments: (files: FileList) => void;
	removeAttachment: (index: number) => void;
}

export const ProductAttachmentsField: React.FC<ProductAttachmentsFieldProps> = ({
	attachments,
	disabled,
	errorMessage,
	addAttachments,
	removeAttachment,
}) => {
	return (
		<>
			<AttachmentPicker
				files={attachments}
				disabled={disabled}
				onAdd={addAttachments}
				onRemove={removeAttachment}
			/>
			{errorMessage && (
				<Typography variant="caption" color="error" sx={{ display: "block", mt: 0.5 }}>
					{errorMessage}
				</Typography>
			)}
		</>
	);
};
