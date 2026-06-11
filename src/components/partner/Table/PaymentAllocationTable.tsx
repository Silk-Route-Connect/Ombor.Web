import React, { JSX } from "react";
import { useTranslation } from "react-i18next";
import AllocationLink from "components/payment/Links/AllocationLink";
import i18next from "i18n/config";
import { PaymentAllocation } from "models/payment";
import { formatPrice } from "utils/formatCurrency";

import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";

interface Props {
	rows: PaymentAllocation[];
}

const getCell = (allocation: PaymentAllocation): JSX.Element => {
	switch (allocation.type) {
		case "AdvancePayment":
			return <span>{i18next.t("transaction.advancePayment")}</span>;
		case "ChangeReturn":
			return <span>{i18next.t("transaction.changeReturn")}</span>;
		default:
			return <AllocationLink allocation={allocation} />;
	}
};

const PaymentAllocationsTable: React.FC<Props> = ({ rows }) => {
	const { t } = useTranslation();
	return (
		<Table size="small">
			<TableHead>
				<TableRow>
					<TableCell>{t("fieldAllocationType")}</TableCell>
					<TableCell align="right">{t("fieldAppliedAmount")}</TableCell>
				</TableRow>
			</TableHead>
			<TableBody>
				{rows.map((a) => (
					<TableRow key={a.id}>
						<TableCell>{getCell(a)}</TableCell>
						<TableCell align="right">{formatPrice(a.amount)}</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
};

export default PaymentAllocationsTable;
