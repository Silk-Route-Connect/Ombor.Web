import React from "react";
import { useTranslation } from "react-i18next";
import MoneyInputBase from "components/shared/Inputs/MoneyInputBase";
import UzsUnit from "components/shared/Money/UzsUnit";
import { TenderPayment } from "hooks/transactions/useTransactionEntry";
import { Wallet } from "models/wallet";
import { designTokens, numericSx } from "theme";
import { TransactionDirection } from "utils/transactionUtils";

import { Box, ButtonBase, Typography } from "@mui/material";

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

	return (
		<Box sx={{ p: "0 18px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
			<Typography sx={{ fontSize: 13, fontWeight: 700, color: designTokens.gray700 }}>
				{t(`transaction.new.pay.label.${direction}`)}
			</Typography>
			<Box sx={{ display: "flex", gap: "8px", alignItems: "stretch" }}>
				<Box sx={{ flex: 3, minWidth: 0 }}>
					<WalletPicker
						value={pay.walletId}
						wallets={wallets}
						onChange={(id) => setPay({ ...pay, walletId: id })}
					/>
				</Box>
				<Box
					sx={{
						flex: 2,
						minWidth: 0,
						display: "flex",
						alignItems: "center",
						gap: "6px",
						px: "12px",
						border: "1px solid",
						borderColor: designTokens.gray300,
						borderRadius: "8px",
						bgcolor: "background.paper",
						"&:focus-within": { borderColor: "primary.main" },
					}}
				>
					<MoneyInputBase
						value={pay.amount}
						onChange={(amount) => setPay({ ...pay, amount })}
						placeholder="0"
						inputProps={{ "aria-label": t(`transaction.new.pay.label.${direction}`) }}
						sx={{
							flex: 1,
							...numericSx,
							fontWeight: 700,
							"& input": { textAlign: "right", p: 0 },
						}}
					/>
					<UzsUnit />
				</Box>
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
