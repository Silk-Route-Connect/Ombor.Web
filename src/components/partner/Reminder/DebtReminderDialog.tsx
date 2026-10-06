import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import GhostButton from "components/shared/Buttons/GhostButton";
import FormDialog from "components/shared/Dialog/Form/FormDialog";
import FormDialogFooter from "components/shared/Dialog/Form/FormDialogFooter";
import { recordTile } from "components/shared/IconTile/recordTile";
import LoadStateView from "components/shared/LoadState/LoadStateView";
import { isPresent } from "helpers/Loading";
import { observer } from "mobx-react-lite";
import { PATHS } from "routing/paths";
import { useStore } from "stores/StoreContext";

import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import SmsOutlinedIcon from "@mui/icons-material/SmsOutlined";
import TelegramIcon from "@mui/icons-material/Telegram";
import { Typography } from "@mui/material";

import ReminderComposer from "./ReminderComposer";
import { useReminderDraft } from "./useReminderDraft";

/**
 * «Напомнить о долге» modal, opened through `debtReminderStore.open(partnerId)`
 * from the partner detail ⋮ and the Debts «По партнёрам» row ⋮. Mount it once
 * on a page; it closes itself when the page goes away. The text has three ways
 * out: copy it, open the phone's SMS app, or Telegram (the partner's chat when
 * the username is known) — Ombor sends nothing itself.
 */
export const DebtReminderDialog: React.FC = observer(() => {
	const { t } = useTranslation();
	const { debtReminderStore: store } = useStore();
	const state = store.facts;
	const facts = isPresent(state) ? state : null;
	const draft = useReminderDraft(facts, store.isOpen);

	useEffect(() => () => store.close(), [store]);

	let body: React.ReactNode;
	let footer: React.ReactNode;
	if (!isPresent(state)) {
		body = (
			<LoadStateView
				state={state}
				size="section"
				onRetry={store.reload}
				errorTitle={t("partner.reminder.error.load")}
				notFound={{ title: t("partner.detail.notFound"), backTo: PATHS.partners }}
			/>
		);
	} else if (state.amount <= 0) {
		body = (
			<Typography sx={{ fontSize: 14 }}>
				{t("partner.reminder.nothingOwed", { name: state.partner.name })}
			</Typography>
		);
		footer = <FormDialogFooter variant="close" onClose={store.close} />;
	} else {
		body = (
			<ReminderComposer
				facts={state}
				text={draft.text}
				empty={draft.empty}
				onTextChange={draft.setText}
			/>
		);
		footer = (
			<FormDialogFooter
				canSave
				loading={false}
				onSave={draft.withText((v) => store.send("telegram", v))}
				submitLabel={t("partner.reminder.telegram")}
				submitIcon={<TelegramIcon />}
				offlineGate={false}
				secondaryActions={
					<>
						<GhostButton icon={<ContentCopyOutlinedIcon />} onClick={draft.withText(store.copy)}>
							{t("common.copy")}
						</GhostButton>
						<GhostButton
							icon={<SmsOutlinedIcon />}
							onClick={draft.withText((v) => store.send("sms", v))}
						>
							{t("partner.reminder.sms")}
						</GhostButton>
					</>
				}
			/>
		);
	}

	return (
		<FormDialog
			open={store.isOpen}
			size="md"
			title={t("partner.reminder.title")}
			subtitle={facts?.partner.name}
			tile={recordTile("Partner")}
			onClose={store.close}
			restoreFocus
			footer={footer}
		>
			{body}
		</FormDialog>
	);
});

export default DebtReminderDialog;
