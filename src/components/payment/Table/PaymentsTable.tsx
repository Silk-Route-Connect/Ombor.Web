import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { DataTable } from "components/shared/Table/DataTable/DataTable";
import TableEmptyState from "components/shared/Table/TableEmptyState";
import { Loadable } from "helpers/Loading";
import { PaymentRecord } from "models/payment";

import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";

import { buildPaymentColumns } from "./paymentTableConfigs";

interface PaymentsTableProps {
	rows: Loadable<PaymentRecord[]>;
	isFiltering: boolean;
	onOpen: (payment: PaymentRecord) => void;
	/** Re-runs the failed list load (the error state's «Повторить»). */
	onRetry: () => void;
	/** Error-state title, e.g. «Не удалось загрузить платежи». */
	errorTitle: string;
	/** Totals of the filtered rows in the footer band. */
	summary?: React.ReactNode;
}

/** Payments list on the shared {@link DataTable}; a row opens the full-page detail. */
export const PaymentsTable: React.FC<PaymentsTableProps> = ({
	rows,
	isFiltering,
	onOpen,
	onRetry,
	errorTitle,
	summary,
}) => {
	const { t } = useTranslation();
	const columns = useMemo(() => buildPaymentColumns(t), [t]);

	return (
		<DataTable
			rows={rows}
			onRetry={onRetry}
			errorTitle={errorTitle}
			columns={columns}
			defaultSort={{ key: "date", order: "desc" }}
			onRowClick={onOpen}
			fixedLayout
			summary={summary}
			empty={
				<TableEmptyState
					icon={<ReceiptLongOutlinedIcon />}
					title={isFiltering ? t("payment.empty.searchTitle") : t("payment.empty.title")}
					hint={isFiltering ? t("payment.empty.searchBody") : t("payment.empty.body")}
				/>
			}
		/>
	);
};

export default PaymentsTable;
