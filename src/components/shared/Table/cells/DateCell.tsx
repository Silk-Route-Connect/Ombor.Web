import React from "react";
import { numericSx } from "theme";
import { formatDate, formatDateTime } from "utils/dateUtils";

import { Box } from "@mui/material";

import NoValue from "./NoValue";

interface DateCellProps {
	value: Date | string | null | undefined;
	/** `dateTime` for events (when it happened), `date` for calendar fields (hire date, due date). */
	kind?: "dateTime" | "date";
}

/** Date column cell: secondary, tabular, never wraps. */
export const DateCell: React.FC<DateCellProps> = ({ value, kind = "dateTime" }) => {
	if (value == null || value === "") {
		return <NoValue />;
	}
	return (
		<Box component="span" sx={{ ...numericSx, color: "text.secondary", whiteSpace: "nowrap" }}>
			{kind === "dateTime" ? formatDateTime(value) : formatDate(value)}
		</Box>
	);
};

export default DateCell;
