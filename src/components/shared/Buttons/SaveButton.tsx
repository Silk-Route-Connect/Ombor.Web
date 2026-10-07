import React from "react";
import { useTranslation } from "react-i18next";

import CheckIcon from "@mui/icons-material/Check";
import { Button } from "@mui/material";

import BlockedAction from "./BlockedAction";

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

	return (
		<BlockedAction reason={loading ? undefined : blockedReason} fullWidth={fullWidth}>
			{(blocked, blockedProps) => (
				<Button
					variant="contained"
					// The commit tick every submit shares (the filled floppy disk was the one
					// filled glyph among outlined icons, and «Провести …» already used ✓).
					startIcon={icon ?? <CheckIcon />}
					color="primary"
					disabled={disabled && !blocked}
					loading={loading}
					fullWidth={fullWidth}
					onClick={blocked ? undefined : () => void onSave()}
					sx={{ whiteSpace: "nowrap" }}
					{...blockedProps}
				>
					{label ?? t("common.save")}
				</Button>
			)}
		</BlockedAction>
	);
};

export default SaveButton;
