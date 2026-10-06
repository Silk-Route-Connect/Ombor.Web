import React from "react";
import DetailLink from "components/shared/Link/DetailLink";
import { ActivityRef } from "utils/activity/activitySentence";

import { Box } from "@mui/material";

/**
 * The record a log line names: a link to its page, or — for a record with no
 * page of its own or one that was deleted — the same text in plain 600 (as a
 * category or template name reads in tables).
 */
export const ActivityRefLink: React.FC<{ value: ActivityRef }> = ({ value }) =>
	value.to ? (
		<DetailLink to={value.to}>{value.text}</DetailLink>
	) : (
		<Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>
			{value.text}
		</Box>
	);

export default ActivityRefLink;
