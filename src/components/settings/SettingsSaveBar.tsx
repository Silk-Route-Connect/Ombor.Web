import React from "react";
import { useTranslation } from "react-i18next";
import GhostButton from "components/shared/Buttons/GhostButton";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";

import CheckIcon from "@mui/icons-material/Check";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Box } from "@mui/material";

interface Props {
	dirty: boolean;
	saving: boolean;
	onSave: () => void;
	onReset: () => void;
}

/**
 * Bottom save bar for the organization form. Buttons stay enabled (hard rule 5);
 * the status note communicates whether there are unsaved changes. Language /
 * users actions apply immediately and are not governed by this bar.
 */
const SettingsSaveBar: React.FC<Props> = ({ dirty, saving, onSave, onReset }) => {
	const { t } = useTranslation();

	return (
		<Box
			sx={{
				display: "flex",
				alignItems: "center",
				gap: "12px",
				mt: "6px",
				pt: "18px",
				borderTop: "1px solid",
				borderColor: "divider",
			}}
		>
			<Box
				sx={{
					display: "inline-flex",
					alignItems: "center",
					gap: "7px",
					fontSize: 12.5,
					color: dirty ? "text.secondary" : "text.disabled",
				}}
			>
				{dirty ? (
					<>
						<InfoOutlinedIcon sx={{ fontSize: 14 }} />
						{t("settings.save.dirty")}
					</>
				) : (
					<>
						<CheckIcon sx={{ fontSize: 14, color: "success.main" }} />
						{t("settings.save.clean")}
					</>
				)}
			</Box>
			<Box sx={{ flex: 1 }} />
			<GhostButton onClick={onReset} disabled={saving}>
				{t("settings.save.reset")}
			</GhostButton>
			<PrimaryButton
				icon={<CheckIcon sx={{ fontSize: "18px !important" }} />}
				disabled={saving}
				onClick={onSave}
			>
				{t("settings.save.save")}
			</PrimaryButton>
		</Box>
	);
};

export default SettingsSaveBar;
