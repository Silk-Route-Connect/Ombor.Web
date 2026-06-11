import React from "react";
import { useTranslation } from "react-i18next";
import { PaymentComponent } from "models/payment";
import { formatPrice } from "utils/formatCurrency";

import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";

interface PaymentComponentsTableProps {
	components: PaymentComponent[];
}

const PaymentComponentsTable: React.FC<PaymentComponentsTableProps> = ({ components }) => {
	const { t } = useTranslation();

	return (
		<Table size={"small"}>
			<TableHead>
				<TableRow>
					<TableCell>{t("payment.currency")}</TableCell>
					<TableCell>{t("payment.method")}</TableCell>
					<TableCell align="right">{t("payment.amount")}</TableCell>
					<TableCell align="right">{t("payment.exchangeRate")}</TableCell>
				</TableRow>
			</TableHead>

			<TableBody>
				{components.map((component) => (
					<TableRow key={component.id}>
						<TableCell>{t(`payment.currency.${component.currency}`)}</TableCell>
						<TableCell>{t(`payment.method.${component.method}`)}</TableCell>
						<TableCell align="right">{formatPrice(component.amount)}</TableCell>
						<TableCell align="right">
							{component.exchangeRate > 1 ? formatPrice(component.exchangeRate) : <>&mdash;</>}
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
};

export default PaymentComponentsTable;
