import { Typography } from "@mui/material";
import { Column } from "components/shared/DataTable/DataTable";
import { translate } from "i18n/i18n";
import { Partner } from "models/partner";
import { formatNumberWithCommas } from "utils/helpers";

export const partnerColumns: Column<Partner>[] = [
	{
		key: "name",
		field: "name",
		headerName: translate("partner.name"),
		sortable: true,
		width: "30%",
	},
	{
		key: "balance",
		field: "balance",
		headerName: translate("partner.balance"),
		sortable: true,
		width: "30%",
		renderCell: (p) => {
			const textColor = p.balance < 0 ? "success.main" : "text.primary";
			return <Typography sx={{ color: textColor }}>{formatNumberWithCommas(p.balance)}</Typography>;
		},
	},
	{
		key: "companyName",
		field: "companyName",
		headerName: translate("partner.company"),
		sortable: true,
		width: "20%",
		renderCell: (p) => p.companyName ?? "—",
	},
	{
		key: "phoneNumbers",
		field: "phoneNumbers",
		headerName: translate("partner.phoneNumber"),
		sortable: false,
		width: "20%",
		renderCell: (p) => (p.phoneNumbers?.length ? p.phoneNumbers[0] : "—"),
	},
];
