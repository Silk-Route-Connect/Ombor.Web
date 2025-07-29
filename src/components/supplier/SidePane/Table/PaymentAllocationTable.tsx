import React, { JSX } from "react";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import AllocationLink from "components/shared/Links/AllocationLink";
import { translate } from "i18n/i18n";
import { PaymentAllocation } from "models/payment";
import { formatPrice } from "utils/supplyUtils";

interface Props {
	rows: PaymentAllocation[];
}

const getCell = (allocation: PaymentAllocation): JSX.Element => {
	console.log(allocation);
	switch (allocation.type) {
		case "AdvancePayment":
			return <span>{translate("transaction.advancePayment")}</span>;
		case "ChangeReturn":
			return <span>{translate("transaction.changeReturn")}</span>;
		default:
			return <AllocationLink allocation={allocation} />;
	}
};

const PaymentAllocationsTable: React.FC<Props> = ({ rows }) => (
	<Table size="small">
		<TableHead>
			<TableRow>
				<TableCell>{translate("fieldAllocationType")}</TableCell>
				<TableCell align="right">{translate("fieldAppliedAmount")}</TableCell>
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

export default PaymentAllocationsTable;
