import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import GhostButton from "components/shared/Buttons/GhostButton";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { designTokens } from "theme";
import { formatDate } from "utils/dateUtils";
import {
	buildDebtReminderText,
	DebtReminderFacts,
	ReminderChannel,
	telegramUsername,
} from "utils/debtReminder";
import { formatCurrency } from "utils/formatCurrency";
import { formatUzPhone } from "utils/phoneUtils";

import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import SmsOutlinedIcon from "@mui/icons-material/SmsOutlined";
import TelegramIcon from "@mui/icons-material/Telegram";
import { DialogActions, DialogContent, TextField, Typography } from "@mui/material";

interface ReminderComposerProps {
	facts: DebtReminderFacts;
	onCopy: (text: string) => void;
	onSend: (channel: ReminderChannel, text: string) => void;
	onClose: () => void;
}

/**
 * The reminder text (ready, editable) with its three ways out: copy it, open
 * Telegram (the partner's chat when the username is known) or the phone's SMS
 * app. An emptied text is flagged on the field, never sent.
 */
export const ReminderComposer: React.FC<ReminderComposerProps> = ({
	facts,
	onCopy,
	onSend,
	onClose,
}) => {
	const { t } = useTranslation();
	const [text, setText] = useState(() => buildDebtReminderText(t, facts));
	const [empty, setEmpty] = useState(false);

	if (facts.amount <= 0) {
		return (
			<>
				<DialogContent>
					<Typography sx={{ fontSize: 14 }}>
						{t("partner.reminder.nothingOwed", { name: facts.partner.name })}
					</Typography>
				</DialogContent>
				<DialogActions sx={{ px: "24px", py: "14px" }}>
					<GhostButton onClick={onClose}>{t("common.close")}</GhostButton>
				</DialogActions>
			</>
		);
	}

	const withText = (action: (value: string) => void) => () => {
		const value = text.trim();
		setEmpty(value === "");
		if (value) {
			action(value);
		}
	};

	const phone = facts.partner.phoneNumbers[0];
	const username = telegramUsername(facts.partner.telegram);
	const recipients = [phone && formatUzPhone(phone), username && `@${username}`].filter(Boolean);

	return (
		<>
			<DialogContent>
				<Typography sx={{ fontSize: 14, fontWeight: 600 }}>
					{t("partner.reminder.summary", {
						amount: `${formatCurrency(facts.amount)} ${t("common.unit.uzs")}`,
					})}
					{facts.oldestDate &&
						` · ${t("partner.reminder.since", { date: formatDate(facts.oldestDate) })}`}
				</Typography>
				<Typography sx={{ fontSize: 13, color: "text.secondary", mt: "4px", mb: "14px" }}>
					{recipients.length > 0
						? t("partner.reminder.to", { recipients: recipients.join(" · ") })
						: t("partner.reminder.noContacts")}
				</Typography>
				<TextField
					multiline
					fullWidth
					minRows={7}
					value={text}
					onChange={(e) => {
						setText(e.target.value);
						setEmpty(false);
					}}
					label={t("partner.reminder.textLabel")}
					error={empty}
					helperText={empty ? t("partner.reminder.emptyText") : t("partner.reminder.hint")}
				/>
			</DialogContent>
			<DialogActions
				sx={{
					px: "24px",
					py: "14px",
					gap: "10px",
					flexWrap: "wrap",
					borderTop: "1px solid",
					borderColor: "divider",
					bgcolor: designTokens.gray25,
				}}
			>
				<GhostButton icon={<ContentCopyOutlinedIcon />} onClick={withText(onCopy)}>
					{t("common.copy")}
				</GhostButton>
				<GhostButton icon={<SmsOutlinedIcon />} onClick={withText((v) => onSend("sms", v))}>
					{t("partner.reminder.sms")}
				</GhostButton>
				<PrimaryButton icon={<TelegramIcon />} onClick={withText((v) => onSend("telegram", v))}>
					{t("partner.reminder.telegram")}
				</PrimaryButton>
			</DialogActions>
		</>
	);
};

export default ReminderComposer;
