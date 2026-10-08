import React from "react";
import { useTranslation } from "react-i18next";
import GhostButton from "components/shared/Buttons/GhostButton";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";

import CheckIcon from "@mui/icons-material/Check";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Box, Typography } from "@mui/material";

interface Props {
	dirty: boolean;
	saving: boolean;
	onSave: () => void;
	onReset: () => void;
}

/**
 * The organization card's footer: whether there are unsaved changes, «Отмена»
 * and «Сохранить». The buttons stay enabled (hard rule 5) except while the save
 * is in flight, as in every form footer. Language / users actions apply at once
 * and are not governed by it.
 */
const SettingsSaveBar: React.FC<Props> = ({ dirty, saving, onSave, onReset }) => {
	const { t } = useTranslation();

	return (
		<>
			<Typography
				variant="caption"
				sx={{
					display: "inline-flex",
					alignItems: "center",
					gap: "6px",
					color: "text.secondary",
					"& .MuiSvgIcon-root": { fontSize: 16 },
				}}
			>
				{dirty ? (
					<>
						<InfoOutlinedIcon sx={{ color: "warning.main" }} />
						{t("settings.save.dirty")}
					</>
				) : (
					<>
						<CheckIcon sx={{ color: "success.main" }} />
						{t("settings.save.clean")}
					</>
				)}
			</Typography>
			<Box sx={{ flex: 1 }} />
			<GhostButton onClick={onReset} disabled={saving}>
				{t("common.cancel")}
			</GhostButton>
			<PrimaryButton icon={<CheckIcon />} loading={saving} onClick={onSave}>
				{t("settings.save.save")}
			</PrimaryButton>
		</>
	);
};

export default SettingsSaveBar;
