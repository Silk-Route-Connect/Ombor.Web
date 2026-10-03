import React from "react";
import { numericSx } from "theme";
import { formatUzPhone } from "utils/phoneUtils";

import { Box } from "@mui/material";

import NoValue from "./NoValue";

/** Phone cell: «+998 90 123 45 67», tabular, one line. */
export const PhoneCell: React.FC<{ phone: string | null | undefined }> = ({ phone }) => {
	const formatted = phone ? formatUzPhone(phone) : "";
	return formatted ? (
		<Box component="span" sx={{ ...numericSx, whiteSpace: "nowrap" }}>
			{formatted}
		</Box>
	) : (
		<NoValue />
	);
};

export default PhoneCell;
