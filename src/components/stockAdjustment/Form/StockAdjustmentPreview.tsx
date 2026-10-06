import React from "react";
import { useTranslation } from "react-i18next";
import { AdjustmentDirection } from "models/stockAdjustment";
import { designTokens, numericSx, radius } from "theme";
import { formatQuantity } from "utils/formatCurrency";

import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Box } from "@mui/material";

const PREV_CAP = {
	fontSize: 12,
	fontWeight: 600,
	color: "text.secondary",
	letterSpacing: "0.01em",
} as const;
const PREV_NUM = {
	...numericSx,
	fontWeight: 700,
	fontSize: 21,
	letterSpacing: "-0.01em",
	lineHeight: 1.1,
	color: "text.primary",
} as const;
const PREV_SEG = {
	p: "13px 16px",
	display: "flex",
	flexDirection: "column",
	gap: "3px",
	minWidth: 0,
} as const;
const PREV_ARROW = {
	display: "grid",
	placeItems: "center",
	px: "4px",
	color: "text.disabled",
	bgcolor: "background.paper",
} as const;

const PrevUnit: React.FC<{ children: React.ReactNode }> = ({ children }) => (
	<Box component="span" sx={{ fontSize: 12, fontWeight: 600, color: "text.disabled", ml: "5px" }}>
		{children}
	</Box>
);

/**
 * «Остаток после операции» live preview (ADJ-4, DSN-3 D2): Текущий → Корректировка
 * → После операции as one connected strip with a tinted result cell; the result
 * shows the resulting balance (the negative number on a below-zero списание, with
 * the «Ниже нуля» cap + error tint). A dashed skeleton stands in until a product
 * and a positive quantity are entered.
 */
export const StockAdjustmentPreview: React.FC<{
	unit: string;
	avail: number;
	direction: AdjustmentDirection;
	quantity: number;
	afterBalance: number;
	overStock: boolean;
	hasInput: boolean;
}> = ({ unit, avail, direction, quantity, afterBalance, overStock, hasInput }) => {
	const { t } = useTranslation();

	if (!hasInput) {
		return (
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					gap: "10px",
					p: "15px 16px",
					border: "1px dashed",
					borderColor: designTokens.gray300,
					borderRadius: `${radius.md}px`,
					bgcolor: designTokens.bgSubtle,
					fontSize: 13,
					color: "text.disabled",
				}}
			>
				<InfoOutlinedIcon sx={{ fontSize: 15, flex: "0 0 auto" }} />
				{t("adjustment.form.previewHint")}
			</Box>
		);
	}

	const isDown = direction === "Decrease";

	return (
		<Box
			sx={{
				display: "grid",
				gridTemplateColumns: "1fr auto 1fr auto 1fr",
				alignItems: "stretch",
				border: "1px solid",
				borderColor: overStock ? designTokens.errorBorder : "divider",
				borderRadius: `${radius.md}px`,
				overflow: "hidden",
				bgcolor: "background.paper",
			}}
		>
			<Box sx={PREV_SEG}>
				<Box sx={PREV_CAP}>{t("adjustment.form.previewCurrent")}</Box>
				<Box sx={PREV_NUM}>
					{formatQuantity(avail)}
					<PrevUnit>{unit}</PrevUnit>
				</Box>
			</Box>
			<Box sx={PREV_ARROW}>
				<ChevronRightIcon sx={{ fontSize: 18 }} />
			</Box>
			<Box sx={PREV_SEG}>
				<Box sx={PREV_CAP}>{t("adjustment.form.previewChange")}</Box>
				<Box sx={{ ...PREV_NUM, color: isDown ? "error.main" : "success.main" }}>
					{isDown ? "−" : "+"}
					{formatQuantity(quantity)}
					<PrevUnit>{unit}</PrevUnit>
				</Box>
			</Box>
			<Box sx={PREV_ARROW}>
				<ChevronRightIcon sx={{ fontSize: 18 }} />
			</Box>
			<Box sx={{ ...PREV_SEG, bgcolor: overStock ? designTokens.errorBg : designTokens.gray25 }}>
				<Box sx={{ ...PREV_CAP, color: overStock ? "error.main" : "text.secondary" }}>
					{overStock ? t("adjustment.form.previewNegative") : t("adjustment.form.previewAfter")}
				</Box>
				<Box sx={{ ...PREV_NUM, color: overStock ? "error.main" : "primary.main" }}>
					{formatQuantity(afterBalance)}
					<PrevUnit>{unit}</PrevUnit>
				</Box>
			</Box>
		</Box>
	);
};

export default StockAdjustmentPreview;
