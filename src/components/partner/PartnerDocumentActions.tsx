import React from "react";
import { ActionMenuRow } from "components/shared/ActionMenuCell/MenuActionCell";
import { TFunction } from "i18next";

import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";

interface PartnerDocumentHandlers {
	/** The partner owes us — only then is there a debt to remind about. */
	owesUs: boolean;
	onRemind: () => void;
	onStatement: () => void;
}

/**
 * The partner's paperwork rows — «Напомнить о долге» (when they owe us) and
 * «Акт сверки» — shared by the partner detail ⋮ and the Debts by-partner row ⋮.
 */
export function buildPartnerDocumentRows(
	t: TFunction,
	{ owesUs, onRemind, onStatement }: PartnerDocumentHandlers,
): ActionMenuRow[] {
	const rows: ActionMenuRow[] = [];
	if (owesUs) {
		rows.push({
			key: "remind",
			label: t("partner.reminder.action"),
			icon: <NotificationsActiveOutlinedIcon fontSize="small" />,
			onClick: onRemind,
		});
	}
	rows.push({
		key: "statement",
		label: t("partner.statement.action"),
		icon: <ReceiptLongOutlinedIcon fontSize="small" />,
		onClick: onStatement,
	});
	return rows;
}
