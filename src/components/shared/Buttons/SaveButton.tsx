import React, { useId } from "react";
import { useTranslation } from "react-i18next";
import { visuallyHiddenSx } from "theme";

import CheckIcon from "@mui/icons-material/Check";
import { Box, Button, buttonClasses, Tooltip } from "@mui/material";

interface SaveButtonProps {
	disabled?: boolean;
	loading?: boolean;
	fullWidth?: boolean;
	/**
	 * Why the submit cannot run right now (the offline gate). Unlike `disabled` the
	 * button stays focusable (`aria-disabled`), so keyboard and screen-reader users
	 * reach the reason: it is the tooltip and the button's accessible description.
	 */
	blockedReason?: string;
	/** Overrides «Сохранить» — immutable events name what happens («Провести …»). */
	label?: string;
	icon?: React.ReactNode;
	/** Sync or async; a returned promise is not awaited — the store reports its own outcome. */
	onSave: () => unknown;
}

const SaveButton: React.FC<SaveButtonProps> = ({
	disabled = false,
	loading = false,
	fullWidth = false,
	blockedReason,
	label,
	icon,
	onSave,
}) => {
	const { t } = useTranslation();
	const reasonId = useId();
	const blocked = Boolean(blockedReason) && !loading;

	return (
		<Tooltip title={blocked ? blockedReason : ""} placement="top">
			<Box component="span" sx={{ display: "inline-flex", width: fullWidth ? "100%" : "auto" }}>
				<Button
					variant="contained"
					// The commit tick every submit shares (the filled floppy disk was the one
					// filled glyph among outlined icons, and «Провести …» already used ✓).
					startIcon={icon ?? <CheckIcon />}
					color="primary"
					disabled={disabled && !blocked}
					// Blocked looks disabled (the theme's own disabled class) but keeps focus.
					className={blocked ? buttonClasses.disabled : undefined}
					aria-disabled={blocked || undefined}
					aria-describedby={blocked ? reasonId : undefined}
					disableRipple={blocked}
					loading={loading}
					fullWidth={fullWidth}
					onClick={blocked ? undefined : () => void onSave()}
					sx={{ whiteSpace: "nowrap" }}
				>
					{label ?? t("common.save")}
				</Button>
				{blocked && (
					<Box component="span" id={reasonId} sx={visuallyHiddenSx}>
						{blockedReason}
					</Box>
				)}
			</Box>
		</Tooltip>
	);
};

export default SaveButton;
