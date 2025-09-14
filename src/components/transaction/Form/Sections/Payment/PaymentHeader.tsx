import React from "react";
import PartnerBalanceTooltip from "components/partner/Tooltips/PartnerBalanceTooltip";
import { translate } from "i18n/i18n";
import { PartnerBalance } from "models/partner";

import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import { Stack, Tooltip, Typography } from "@mui/material";

interface PaymentHeaderProps {
	balance: PartnerBalance | null;
	mustUseAccountBalance: boolean;
}

const PaymentHeader: React.FC<PaymentHeaderProps> = ({ balance, mustUseAccountBalance }) => (
	<Stack direction="row" alignItems="center" justifyContent="space-between">
		<Typography variant="h6" color="text.secondary">
			{translate("payment.partnerBalanceBefore")}
		</Typography>

		<Stack direction="row" alignItems="center" spacing={0.5}>
			{mustUseAccountBalance && (
				<Tooltip
					title={translate("payment.mustUseBalanceWarning")}
					aria-label={translate("payment.mustUseBalanceWarning")}
					arrow
				>
					<ReportProblemOutlinedIcon fontSize="medium" color="warning" sx={{ cursor: "pointer" }} />
				</Tooltip>
			)}

			<PartnerBalanceTooltip balance={balance} />
		</Stack>
	</Stack>
);

export default PaymentHeader;
