import React from "react";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { translate } from "i18n/i18n";
import { PaymentComponent } from "models/payment";
import { formatPrice } from "utils/formatCurrency";

interface PaymentComponentsTableProps {
	components: PaymentComponent[];
}

const PaymentComponentsTable: React.FC<PaymentComponentsTableProps> = ({ components }) => (
	<Table size={"small"}>
		<TableHead>
			<TableRow>
				<TableCell>{translate("payment.currency")}</TableCell>
				<TableCell>{translate("payment.method")}</TableCell>
				<TableCell align="right">{translate("payment.amount")}</TableCell>
				<TableCell align="right">{translate("payment.exchangeRate")}</TableCell>
			</TableRow>
		</TableHead>

		<TableBody>
			{components.map((component) => (
				<TableRow key={component.id}>
					<TableCell>{translate(`payment.currency.${component.currency}`)}</TableCell>
					<TableCell>{translate(`payment.method.${component.method}`)}</TableCell>
					<TableCell align="right">{formatPrice(component.amount)}</TableCell>
					<TableCell align="right">
						{component.exchangeRate > 1 ? formatPrice(component.exchangeRate) : <>&mdash;</>}
					</TableCell>
				</TableRow>
			))}
		</TableBody>
	</Table>
);

export default PaymentComponentsTable;
