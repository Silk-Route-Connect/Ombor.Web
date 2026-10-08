import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import GhostButton from "components/shared/Buttons/GhostButton";

import CloseIcon from "@mui/icons-material/Close";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { Box, Chip, Grid } from "@mui/material";

export interface AttachmentPickerProps {
	files: File[];
	/** The file list's maximum height before it scrolls; no space is kept while it is empty. */
	listHeight?: number;
	label?: string;
	disabled?: boolean;
	onAdd(files: FileList): void;
	onRemove(index: number): void;
}

const AttachmentPicker: React.FC<AttachmentPickerProps> = ({
	files,
	listHeight = 90,
	label,
	disabled = false,
	onAdd,
	onRemove,
}) => {
	const { t } = useTranslation();
	// A native button opening a hidden input, not a `<label>` button: ButtonBase
	// answers Enter / Space on a non-button root with its onClick only, so a
	// label-rendered button never opened the file dialog from the keyboard.
	const inputRef = useRef<HTMLInputElement>(null);

	return (
		<Grid container rowSpacing={0} columnSpacing={2}>
			<Grid size={{ xs: 12 }}>
				<GhostButton
					fullWidth
					icon={<UploadFileIcon />}
					disabled={disabled}
					onClick={() => inputRef.current?.click()}
				>
					{label ?? t("fieldAttachments")}
				</GhostButton>
				<input
					ref={inputRef}
					type="file"
					hidden
					multiple
					onChange={(e) => e.target.files && onAdd(e.target.files)}
				/>
			</Grid>

			{/* The list takes room only once there is a file — an empty band read as a broken form. */}
			{files.length > 0 && (
				<Grid size={{ xs: 12 }}>
					<Box
						display="flex"
						flexWrap="wrap"
						gap={1}
						sx={{
							maxHeight: listHeight,
							overflowY: "auto",
							mt: 1,
							pr: 1,
						}}
					>
						{files.map((f, idx) => (
							<Chip
								key={`${f.name}-${idx}`}
								label={f.name}
								onDelete={() => onRemove(idx)}
								deleteIcon={<CloseIcon />}
							/>
						))}
					</Box>
				</Grid>
			)}
		</Grid>
	);
};

export default AttachmentPicker;
