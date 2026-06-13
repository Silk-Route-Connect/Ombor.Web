import React from "react";
import { useTranslation } from "react-i18next";
import { TransactionType } from "models/transaction";
import { designTokens } from "theme";

import { alpha, Chip, useTheme } from "@mui/material";

/** Chip tones per the bundle's TXN_TONE: sale success, supply info, refunds neutral. */
const isNeutral = (kind: TransactionType) => kind === "SaleRefund" || kind === "SupplyRefund";

export const TransactionKindChip: React.FC<{ kind: TransactionType }> = ({ kind }) => {
	const { t } = useTranslation();
	const theme = useTheme();

	const palette =
		kind === "Sale"
			? { bg: alpha(theme.palette.success.main, 0.12), color: theme.palette.success.main }
			: kind === "Supply"
				? { bg: alpha(theme.palette.info.main, 0.12), color: theme.palette.info.main }
				: { bg: designTokens.gray100, color: designTokens.gray700 };

	return (
		<Chip
			label={t(`product.txn.${kind}`)}
			size="small"
			sx={{
				height: 22,
				fontSize: 12,
				fontWeight: 600,
				bgcolor: palette.bg,
				color: palette.color,
				border: isNeutral(kind) ? "1px solid" : "none",
				borderColor: isNeutral(kind) ? designTokens.gray200 : undefined,
			}}
		/>
	);
};

export default TransactionKindChip;
