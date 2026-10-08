import React from "react";
import { UZ_COUNTRY_PREFIX } from "utils/phoneUtils";

import { InputAdornment } from "@mui/material";

/**
 * The fixed «+998» start adornment of an Uzbek phone field — one look for every
 * phone input in a form (partner / employee phone rows, the user invite).
 */
const UzPhonePrefix: React.FC = () => (
	<InputAdornment
		position="start"
		sx={{ "& .MuiTypography-root": { fontWeight: 600, color: "text.secondary" } }}
	>
		{UZ_COUNTRY_PREFIX}
	</InputAdornment>
);

export default UzPhonePrefix;
