import React from "react";
import { useTranslation } from "react-i18next";
import FormFieldLabel from "components/shared/Forms/FormFieldLabel";
import MoneyField from "components/shared/Inputs/MoneyField";
import { TenderPayment } from "hooks/transactions/useTransactionEntry";
import { Wallet } from "models/wallet";
import { TransactionDirection } from "utils/transactionUtils";

import { Box, ButtonBase } from "@mui/material";

import { POS_CARD_PADDING } from "../posStyles";
import WalletPicker from "../WalletPicker";
import { summaryTextButtonSx } from "./styles";

interface PaymentTenderProps {
	direction: TransactionDirection;
	wallets: Wallet[];
	pay: TenderPayment;
	total: number;
	setPay: (pay: TenderPayment) => void;
}

/** The POS tender: which wallet the money goes through and how much, with «Вся сумма» to pay the total. */
const PaymentTender: React.FC<PaymentTenderProps> = ({
	direction,
	wallets,
	pay,
	total,
	setPay,
}) => {
	const { t } = useTranslation();
	const label = t(`transaction.new.pay.label.${direction}`);

	return (
		<Box
			sx={{
				p: POS_CARD_PADDING,
				pt: 0,
				display: "flex",
				flexDirection: "column",
				gap: "6px",
			}}
		>
			<FormFieldLabel label={label} />
			<Box sx={{ display: "flex", gap: "8px" }}>
				<Box sx={{ flex: 1, minWidth: 0 }}>
					<WalletPicker
						value={pay.walletId}
						wallets={wallets}
						onChange={(id) => setPay({ ...pay, walletId: id })}
					/>
				</Box>
				<MoneyField
					value={pay.amount}
					onChange={(amount) => setPay({ ...pay, amount })}
					placeholder="0"
					sx={{
						flex: 1,
						minWidth: 0,
						// Tight side padding: a seven-figure tender has to fit beside «UZS» in the rail.
						"& .MuiOutlinedInput-root": { px: "10px" },
						"& .MuiOutlinedInput-input": { px: 0 },
					}}
					slotProps={{ htmlInput: { "aria-label": label } }}
				/>
			</Box>
			<Box sx={{ display: "flex", justifyContent: "flex-end" }}>
				<ButtonBase
					onClick={() => setPay({ ...pay, amount: total })}
					sx={{ ...summaryTextButtonSx, fontSize: 12 }}
				>
					{t("transaction.new.pay.fillAll")}
				</ButtonBase>
			</Box>
		</Box>
	);
};

export default PaymentTender;
