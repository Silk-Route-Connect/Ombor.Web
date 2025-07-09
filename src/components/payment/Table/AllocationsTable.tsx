import React from "react";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import AllocationLink from "components/shared/Links/AllocationLink";
import { translate } from "i18n/i18n";
import { PaymentAllocation } from "models/payment";
import { formatPrice } from "utils/supplyUtils";

interface AllocationsTableProps {
	allocations: PaymentAllocation[];
}

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
					<TableCell>
						{allocation.type === "AdvancePayment" ? (
							translate("transaction.advancePayment")
						) : (
							<AllocationLink allocation={allocation} />
						)}
					</TableCell>
					<TableCell align="right">{formatPrice(allocation.appliedAmount)}</TableCell>
				</TableRow>
			))}
		</TableBody>
	</Table>
);

export default AllocationsTable;
