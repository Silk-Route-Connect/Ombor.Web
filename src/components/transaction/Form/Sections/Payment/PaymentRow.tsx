import React from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton, MenuItem, Stack, TextField } from "@mui/material";
import NumericField from "components/shared/Inputs/NumericField";
import { translate } from "i18n/i18n";
import { PaymentCurrency, PaymentMethod } from "models/payment";

export type PaymentRowData = {
	id: number;
	amount: number;
	currency: PaymentCurrency;
	exchangeRate: number;
	method: PaymentMethod;
	reference?: string;
};

interface Props {
	isRemovable: boolean;
	row: PaymentRowData;
	onUpdate: (id: number, patch: Partial<PaymentRowData>) => void;
	onRemove: (id: number) => void;
}

const CURRENCIES: PaymentCurrency[] = ["UZS", "USD", "RUB"];
const METHODS: PaymentMethod[] = ["Cash", "Card", "BankTransfer"];

const PaymentRow: React.FC<Props> = ({ isRemovable, row, onUpdate, onRemove }) => (
	<Stack direction="row" spacing={1}>
		<NumericField
			size="small"
			label={translate("payment.amount")}
			value={row.amount}
			onChange={(e) => onUpdate(row.id, { amount: Number(e.target.value) })}
			fullWidth
		/>

		<TextField
			select
			size="small"
			label={translate("payment.method")}
			value={row.method}
			onChange={(e) => onUpdate(row.id, { method: e.target.value as PaymentMethod })}
			fullWidth
		>
			{METHODS.map((m) => (
				<MenuItem key={m} value={m}>
					{translate(`payment.method.${m}`)}
				</MenuItem>
			))}
		</TextField>

		<TextField
			select
			size="small"
			label={translate("fieldCurrency")}
			value={row.currency}
			onChange={(e) => onUpdate(row.id, { currency: e.target.value as PaymentCurrency })}
			fullWidth
		>
			{CURRENCIES.map((c) => (
				<MenuItem key={c} value={c}>
					{c}
				</MenuItem>
			))}
		</TextField>

		<NumericField
			size="small"
			label={translate("payment.exchangeRate")}
			disabled={row.currency === "UZS"}
			value={row.exchangeRate}
			onChange={(e) => onUpdate(row.id, { exchangeRate: Number(e.target.value) })}
			fullWidth
		/>

		{isRemovable && (
			<IconButton onClick={() => onRemove(row.id)} color="error">
				<DeleteIcon />
			</IconButton>
		)}
	</Stack>
);

export default PaymentRow;
