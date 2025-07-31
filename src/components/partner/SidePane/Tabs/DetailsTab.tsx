import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import PhoneNumbersList from "components/partner/PhoneNumbersList/PhoneNumbersList";
import { translate } from "i18n/i18n";
import { Partner } from "models/partner";
import { formatNumberWithCommas } from "utils/formatCurrency";
import { valueOrPlaceholder } from "utils/stringUtils";

export interface DetailsTabProps {
	partner: Partner;
}

const DetailsTab: React.FC<DetailsTabProps> = ({ partner }) => {
	return (
		<Box sx={{ p: 2 }}>
			<Grid container spacing={2}>
				<Grid size={{ xs: 6 }}>
					<Typography variant="subtitle2">{translate("fieldCompanyName")}</Typography>
					<Typography>{valueOrPlaceholder(partner.companyName)}</Typography>
				</Grid>
				<Grid size={{ xs: 6 }}>
					<Typography variant="subtitle2">{translate("fieldBalance")}</Typography>
					<Typography color={partner.balance >= 0 ? "success" : "error"}>
						{formatNumberWithCommas(partner.balance)}
					</Typography>
				</Grid>
				<Grid size={{ xs: 6 }}>
					<Typography variant="subtitle2">{translate("fieldIsActive")}</Typography>
					<Typography>{translate("active")}</Typography>
				</Grid>
				<Grid size={{ xs: 6 }}>
					<Typography variant="subtitle2">{translate("partner.type")}</Typography>
					<Typography>{translate(`partner.type.${partner.type}`)}</Typography>
				</Grid>
				<Grid size={{ xs: 6 }}>
					<Typography variant="subtitle2">{translate("fieldEmail")}</Typography>
					<Typography>{valueOrPlaceholder(partner.email)}</Typography>
				</Grid>
				<Grid size={{ xs: 12 }}>
					<Typography variant="subtitle2">{translate("fieldAddress")}</Typography>
					<Typography>{valueOrPlaceholder(partner.address)}</Typography>
				</Grid>
				<Grid size={{ xs: 12 }}>
					<Typography variant="subtitle2">{translate("fieldPhoneNumbers")}</Typography>
					<PhoneNumbersList partner={partner} />
				</Grid>
			</Grid>
		</Box>
	);
};

export default DetailsTab;
