import React, { JSX } from "react";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import AllocationLink from "components/shared/Links/AllocationLink";
import { translate } from "i18n/i18n";
import { PaymentAllocation } from "models/payment";
import { formatPrice } from "utils/supplyUtils";

interface AllocationsTableProps {
	allocations: PaymentAllocation[];
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

const AllocationsTable: React.FC<AllocationsTableProps> = ({ allocations }) => (
	<Table size={"small"}>
		<TableHead>
			<TableRow>
				<TableCell>{translate("payment.allocationType")}</TableCell>
				<TableCell align="right">{translate("payment.amount")}</TableCell>
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

export default AllocationsTable;
