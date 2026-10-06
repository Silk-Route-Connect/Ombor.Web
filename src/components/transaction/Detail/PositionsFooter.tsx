import React from "react";
import { useTranslation } from "react-i18next";
import UzsUnit from "components/shared/Money/UzsUnit";
import { TransactionLine } from "models/transaction";
import { designTokens, numericSx } from "theme";
import { formatCurrency } from "utils/formatCurrency";

import { Box } from "@mui/material";

/** Refund summary under the lines: positions returned and the refunded amount (unsigned). */
export const RefundFooter: React.FC<{ lines: TransactionLine[] }> = ({ lines }) => {
	const { t } = useTranslation();
	const total = lines.reduce((s, l) => s + l.total, 0);
	return (
		<Box
			sx={{
				p: "14px 18px",
				display: "flex",
				flexDirection: "column",
				gap: "10px",
				bgcolor: designTokens.gray25,
				borderTop: 1,
				borderColor: "divider",
			}}
		>
			<Box sx={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
				<Box component="span" sx={{ color: "text.secondary" }}>
					{t("transaction.detail.positionsToRefund")}
				</Box>
				<Box component="span" sx={{ ...numericSx, fontWeight: 600 }}>
					{lines.length}
				</Box>
			</Box>
			<Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
				<Box component="span" sx={{ fontSize: 15, fontWeight: 700 }}>
					{t("transaction.detail.refundAmount")}
				</Box>
				<Box component="span" sx={{ ...numericSx, fontSize: 20, fontWeight: 700 }}>
					{formatCurrency(total)}
					<UzsUnit />
				</Box>
			</Box>
		</Box>
	);
};

export default RefundFooter;
