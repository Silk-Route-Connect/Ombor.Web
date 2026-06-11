import React from "react";
import { useTranslation } from "react-i18next";
import PhoneNumbersList from "components/partner/PhoneNumbersList/PhoneNumbersList";
import { Partner } from "models/partner";
import { formatNumberWithCommas } from "utils/formatCurrency";
import { valueOrPlaceholder } from "utils/stringUtils";

import { Box, Grid, Typography } from "@mui/material";

export interface PartnerDetailsTabProps {
	partner: Partner;
}

const PartnerDetailsTab: React.FC<PartnerDetailsTabProps> = ({ partner }) => {
	const { t } = useTranslation();
	return (
		<Box sx={{ p: 2 }}>
			<Grid container spacing={2}>
				<Grid size={{ xs: 6 }}>
					<Typography variant="subtitle2">{t("fieldCompanyName")}</Typography>
					<Typography>{valueOrPlaceholder(partner.companyName)}</Typography>
				</Grid>
				<Grid size={{ xs: 6 }}>
					<Typography variant="subtitle2">{t("fieldBalance")}</Typography>
					<Typography color={partner.balance >= 0 ? "success" : "error"}>
						{formatNumberWithCommas(partner.balance)}
					</Typography>
				</Grid>
				<Grid size={{ xs: 6 }}>
					<Typography variant="subtitle2">{t("fieldIsActive")}</Typography>
					<Typography>{t("active")}</Typography>
				</Grid>
				<Grid size={{ xs: 6 }}>
					<Typography variant="subtitle2">{t("partner.type")}</Typography>
					<Typography>{t(`partner.type.${partner.type}`)}</Typography>
				</Grid>
				<Grid size={{ xs: 6 }}>
					<Typography variant="subtitle2">{t("partner.email")}</Typography>
					<Typography>{valueOrPlaceholder(partner.email)}</Typography>
				</Grid>
				<Grid size={{ xs: 6 }}>
					<Typography variant="subtitle2">{t("partner.telegram")}</Typography>
					<Typography>{valueOrPlaceholder(partner.email)}</Typography>
				</Grid>
				<Grid size={{ xs: 12 }}>
					<Typography variant="subtitle2">{t("fieldAddress")}</Typography>
					<Typography>{valueOrPlaceholder(partner.address)}</Typography>
				</Grid>
				<Grid size={{ xs: 12 }}>
					<Typography variant="subtitle2">{t("fieldPhoneNumbers")}</Typography>
					<PhoneNumbersList partner={partner} />
				</Grid>
			</Grid>
		</Box>
	);
};

export default PartnerDetailsTab;
