import React from "react";
import NumericField from "components/shared/Inputs/NumericField";
import { translate } from "i18n/i18n";
import {
	ALL_PAYMENT_CURRENCIES,
	ALL_PAYMENT_METHODS,
	PaymentCurrency,
	PaymentMethod,
} from "models/payment";

import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton, MenuItem, Stack, TextField, Tooltip } from "@mui/material";

export type PaymentRowData = {
	id: number;
	amount: number;
	currency: PaymentCurrency;
	exchangeRate: number;
	method: Exclude<PaymentMethod, "BalanceWithdrawal">;
	reference?: string;
};

interface Props {
	isRemovable: boolean;
	row: PaymentRowData;
	maxAmount?: number;
	availableMethod?: PaymentMethod[];
	onUpdate: (id: number, patch: Partial<PaymentRowData>) => void;
	onRemove: (id: number) => void;
}

const PaymentRow: React.FC<Props> = ({
	isRemovable,
	row,
	maxAmount,
	availableMethod = ALL_PAYMENT_METHODS,
	onUpdate,
	onRemove,
}) => {
	const isAccountBalance = row.method === "AccountBalance";

	const handleAmountChange = (raw: string) =>
		onUpdate(row.id, { amount: Math.max(0, Number(raw)) });

	const handleMethodChange = (next: PaymentMethod) => {
		if (next === "AccountBalance") {
			onUpdate(row.id, {
				method: next,
				currency: "UZS",
				exchangeRate: 1,
			});
		} else {
			onUpdate(row.id, { method: next });
		}
	};

	return (
		<Stack direction="row" spacing={1} alignItems="flex-start">
			<NumericField
				size="small"
				label={translate("payment.amount")}
				value={row.amount}
				fullWidth
				min={0}
				max={maxAmount}
				step={1000}
				onChange={(e) => handleAmountChange(e.target.value)}
			/>

			<TextField
				select
				size="small"
				fullWidth
				label={translate("payment.method")}
				value={row.method}
				onChange={(e) => handleMethodChange(e.target.value as PaymentMethod)}
			>
				{availableMethod.map((m) => (
					<MenuItem key={m} value={m}>
						{translate(`payment.method.${m}`)}
					</MenuItem>
				))}
			</TextField>

			<TextField
				select
				size="small"
				fullWidth
				disabled={isAccountBalance}
				label={translate("fieldCurrency")}
				value={row.currency}
				onChange={(e) =>
					onUpdate(row.id, {
						currency: e.target.value as PaymentCurrency,
						exchangeRate: e.target.value === "UZS" ? 1 : row.exchangeRate,
					})
				}
			>
				{ALL_PAYMENT_CURRENCIES.map((c) => (
					<MenuItem key={c} value={c}>
						{c}
					</MenuItem>
				))}
			</TextField>

			<NumericField
				size="small"
				fullWidth
				disabled={isAccountBalance || row.currency === "UZS"}
				label={translate("payment.exchangeRate")}
				value={row.exchangeRate}
				min={0}
				step={0.0001}
				onChange={(e) => onUpdate(row.id, { exchangeRate: Number(e.target.value) })}
			/>

			{isRemovable && (
				<Tooltip title={translate("delete")}>
					<IconButton onClick={() => onRemove(row.id)} color="error">
						<DeleteIcon />
					</IconButton>
				</Tooltip>
			)}
		</Stack>
	);
};

export default PaymentRow;
