import React, { JSX } from "react";
import { useTranslation } from "react-i18next";
import AllocationLink from "components/payment/Links/AllocationLink";
import i18next from "i18n/config";
import { PaymentAllocation } from "models/payment";
import { formatPrice } from "utils/formatCurrency";

import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";

interface AllocationsTableProps {
	allocations: PaymentAllocation[];
}

const getCell = (allocation: PaymentAllocation): JSX.Element => {
	console.log(allocation);
	switch (allocation.type) {
		case "AdvancePayment":
			return <span>{i18next.t("transaction.advancePayment")}</span>;
		case "ChangeReturn":
			return <span>{i18next.t("transaction.changeReturn")}</span>;
		default:
			return <AllocationLink allocation={allocation} />;
	}
};

const AllocationsTable: React.FC<AllocationsTableProps> = ({ allocations }) => {
	const { t } = useTranslation();

	return (
		<Table size={"small"}>
			<TableHead>
				<TableRow>
					<TableCell>{t("payment.allocationType")}</TableCell>
					<TableCell align="right">{t("payment.amount")}</TableCell>
				</TableRow>
			</TableHead>

			<TableBody>
				{allocations.map((allocation) => (
					<TableRow key={allocation.id}>
						<TableCell>{getCell(allocation)}</TableCell>
						<TableCell align="right">{formatPrice(allocation.amount)}</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
};

export default AllocationsTable;
