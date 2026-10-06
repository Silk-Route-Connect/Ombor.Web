import React from "react";
import { useTranslation } from "react-i18next";
import UzsUnit from "components/shared/Money/UzsUnit";
import { PaymentPartnerRef } from "models/payment";
import { designTokens, numericSx, radius } from "theme";
import { formatCurrency } from "utils/formatCurrency";
import { formatPartnerBalance, partnerBalanceColor } from "utils/partnerUtils";

import { Box } from "@mui/material";

interface PaymentPartnerSummaryProps {
	partner: PaymentPartnerRef;
	/** Show the advance even at zero — a withdrawal pays it out. */
	showAdvance: boolean;
}

const Dot: React.FC = () => (
	<Box component="span" sx={{ color: designTokens.gray300 }}>
		·
	</Box>
);

/**
 * The picked partner's type, served balance and advance under the partner
 * picker. The balance reads from the partner's side like every partner balance
 * (DR-27): «−…» red when they owe us, «+…» green when we owe them.
 */
const PaymentPartnerSummary: React.FC<PaymentPartnerSummaryProps> = ({ partner, showAdvance }) => {
	const { t } = useTranslation();

	return (
		<Box
			sx={{
				display: "flex",
				alignItems: "center",
				gap: "6px",
				flexWrap: "wrap",
				p: "8px 12px",
				borderRadius: `${radius.md}px`,
				bgcolor: designTokens.gray25,
				border: "1px solid",
				borderColor: "divider",
				typography: "body2",
			}}
		>
			<Box component="span" sx={{ color: "text.secondary" }}>
				{t(`payment.partnerType.${partner.type}`)}
			</Box>
			<Dot />
			<Box component="span" sx={{ color: "text.secondary" }}>
				{t("payment.form.balance")}
			</Box>
			<Box
				component="span"
				sx={{
					...numericSx,
					fontWeight: 700,
					color: partnerBalanceColor(partner.balance),
				}}
			>
				{formatPartnerBalance(partner.balance)}
				<UzsUnit />
			</Box>
			{showAdvance && (
				<>
					<Dot />
					<Box component="span" sx={{ color: "text.secondary" }}>
						{t("payment.form.advance")}
					</Box>
					<Box component="span" sx={{ ...numericSx, fontWeight: 700 }}>
						{formatCurrency(partner.advance)}
						<UzsUnit />
					</Box>
				</>
			)}
		</Box>
	);
};

export default PaymentPartnerSummary;
