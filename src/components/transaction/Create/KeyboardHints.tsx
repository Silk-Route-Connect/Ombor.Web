import React from "react";
import { useTranslation } from "react-i18next";
import KeyHint from "components/shared/Keyboard/KeyHint";
import { TransactionDirection } from "utils/transactionUtils";

import { Box } from "@mui/material";

/** ⌘ on macOS, Ctrl elsewhere — the legend names the key the user actually presses. */
const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
const MOD = isMac ? "⌘" : "Ctrl";

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
			<KeyHint keys={["↑", "↓"]} label={t("transaction.new.kbd.qty")} />
			<KeyHint keys={["Enter"]} label={t("transaction.new.kbd.next")} />
			<KeyHint keys={[MOD, "Enter"]} label={t("transaction.new.kbd.submit")} />
			<KeyHint keys={["Alt", "P"]} label={t(`transaction.new.kbd.partner.${direction}`)} />
			<KeyHint keys={["Esc"]} label={t("transaction.new.kbd.leave")} />
		</Box>
	);
};

export default KeyboardHints;
