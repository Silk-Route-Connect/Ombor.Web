import React from "react";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import AllocationLink from "components/shared/Links/AllocationLink";
import { translate } from "i18n/i18n";
import { PaymentAllocation } from "models/payment";
import { formatPrice } from "utils/supplyUtils";

interface Props {
	rows: PaymentAllocation[];
}

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
					<TableCell>
						{a.type === "AdvancePayment" ? (
							translate("transaction.advancePayment")
						) : (
							<AllocationLink allocation={a} />
						)}
					</TableCell>
					<TableCell align="right">{formatPrice(a.appliedAmount)}</TableCell>
				</TableRow>
			))}
		</TableBody>
	</Table>
);

export default PaymentAllocationsTable;
