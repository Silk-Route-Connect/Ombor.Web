import React from "react";
import { useTranslation } from "react-i18next";
import { designTokens, numericSx } from "theme";
import { TransactionDirection } from "utils/transactionUtils";

import { Box, Typography } from "@mui/material";

/** ⌘ on macOS, Ctrl elsewhere — matches the Topbar's ⌘K convention. */
const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
const MOD = isMac ? "⌘" : "Ctrl";

/** A single keycap chip, styled like the bundle's `<kbd>`. */
const Kbd: React.FC<{ children: React.ReactNode }> = ({ children }) => (
	<Box
		component="kbd"
		sx={{
			...numericSx,
			display: "inline-flex",
			alignItems: "center",
			justifyContent: "center",
			minWidth: 20,
			height: 20,
			px: "6px",
			fontSize: 11,
			fontWeight: 600,
			lineHeight: 1,
			color: designTokens.gray700,
			bgcolor: "background.paper",
			border: "1px solid",
			borderColor: designTokens.gray300,
			borderRadius: "5px",
			boxShadow: "0 1px 0 rgba(22,42,43,.08)",
		}}
	>
		{children}
	</Box>
);

const Hint: React.FC<{ keys: React.ReactNode[]; label: string }> = ({ keys, label }) => (
	<Box sx={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
		{keys.map((k, i) => (
			<React.Fragment key={i}>
				{i > 0 && (
					<Box component="span" sx={{ color: "text.disabled", fontSize: 11 }}>
						+
					</Box>
				)}
				<Kbd>{k}</Kbd>
			</React.Fragment>
		))}
		<Typography component="span" sx={{ fontSize: 12, color: "text.secondary", ml: "2px" }}>
			{label}
		</Typography>
	</Box>
);

/**
 * Discoverable shortcut legend for the POS New Sale screen — surfaces the
 * keyboard-first rapid-entry loop so users find it without trial and error.
 */
export const KeyboardHints: React.FC<{ direction: TransactionDirection }> = ({ direction }) => {
	const { t } = useTranslation();
	return (
		<Box
			sx={{
				display: "flex",
				alignItems: "center",
				gap: "16px",
				flexWrap: "wrap",
				px: "2px",
				color: "text.secondary",
			}}
		>
			<Hint keys={["↑", "↓"]} label={t("transaction.new.kbd.qty")} />
			<Hint keys={["Enter"]} label={t("transaction.new.kbd.next")} />
			<Hint keys={[MOD, "Enter"]} label={t("transaction.new.kbd.submit")} />
			<Hint keys={["Alt", "P"]} label={t(`transaction.new.kbd.partner.${direction}`)} />
			<Hint keys={["Esc"]} label={t("transaction.new.kbd.leave")} />
		</Box>
	);
};

export default KeyboardHints;
