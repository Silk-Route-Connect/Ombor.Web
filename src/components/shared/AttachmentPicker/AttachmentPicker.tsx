import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { Box, Button, Chip, Grid } from "@mui/material";
import { translate } from "i18n/i18n";

export interface AttachmentPickerProps {
	files: File[];
	listHeight?: number;
	label?: string;
	onAdd(files: FileList): void;
	onRemove(index: number): void;
}

const AttachmentPicker: React.FC<AttachmentPickerProps> = ({
	files,
	listHeight = 60,
	label = translate("fieldAttachments"),
	onAdd,
	onRemove,
}) => (
	<Grid container rowSpacing={0} columnSpacing={2}>
		<Grid size={{ xs: 12 }}>
			<Button fullWidth variant="outlined" startIcon={<UploadFileIcon />} component="label">
				{label}
				<input
					type="file"
					hidden
					multiple
					onChange={(e) => e.target.files && onAdd(e.target.files)}
				/>
			</Button>
		</Grid>

		<Grid size={{ xs: 12 }}>
			<Box
				display="flex"
				flexWrap="wrap"
				gap={1}
				sx={{
					height: listHeight,
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
	</Grid>
);

export default AttachmentPicker;
