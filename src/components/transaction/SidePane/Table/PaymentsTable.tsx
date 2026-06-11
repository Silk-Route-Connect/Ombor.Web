import React from "react";
import { useTranslation } from "react-i18next";
import { TransactionPayment } from "models/payment";
import { formatDateTime } from "utils/dateUtils";
import { formatPrice } from "utils/formatCurrency";

import { Link, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";

interface Props {
	payments: TransactionPayment[];
}

const PaymentsTable: React.FC<Props> = ({ payments }) => {
	const { t } = useTranslation();

	return (
		<Table size={"small"}>
			<TableHead>
				<TableRow>
					<TableCell>{t("payment.id")}</TableCell>
					<TableCell>{t("payment.date")}</TableCell>
					<TableCell>{t("payment.method")}</TableCell>
					<TableCell>{t("payment.currency")}</TableCell>
					<TableCell align="right">{t("payment.amount")}</TableCell>
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
						<TableCell>{t(`payment.method.${p.method}`)}</TableCell>
						<TableCell>{p.currency}</TableCell>
						<TableCell align="right">{formatPrice(p.amount)}</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
};

export default PaymentsTable;
