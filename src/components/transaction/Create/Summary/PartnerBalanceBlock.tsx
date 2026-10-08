import React from "react";
import { useTranslation } from "react-i18next";
import EntityAvatar from "components/shared/EntityAvatar/EntityAvatar";
import UzsUnit from "components/shared/Money/UzsUnit";
import { Partner } from "models/partner";
import { designTokens, numericSx } from "theme";
import { formatCurrency } from "utils/formatCurrency";
import { TransactionDirection } from "utils/transactionUtils";

import NorthEastIcon from "@mui/icons-material/NorthEast";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { Box, Typography } from "@mui/material";

import { POS_CARD_PADDING } from "../posStyles";
import { balancePresentation } from "../saleBalance";

interface PartnerBalanceBlockProps {
	direction: TransactionDirection;
	partner: Partner | null;
	/** Projected balance once this document is booked (company-POV sign). */
	balanceAfter: number;
	showAfter: boolean;
}

/**
 * Top of the POS summary: the partner's served balance as colour + words (never a
 * sign) and, once the cart has lines, the balance this document leaves behind.
 */
const PartnerBalanceBlock: React.FC<PartnerBalanceBlockProps> = ({
	direction,
	partner,
	balanceAfter,
	showAfter,
}) => {
	const { t } = useTranslation();

	if (!partner) {
		return (
			<Box
				sx={{
					p: POS_CARD_PADDING,
					borderBottom: "1px solid",
					borderColor: "divider",
					bgcolor: designTokens.bgSubtle,
					display: "flex",
					alignItems: "center",
					gap: "12px",
					color: "text.secondary",
					fontSize: 13,
				}}
			>
				<PersonOutlineIcon sx={{ fontSize: 18, color: "text.disabled" }} />
				{t(`transaction.new.balance.pickPartner.${direction}`)}
			</Box>
		);
	}

	const tone = balancePresentation(partner.balance);
	const afterTone = balancePresentation(balanceAfter);

	return (
		<Box sx={{ p: POS_CARD_PADDING, borderBottom: "1px solid", borderColor: "divider" }}>
			<Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
				<EntityAvatar name={partner.name} size={40} />
				<Box sx={{ minWidth: 0 }}>
					<Typography variant="h3" component="p" noWrap>
						{partner.name}
					</Typography>
					{partner.companyName && (
						<Typography sx={{ fontSize: 12, color: "text.secondary" }} noWrap>
							{partner.companyName}
						</Typography>
					)}
				</Box>
			</Box>
			<Box sx={{ mt: "12px" }}>
				<Typography variant="caption" component="p" sx={{ color: "text.secondary" }}>
					{t(tone.labelKey)}
				</Typography>
				<Typography
					sx={{ ...numericSx, fontSize: 20, fontWeight: 700, color: tone.color, lineHeight: 1.1 }}
				>
					{formatCurrency(Math.abs(partner.balance))}
					<UzsUnit />
				</Typography>
			</Box>
			{showAfter && (
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						mt: "12px",
						pt: "12px",
						borderTop: "1px dashed",
						borderColor: "divider",
					}}
				>
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							gap: "6px",
							fontSize: 12,
							color: "text.secondary",
						}}
					>
						<NorthEastIcon sx={{ fontSize: 14, color: "text.disabled" }} />
						{t(`transaction.new.balance.after.${direction}`)}
					</Box>
					{balanceAfter === 0 ? (
						<Typography sx={{ fontSize: 13, fontWeight: 600, color: "text.secondary" }}>
							{t(afterTone.labelKey)}
						</Typography>
					) : (
						<Typography
							sx={{ ...numericSx, fontWeight: 700, fontSize: 16, color: afterTone.color }}
						>
							{formatCurrency(Math.abs(balanceAfter))}
							<Box
								component="span"
								sx={{ ml: "6px", fontSize: 12, fontWeight: 600, color: "text.secondary" }}
							>
								{t(afterTone.shortKey)}
							</Box>
						</Typography>
					)}
				</Box>
			)}
		</Box>
	);
};

export default PartnerBalanceBlock;
