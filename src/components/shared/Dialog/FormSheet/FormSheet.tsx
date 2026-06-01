import React from "react";
import SaveButton from "components/shared/Buttons/SaveButton";
import { translate } from "i18n/i18n";

import CloseIcon from "@mui/icons-material/Close";
import { Box, Button, Drawer, IconButton, LinearProgress, Typography } from "@mui/material";

interface FormSheetProps {
	open: boolean;
	title: string;
	subtitle?: string;
	isSaving: boolean;
	canSave: boolean;
	/** Drawer paper width in px. */
	width?: number;
	onClose: () => void;
	onSave: () => void;
	children: React.ReactNode;
}

const FormSheet: React.FC<FormSheetProps> = ({
	open,
	title,
	subtitle,
	isSaving,
	canSave,
	width = 520,
	onClose,
	onSave,
	children,
}) => (
	<Drawer
		anchor="right"
		open={open}
		onClose={(_, reason) => {
			if (isSaving && reason === "backdropClick") {
				return;
			}
			onClose();
		}}
		ModalProps={{ keepMounted: false }}
		sx={(theme) => ({
			zIndex: theme.zIndex.drawer + 2,
			"& .MuiDrawer-paper": {
				width: { xs: "100%", sm: width },
				maxWidth: "100%",
				boxSizing: "border-box",
				display: "flex",
				flexDirection: "column",
			},
		})}
	>
		{/* Header */}
		<Box
			sx={{
				display: "flex",
				alignItems: "flex-start",
				gap: 2,
				p: 2.5,
				borderBottom: 1,
				borderColor: "divider",
			}}
		>
			<Box sx={{ flexGrow: 1, minWidth: 0 }}>
				<Typography variant="h2">{title}</Typography>
				{subtitle && (
					<Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
						{subtitle}
					</Typography>
				)}
			</Box>
			<IconButton
				aria-label={translate("common.close")}
				onClick={onClose}
				disabled={isSaving}
				sx={{ mt: -0.5, mr: -0.5 }}
			>
				<CloseIcon />
			</IconButton>
		</Box>

		{isSaving && (
			<Box sx={{ position: "relative", height: 4 }}>
				<LinearProgress sx={{ position: "absolute", inset: 0 }} />
			</Box>
		)}

		{/* Body */}
		<Box sx={{ flex: 1, overflowY: "auto", p: 2.5 }}>{children}</Box>

		{/* Footer */}
		<Box
			sx={{
				display: "flex",
				justifyContent: "flex-end",
				gap: 1,
				p: 2,
				borderTop: 1,
				borderColor: "divider",
			}}
		>
			<Button onClick={onClose} disabled={isSaving}>
				{translate("common.cancel")}
			</Button>
			<SaveButton
				disabled={!canSave}
				loading={isSaving}
				tooltip={!canSave ? translate("common.form.completeRequired") : undefined}
				onSave={onSave}
			/>
		</Box>
	</Drawer>
);

export default FormSheet;
