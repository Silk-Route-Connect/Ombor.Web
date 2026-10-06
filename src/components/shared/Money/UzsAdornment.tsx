import React from "react";
import { useTranslation } from "react-i18next";

import { InputAdornment } from "@mui/material";

/**
 * The «UZS» end adornment of a money input (`endAdornment: <UzsAdornment />`),
 * label from `common.unit.uzs` — the input twin of `UzsUnit`.
 */
const UzsAdornment: React.FC = () => {
	const { t } = useTranslation();
	return <InputAdornment position="end">{t("common.unit.uzs")}</InputAdornment>;
};

export default UzsAdornment;
