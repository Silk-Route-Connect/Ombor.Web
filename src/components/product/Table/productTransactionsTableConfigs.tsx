import { Box } from "@mui/material";
import PartnerLink from "components/partner/Links/PartnerLink";
import { Column } from "components/shared/Table/DataTable/DataTable";
import TransactionLink from "components/transaction/Links/TransactionLink";
import { translate } from "i18n/i18n";
import { ProductTransaction } from "models/product";
import { TransactionType } from "models/transaction";
import { formatDateTime } from "utils/dateUtils";

export type ProductTransactionsMode = Extract<TransactionType, "Sale" | "Supply">;

export const buildProductTransactionsColumns = (
	mode: ProductTransactionsMode,
): Column<ProductTransaction>[] => {
	const transactionHeader = translate(`transaction.type.${mode}`);

	return [
		{
			key: "transaction",
			headerName: transactionHeader,
			width: "15%",
			sortable: true,
			renderCell: (row) => <TransactionLink id={row.id} type={row.transactionType} />,
		},
		{
			key: "date",
			headerName: translate("product.transaction.date"),
			width: "17%",
			sortable: true,
			align: "left",
			renderCell: (row) => <Box component="span">{formatDateTime(row.date)}</Box>,
		},
		{
			key: "partner",
			headerName: translate("product.transaction.partner"),
			width: "18%",
			sortable: true,
			renderCell: (row) => <PartnerLink id={row.partnerId} name={row.partnerName} />,
		},
		{
			key: "unitPrice",
			headerName: translate("product.transaction.unitPrice"),
			width: "15%",
			align: "right",
			sortable: true,
			renderCell: (row) => <Box component="span">{row.unitPrice.toLocaleString()}</Box>,
		},
		{
			key: "discount",
			headerName: translate("product.transaction.discount"),
			width: "10%",
			align: "right",
			sortable: true,
			renderCell: (row) => <Box component="span">{row.discount.toLocaleString()}</Box>,
		},
		{
			key: "quantity",
			headerName: translate("product.transaction.quantity"),
			width: "10%",
			align: "right",
			sortable: true,
			renderCell: (row) => <Box component="span">{row.quantity.toLocaleString()}</Box>,
		},
		{
			key: "total",
			headerName: translate("product.transaction.total"),
			width: "15%",
			align: "right",
			sortable: false,
			renderCell: (row) => {
				const total = row.unitPrice * row.quantity - row.discount;
				return <Box component="span">{total.toLocaleString()}</Box>;
			},
		},
	];
};
