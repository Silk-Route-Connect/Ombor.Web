import React from "react";
import { useTranslation } from "react-i18next";
import DetailCard, { detailCardIconSx } from "components/shared/Detail/DetailCard";
import MetaDot from "components/shared/Detail/MetaDot";
import DateCell from "components/shared/Table/cells/DateCell";
import DocNumberCell from "components/shared/Table/cells/DocNumberCell";
import MoneyCell from "components/shared/Table/cells/MoneyCell";
import { clickableRowProps } from "components/shared/Table/clickableRow";
import WalletLink from "components/wallet/Links/WalletLink";
import { TransactionRecord } from "models/transaction";
import { paymentDetailPath } from "routing/paths";
import { paymentMoneyTone } from "utils/paymentUtils";
import { directionOf, paymentDirectionOf } from "utils/transactionUtils";

import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import { Box } from "@mui/material";

/**
 * The payments that settled this document, in the rail: № · date · wallet over
 * the amount, coloured by the money direction. A row opens its payment.
 */
export const PaymentsCard: React.FC<{
	tx: TransactionRecord;
	onOpenPayment: (paymentId: number) => void;
}> = ({ tx, onOpenPayment }) => {
	const { t } = useTranslation();
	const payments = tx.payments ?? [];
	const tone = paymentMoneyTone(paymentDirectionOf(tx.type));

	return (
		<DetailCard
			title={t("transaction.detail.paymentsTitle")}
			icon={<PaymentsOutlinedIcon sx={detailCardIconSx} />}
			count={payments.length}
		>
			{payments.length === 0 ? (
				<Box sx={{ p: "22px 18px", textAlign: "center", fontSize: 13, color: "text.secondary" }}>
					{t(`transaction.detail.paymentsEmpty.${directionOf(tx.type)}`)}
				</Box>
			) : (
				payments.map((p) => (
					<Box
						key={p.id}
						{...clickableRowProps(() => onOpenPayment(p.paymentId))}
						sx={{
							display: "flex",
							alignItems: "center",
							gap: "12px",
							p: "12px 18px",
							borderBottom: 1,
							borderColor: "divider",
							cursor: "pointer",
							"&:hover": { bgcolor: "action.hover" },
							"&:last-of-type": { borderBottom: "none" },
						}}
					>
						<Box sx={{ flex: 1, minWidth: 0 }}>
							<DocNumberCell number={p.paymentNumber} to={paymentDetailPath(p.paymentId)} />
							<Box
								sx={{
									display: "flex",
									alignItems: "center",
									gap: "7px",
									mt: "2px",
									fontSize: 12,
									flexWrap: "wrap",
								}}
							>
								<DateCell value={p.date} />
								<MetaDot />
								{p.walletId ? (
									<WalletLink id={p.walletId} name={p.walletName} />
								) : (
									<Box component="span" sx={{ color: "text.secondary" }}>
										{p.walletName}
									</Box>
								)}
							</Box>
						</Box>
						<MoneyCell value={p.amount} main tone={tone} />
					</Box>
				))
			)}
		</DetailCard>
	);
};

export default PaymentsCard;
