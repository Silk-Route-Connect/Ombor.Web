import { Column } from "components/shared/Table/DataTable/DataTable";
import i18next from "i18n/config";
import { Partner } from "models/partner";
import { formatNumberWithCommas } from "utils/helpers";
import { getBalanceColor } from "utils/partnerUtils";

import { Typography } from "@mui/material";

export const partnerColumns: Column<Partner>[] = [
	{
		key: "name",
		field: "name",
		headerName: i18next.t("partner.name"),
		sortable: true,
		width: "25%",
	},
	{
		key: "type",
		field: "type",
		headerName: i18next.t("partner.type"),
		sortable: true,
		width: "15%",
		renderCell: (p) => i18next.t(`partner.type.${p.type}`),
	},
	{
		key: "balance",
		field: "balance",
		headerName: i18next.t("partner.balance"),
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
		headerName: i18next.t("partner.company"),
		sortable: true,
		width: "25%",
		renderCell: (p) => p.companyName ?? i18next.t("common.dash"),
	},
	{
		key: "phoneNumbers",
		field: "phoneNumbers",
		headerName: i18next.t("partner.phoneNumber"),
		sortable: false,
		width: "20%",
		renderCell: (p) => (p.phoneNumbers?.length ? p.phoneNumbers[0] : i18next.t("common.dash")),
	},
];
