import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import { translate } from "i18n/i18n";
import { Partner } from "models/partner";
import { formatNumberWithCommas } from "utils/formatCurrency";

export interface DetailsTabProps {
	partner: Partner;
}

const DetailsTab: React.FC<DetailsTabProps> = ({ partner }) => {
	return (
		<Box sx={{ p: 2 }}>
			<Grid container spacing={2}>
				<Grid size={{ xs: 6 }}>
					<Typography variant="subtitle2">{translate("fieldCompanyName")}</Typography>
					<Typography>{partner.companyName ?? "—"}</Typography>
				</Grid>
				<Grid size={{ xs: 6 }}>
					<Typography variant="subtitle2">{translate("fieldIsActive")}</Typography>
					<Typography>{translate("active")}</Typography>
				</Grid>
				<Grid size={{ xs: 6 }}>
					<Typography variant="subtitle2">{translate("fieldAddress")}</Typography>
					<Typography>{partner.address ?? "—"}</Typography>
				</Grid>
				<Grid size={{ xs: 6 }}>
					<Typography variant="subtitle2">{translate("fieldEmail")}</Typography>
					<Typography>{partner.email ?? "—"}</Typography>
				</Grid>
				<Grid size={{ xs: 12 }}>
					<Typography variant="subtitle2">{translate("fieldBalance")}</Typography>
					<Typography color={partner.balance > 0 ? "success" : "error"}>
						{partner.balance > 0 ? "+" : "-"} {formatNumberWithCommas(partner.balance)}
					</Typography>
				</Grid>
				<Grid size={{ xs: 12 }}>
					<Typography variant="subtitle2">{translate("fieldPhoneNumbers")}</Typography>
					{partner.phoneNumbers && partner.phoneNumbers.length > 0 ? (
						partner.phoneNumbers.map((phone, idx) => (
							<Typography key={`${phone}-${idx}`}>{phone}</Typography>
						))
					) : (
						<Typography>—</Typography>
					)}
				</Grid>
			</Grid>
		</Box>
	);
};

export default DetailsTab;
