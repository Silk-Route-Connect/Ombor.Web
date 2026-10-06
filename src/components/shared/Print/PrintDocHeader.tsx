import React from "react";
import { Organization } from "models/settings";
import { getImageFullUrl } from "utils/productUtils";

import { Box, Typography } from "@mui/material";

import { PRINT_RULE_COLOR } from "./printStyles";

interface PrintDocHeaderProps {
	/** The business issuing the document (GET /api/settings/organization). */
	organization: Organization;
	/** «Накладная на продажу №12», «Акт сверки взаиморасчётов». */
	title: string;
	/** Centered lines under the title: date, period, the parties, references. */
	subtitle?: string[];
}

/**
 * Top of every printed document: the business block (logo, name, address,
 * phone, email) over a rule, then the centered document title and its
 * date / reference lines.
 */
export const PrintDocHeader: React.FC<PrintDocHeaderProps> = ({
	organization,
	title,
	subtitle = [],
}) => {
	const logo = getImageFullUrl(organization.logoUrl ?? undefined);
	const contacts = [organization.address, organization.phone, organization.email].filter(
		(value): value is string => Boolean(value && value.trim()),
	);

	return (
		<Box component="header" sx={{ mb: "18px" }}>
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					gap: "14px",
					pb: "10px",
					borderBottom: "1px solid",
					borderColor: PRINT_RULE_COLOR,
				}}
			>
				{logo && (
					<Box
						component="img"
						src={logo}
						alt=""
						sx={{ maxHeight: 56, maxWidth: 160, objectFit: "contain", flex: "0 0 auto" }}
					/>
				)}
				<Box sx={{ minWidth: 0 }}>
					<Typography sx={{ fontSize: 16, fontWeight: 700, lineHeight: 1.3 }}>
						{organization.name}
					</Typography>
					{contacts.length > 0 && (
						<Typography sx={{ fontSize: 12, color: "text.secondary", mt: "2px" }}>
							{contacts.join(" · ")}
						</Typography>
					)}
				</Box>
			</Box>

			<Box sx={{ textAlign: "center", mt: "16px" }}>
				<Typography component="h1" sx={{ fontSize: 20, fontWeight: 700, lineHeight: 1.3 }}>
					{title}
				</Typography>
				{subtitle.map((line) => (
					<Typography key={line} sx={{ fontSize: 13, mt: "2px" }}>
						{line}
					</Typography>
				))}
			</Box>
		</Box>
	);
};

export default PrintDocHeader;
