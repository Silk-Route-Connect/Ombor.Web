import React from "react";
import { useTranslation } from "react-i18next";
import PartnerBalanceTooltip from "components/partner/Tooltips/PartnerBalanceTooltip";
import { PartnerBalance } from "models/partner";

import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import { Stack, Tooltip, Typography } from "@mui/material";

interface PaymentHeaderProps {
	balance: PartnerBalance | null;
	mustUseAccountBalance: boolean;
}

const PaymentHeader: React.FC<PaymentHeaderProps> = ({ balance, mustUseAccountBalance }) => {
	const { t } = useTranslation();

	return (
		<Stack direction="row" alignItems="center" justifyContent="space-between">
			<Typography variant="h6" color="text.secondary">
				{t("payment.partnerBalanceBefore")}
			</Typography>

			<Stack direction="row" alignItems="center" spacing={0.5}>
				{mustUseAccountBalance && (
					<Tooltip
						title={t("payment.mustUseBalanceWarning")}
						aria-label={t("payment.mustUseBalanceWarning")}
						arrow
					>
						<ReportProblemOutlinedIcon
							fontSize="medium"
							color="warning"
							sx={{ cursor: "pointer" }}
						/>
					</Tooltip>
				)}

				<PartnerBalanceTooltip balance={balance} />
			</Stack>
		</Stack>
	);
};

export default PaymentHeader;
