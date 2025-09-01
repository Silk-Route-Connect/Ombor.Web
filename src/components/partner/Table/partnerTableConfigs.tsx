import { Column } from "components/shared/Table/DataTable/DataTable";
import { translate } from "i18n/i18n";
import { Partner } from "models/partner";
import { formatNumberWithCommas } from "utils/helpers";
import { getBalanceColor } from "utils/partnerUtils";

import { Typography } from "@mui/material";

export const partnerColumns: Column<Partner>[] = [
	{
		key: "name",
		field: "name",
		headerName: translate("partner.name"),
		sortable: true,
		width: "25%",
	},
	{
		key: "type",
		field: "type",
		headerName: translate("partner.type"),
		sortable: true,
		width: "15%",
		renderCell: (p) => translate(`partner.type.${p.type}`),
	},
	{
		key: "balance",
		field: "balance",
		headerName: translate("partner.balance"),
		sortable: true,
		width: "15%",
		renderCell: (p) => {
			const colorKey = getBalanceColor(p.balance);
			return <Typography sx={{ color: colorKey }}>{formatNumberWithCommas(p.balance)}</Typography>;
		},
	},
	{
		key: "companyName",
		field: "companyName",
		headerName: translate("partner.company"),
		sortable: true,
		width: "25%",
		renderCell: (p) => p.companyName ?? translate("common.dash"),
	},
	{
		key: "phoneNumbers",
		field: "phoneNumbers",
		headerName: translate("partner.phoneNumber"),
		sortable: false,
		width: "20%",
		renderCell: (p) => (p.phoneNumbers?.length ? p.phoneNumbers[0] : translate("common.dash")),
	},
];
