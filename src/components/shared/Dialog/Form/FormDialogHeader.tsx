import React from "react";
import { useTranslation } from "react-i18next";
import { KindPresentation } from "components/shared/Chip/movementKind";
import IconTile from "components/shared/IconTile/IconTile";

import CloseIcon from "@mui/icons-material/Close";
import { Box, DialogTitle, IconButton, Typography } from "@mui/material";

/** Side of the header tile — the title and subtitle lines sit beside it. */
const TILE_SIZE = 40;

interface FormDialogHeaderProps {
	title: string;
	/** Secondary line under the title (bundle `.fcard-sub`), e.g. the SKU on edit, or a meta row. */
	subtitle?: React.ReactNode;
	/**
	 * The record's tile (`recordTile(kind)`) leading the title — the same glyph
	 * and tint the record carries in the activity log, so a form is recognisable
	 * before it is read.
	 */
	tile?: KindPresentation;
	disabled: boolean;
	onClose: () => void;
}

const FormDialogHeader: React.FC<FormDialogHeaderProps> = ({
	title,
	subtitle,
	tile,
	disabled,
	onClose,
}) => {
	const { t } = useTranslation();

	return (
		<DialogTitle sx={{ display: "flex", alignItems: "center", gap: "14px", pr: "16px" }}>
			{tile && <IconTile icon={<tile.icon />} token={tile.token} size={TILE_SIZE} />}
			<Box sx={{ minWidth: 0, flex: 1 }}>
				{title}
				{subtitle && (
					<Typography component="div" sx={{ fontSize: 13, color: "text.secondary", mt: "2px" }}>
						{subtitle}
					</Typography>
				)}
			</Box>
			<IconButton
				aria-label={t("common.close")}
				onClick={onClose}
				disabled={disabled}
				sx={{ flex: "0 0 auto", alignSelf: "center" }}
			>
				<CloseIcon />
			</IconButton>
		</DialogTitle>
	);
};

export default FormDialogHeader;
