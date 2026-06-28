import React from "react";
import { useTranslation } from "react-i18next";
import { PaymentRecord } from "models/payment";
import { designTokens, numericSx } from "theme";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Box, ButtonBase, Typography } from "@mui/material";

interface PaymentDetailHeaderProps {
	payment: PaymentRecord;
	onBack: () => void;
}

/**
 * Payment detail header per the bundle (final iteration): a bordered back chevron
 * and a minimal title «P-520 · Платёж» — all other metadata lives in the
 * «Информация» card. Followed by the immutability
 * strip (payments are immutable — rule 1). No actions: reverse payment is not in
 * MVP, and there are no edit/delete affordances.
 */
export const PaymentDetailHeader: React.FC<PaymentDetailHeaderProps> = ({ payment, onBack }) => {
	const { t } = useTranslation();

	return (
		<>
			<Box sx={{ display: "flex", alignItems: "center", gap: "14px", mb: "20px" }}>
				<ButtonBase
					onClick={onBack}
					aria-label={t("payment.detail.back")}
					sx={{
						width: 40,
						height: 40,
						flex: "0 0 auto",
						borderRadius: "8px",
						border: "1px solid",
						borderColor: designTokens.gray300,
						bgcolor: "background.paper",
						color: designTokens.gray700,
						"&:hover": { bgcolor: designTokens.gray50, borderColor: designTokens.gray400 },
					}}
				>
					<ChevronLeftIcon sx={{ fontSize: 20 }} />
				</ButtonBase>
				<Typography
					component="h1"
					sx={{
						fontSize: 24,
						fontWeight: 800,
						letterSpacing: "-0.02em",
						lineHeight: 1.2,
						...numericSx,
					}}
				>
					{payment.number}
					<Box
						component="span"
						sx={{ fontSize: 18, fontWeight: 600, color: "text.secondary", ml: "6px" }}
					>
						· {t("payment.detail.subtitle")}
					</Box>
				</Typography>
			</Box>

			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					gap: "9px",
					mb: "20px",
					p: "10px 14px",
					borderRadius: "8px",
					bgcolor: designTokens.infoBg,
					border: "1px solid",
					borderColor: designTokens.infoBorder,
					fontSize: 12.5,
					color: "info.main",
					lineHeight: 1.45,
				}}
			>
				<InfoOutlinedIcon sx={{ fontSize: 15, flex: "0 0 auto" }} />
				{t("payment.detail.immutable")}
			</Box>
		</>
	);
};

export default PaymentDetailHeader;
