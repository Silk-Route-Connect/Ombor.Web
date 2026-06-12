import React from "react";
import { useTranslation } from "react-i18next";
import GhostButton from "components/shared/Buttons/GhostButton";
import { designTokens } from "theme";

import { Box, Button, Dialog, Typography } from "@mui/material";

/** Icon tile tint per the bundle's `.dialog-icon` (warn default, `.info` variant). */
export type ConfirmIconTone = "warning" | "info";

/** Confirm button treatment per the bundle: btn-danger / btn-warn / btn-primary. */
export type ConfirmVariant = "danger" | "warning" | "primary";

interface ConfirmDialogProps {
	isOpen: boolean;
	title: string;
	content?: React.ReactNode;
	/** Optional leading icon rendered in a 46×46 tinted tile. */
	icon?: React.ReactNode;
	iconTone?: ConfirmIconTone;
	confirmLabel?: string;
	cancelLabel?: string;
	confirmVariant?: ConfirmVariant;
	onConfirm: () => void;
	onCancel: () => void;
}

const ICON_TILE_SX: Record<ConfirmIconTone, object> = {
	warning: { bgcolor: designTokens.warningBg, color: "warning.main" },
	info: { bgcolor: designTokens.primarySoft, color: "primary.main" },
};

/** Bundle button styles: btn-danger is an error-outlined surface button. */
const CONFIRM_SX: Record<ConfirmVariant, object> = {
	danger: {
		bgcolor: "background.paper",
		color: "error.main",
		border: "1px solid",
		borderColor: designTokens.errorBorder,
		"&:hover": { bgcolor: designTokens.errorBg, borderColor: designTokens.errorBorder },
	},
	warning: {
		bgcolor: "secondary.main",
		color: "#fff",
		"&:hover": { bgcolor: designTokens.saffron600 },
	},
	primary: {
		bgcolor: "primary.main",
		color: "#fff",
		"&:hover": { bgcolor: "primary.dark" },
	},
};

/**
 * Confirmation dialog per the design system's `.modal.dialog`: a 440px card
 * with an optional tinted icon tile, left-aligned title and muted text, and a
 * ghost cancel + variant-styled confirm in the footer.
 */
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
	isOpen,
	title,
	content,
	icon,
	iconTone = "warning",
	confirmLabel,
	cancelLabel,
	confirmVariant = "danger",
	onConfirm,
	onCancel,
}) => {
	const { t } = useTranslation();

	return (
		<Dialog
			open={isOpen}
			onClose={onCancel}
			disableRestoreFocus
			disableEscapeKeyDown
			slotProps={{
				paper: { sx: { width: 440, maxWidth: "94%", borderRadius: "12px" } },
			}}
		>
			<Box sx={{ p: "24px 24px 4px" }}>
				{icon && (
					<Box
						sx={{
							width: 46,
							height: 46,
							borderRadius: "13px",
							display: "grid",
							placeItems: "center",
							mb: "16px",
							...ICON_TILE_SX[iconTone],
						}}
					>
						{icon}
					</Box>
				)}

				<Typography sx={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em", mb: "8px" }}>
					{title}
				</Typography>

				{content && (
					<Box sx={{ fontSize: 13.5, color: "text.secondary", lineHeight: 1.62 }}>{content}</Box>
				)}
			</Box>

			<Box sx={{ display: "flex", justifyContent: "flex-end", gap: "10px", p: "22px 24px" }}>
				<GhostButton onClick={onCancel}>{cancelLabel ?? t("common.cancel")}</GhostButton>
				<Button
					onClick={onConfirm}
					sx={{
						borderRadius: "8px",
						fontSize: 14,
						fontWeight: 600,
						px: "16px",
						py: "9px",
						lineHeight: 1.45,
						whiteSpace: "nowrap",
						...CONFIRM_SX[confirmVariant],
					}}
				>
					{confirmLabel ?? t("common.delete")}
				</Button>
			</Box>
		</Dialog>
	);
};

export default ConfirmDialog;
