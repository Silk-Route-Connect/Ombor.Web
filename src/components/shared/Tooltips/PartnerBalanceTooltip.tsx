import React, { useMemo } from "react";
import { Box, Stack, Tooltip, Typography } from "@mui/material";
import { translate } from "i18n/i18n";
import { PartnerBalance } from "models/partner";
import { formatNumberWithCommas } from "utils/formatCurrency";

interface PartnerBalanceTooltipProps {
	balance: PartnerBalance | null;
}

const getColor = (amount: number) => {
	if (amount === 0) return "text.secondary";
	return amount > 0 ? "success.main" : "error.main";
};

const PartnerBalanceTooltip: React.FC<PartnerBalanceTooltipProps> = ({ balance }) => {
	const hasDetails = useMemo(() => {
		if (!balance) return false;

		return (
			balance.partnerAdvance > 0 ||
			balance.companyAdvance > 0 ||
			balance.payableDebt > 0 ||
			balance.receivableDebt > 0
		);
	}, [balance]);

	const tooltipContent = useMemo(() => {
		if (!balance) return <></>;

		const items: { label: string; amount: number }[] = [];

		if (balance.partnerAdvance > 0)
			items.push({
				label: translate("partner.partnerAdvance"),
				amount: balance.partnerAdvance,
			});

		if (balance.companyAdvance > 0)
			items.push({
				label: translate("partner.companyAdvance"),
				amount: balance.companyAdvance,
			});

		if (balance.payableDebt > 0)
			items.push({
				label: translate("partner.payableDebt"),
				amount: balance.payableDebt,
			});

		if (balance.receivableDebt > 0)
			items.push({
				label: translate("partner.receivableDebt"),
				amount: balance.receivableDebt,
			});

		return (
			<Stack spacing={0.5} sx={{ p: 1 }}>
				{items.map(({ label, amount }) => (
					<Typography key={label} variant="body2" color="white">
						{label}: {amount.toLocaleString()}
					</Typography>
				))}
			</Stack>
		);
	}, [balance]);

	if (!balance) {
		return (
			<Typography variant="h5" component="span" color="text.secondary">
				0
			</Typography>
		);
	}

	return hasDetails ? (
		<Tooltip
			title={tooltipContent}
			aria-label={translate("partner.balanceDetails")}
			arrow
			placement="bottom"
		>
			<Box component="span" sx={{ cursor: "pointer", textDecoration: "underline" }}>
				<Typography variant="h5" component="span" color={getColor(balance.total)}>
					{formatNumberWithCommas(balance.total)}
				</Typography>
			</Box>
		</Tooltip>
	) : (
		<Typography variant="h5" component="span" color={getColor(balance.total)}>
			{formatNumberWithCommas(balance.total)}
		</Typography>
	);
};

export default PartnerBalanceTooltip;
