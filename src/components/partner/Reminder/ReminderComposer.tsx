import React from "react";
import { useTranslation } from "react-i18next";
import FormField from "components/shared/Forms/FormField";
import { formatDate } from "utils/dateUtils";
import { DebtReminderFacts, telegramUsername } from "utils/debtReminder";
import { formatCurrency } from "utils/formatCurrency";
import { formatUzPhone } from "utils/phoneUtils";

import { Box, TextField, Typography } from "@mui/material";

interface ReminderComposerProps {
	facts: DebtReminderFacts;
	text: string;
	/** The text was emptied and a send / copy was tried. */
	empty: boolean;
	onTextChange: (text: string) => void;
}

/**
 * The reminder's body: what is owed since when, to whom it goes, and the ready,
 * editable text. Its ways out — copy, SMS, Telegram — live in the dialog footer.
 */
export const ReminderComposer: React.FC<ReminderComposerProps> = ({
	facts,
	text,
	empty,
	onTextChange,
}) => {
	const { t } = useTranslation();

	const phone = facts.partner.phoneNumbers[0];
	const username = telegramUsername(facts.partner.telegram);
	const recipients = [phone && formatUzPhone(phone), username && `@${username}`].filter(Boolean);

	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
			<Box>
				<Typography sx={{ fontSize: 14, fontWeight: 600 }}>
					{t("partner.reminder.summary", {
						amount: `${formatCurrency(facts.amount)} ${t("common.unit.uzs")}`,
					})}
					{facts.oldestDate &&
						` · ${t("partner.reminder.since", { date: formatDate(facts.oldestDate) })}`}
				</Typography>
				<Typography sx={{ fontSize: 13, color: "text.secondary", mt: "4px" }}>
					{recipients.length > 0
						? t("partner.reminder.to", { recipients: recipients.join(" · ") })
						: t("partner.reminder.noContacts")}
				</Typography>
			</Box>
			<FormField label={t("partner.reminder.textLabel")}>
				<TextField
					multiline
					fullWidth
					minRows={7}
					value={text}
					onChange={(e) => onTextChange(e.target.value)}
					error={empty}
					helperText={empty ? t("partner.reminder.emptyText") : t("partner.reminder.hint")}
				/>
			</FormField>
		</Box>
	);
};

export default ReminderComposer;
