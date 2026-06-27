import React from "react";
import { useTranslation } from "react-i18next";
import { PaymentDirection, PaymentType } from "models/payment";
import { chipTokens, designTokens } from "theme";

import { Box } from "@mui/material";

/**
 * Per-type presentation for payments, mirroring the bundle's `.ptbadge` colors:
 * Оплата (teal) · Депозит (blue) · Вывод (saffron) · Зарплата (purple) · Общий
 * (gray). The label key resolves to the Russian type name. Shared by the list,
 * detail and create modal.
 */
export const PAYMENT_TYPE_META: Record<
	PaymentType,
	{ labelKey: string; bg: string; color: string; border: string }
> = {
	Transaction: {
		labelKey: "payment.type.transaction",
		bg: designTokens.primarySoft,
		color: "#12676B",
		border: designTokens.primaryLine,
	},
	Deposit: {
		labelKey: "payment.type.deposit",
		bg: designTokens.infoBg,
		color: "#2A6F97",
		border: designTokens.infoBorder,
	},
	Withdrawal: {
		labelKey: "payment.type.withdrawal",
		bg: designTokens.accentSoft,
		color: designTokens.saffron700,
		border: designTokens.saffronBadgeBorder,
	},
	Payroll: {
		labelKey: "payment.type.payroll",
		bg: designTokens.purpleBg,
		color: designTokens.purpleText,
		border: designTokens.purpleBorder,
	},
	General: {
		labelKey: "payment.type.general",
		bg: designTokens.gray100,
		color: designTokens.gray700,
		border: designTokens.gray200,
	},
};

/** Colored type pill (the `.ptbadge`). */
export const PaymentTypeBadge: React.FC<{ type: PaymentType }> = ({ type }) => {
	const { t } = useTranslation();
	const meta = PAYMENT_TYPE_META[type];
	return (
		<Box
			component="span"
			sx={{
				display: "inline-flex",
				alignItems: "center",
				fontSize: 11.5,
				fontWeight: 600,
				px: "9px",
				py: "2px",
				borderRadius: "999px",
				whiteSpace: "nowrap",
				border: "1px solid",
				bgcolor: meta.bg,
				color: meta.color,
				borderColor: meta.border,
			}}
		>
			{t(meta.labelKey)}
		</Box>
	);
};

/** Green ↓ Приход / red ↑ Расход pill (the `.dir-badge`), colours from `chipTokens`. */
export const PaymentDirectionBadge: React.FC<{ direction: PaymentDirection }> = ({ direction }) => {
	const { t } = useTranslation();
	const income = direction === "Income";
	const tk = income ? chipTokens.income : chipTokens.expense;
	return (
		<Box
			component="span"
			sx={{
				display: "inline-flex",
				alignItems: "center",
				gap: "5px",
				fontSize: 11.5,
				fontWeight: 600,
				pl: "7px",
				pr: "9px",
				py: "2px",
				borderRadius: "999px",
				whiteSpace: "nowrap",
				border: "1px solid",
				bgcolor: tk.bg,
				color: tk.color,
				borderColor: tk.border,
			}}
		>
			<Box
				component="span"
				sx={{
					...{ fontVariantNumeric: "tabular-nums" },
					fontWeight: 800,
					fontSize: 13,
					lineHeight: 1,
				}}
			>
				{income ? "↓" : "↑"}
			</Box>
			{t(income ? "payment.direction.income" : "payment.direction.expense")}
		</Box>
	);
};
