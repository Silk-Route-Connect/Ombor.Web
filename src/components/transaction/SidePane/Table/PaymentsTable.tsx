import React from "react";
import { Link, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { translate } from "i18n/i18n";
import { TransactionPayment } from "models/payment";
import { formatDateTime } from "utils/dateUtils";
import { formatPrice } from "utils/supplyUtils";

interface Props {
	payments: TransactionPayment[];
}

const PaymentsTable: React.FC<Props> = ({ payments }) => (
	<Table size={"small"}>
		<TableHead>
			<TableRow>
				<TableCell>{translate("payment.id")}</TableCell>
				<TableCell>{translate("payment.date")}</TableCell>
				<TableCell>{translate("payment.method")}</TableCell>
				<TableCell>{translate("payment.currency")}</TableCell>
				<TableCell align="right">{translate("payment.amount")}</TableCell>
			</TableRow>
		</TableHead>

		<TableBody>
			{payments.map((p) => (
				<TableRow key={p.paymentId}>
					<TableCell>
						<Link href={`/payments/${p.paymentId}`} underline="hover">
							{p.paymentId}
						</Link>
					</TableCell>
					<TableCell>{formatDateTime(p.date)}</TableCell>
					<TableCell>{translate(`payment.method.${p.method}`)}</TableCell>
					<TableCell>{p.currency}</TableCell>
					<TableCell align="right">{formatPrice(p.amount)}</TableCell>
				</TableRow>
			))}
		</TableBody>
	</Table>
);

export default PaymentsTable;
