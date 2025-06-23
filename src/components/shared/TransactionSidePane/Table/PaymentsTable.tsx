import React from "react";
import { Link, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { translate } from "i18n/i18n";
import { TransactionPayment } from "models/payment";
import { formatDateTime } from "utils/dateUtils";
import { formatPrice } from "utils/supplyUtils";

interface Props {
	payments: TransactionPayment[];
	dense?: boolean; // single-payment inline view
	hideHeader?: boolean; // inline view
}

const PaymentsTable: React.FC<Props> = ({ payments, dense = false, hideHeader = false }) => (
	<Table size={dense ? "small" : "medium"}>
		{!hideHeader && (
			<TableHead>
				<TableRow>
					<TableCell>{translate("fieldId")}</TableCell>
					<TableCell>{translate("fieldDate")}</TableCell>
					<TableCell align="right">{translate("fieldAmountLocal")}</TableCell>
					<TableCell align="right">{translate("fieldCurrency")}</TableCell>
					<TableCell>{translate("fieldPaymentMethod")}</TableCell>
				</TableRow>
			</TableHead>
		)}

		<TableBody>
			{payments.map((p) => (
				<TableRow key={p.paymentId}>
					<TableCell>
						<Link href={`/payments/${p.paymentId}`} underline="hover">
							{p.paymentId}
						</Link>
					</TableCell>
					<TableCell>{formatDateTime(p.date)}</TableCell>
					<TableCell align="right">{formatPrice(p.amount)}</TableCell>
					<TableCell align="right">{p.currency}</TableCell>
					<TableCell>{translate(`paymentMethod.${p.method.toLowerCase()}`)}</TableCell>
				</TableRow>
			))}
		</TableBody>
	</Table>
);

export default PaymentsTable;
