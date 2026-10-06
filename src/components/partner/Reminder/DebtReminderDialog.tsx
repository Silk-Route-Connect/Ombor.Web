import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import FormDialogHeader from "components/shared/Dialog/Form/FormDialogHeader";
import LoadStateView from "components/shared/LoadState/LoadStateView";
import { isPresent } from "helpers/Loading";
import { observer } from "mobx-react-lite";
import { PATHS } from "routing/paths";
import { useStore } from "stores/StoreContext";
import { dialogPaperSx } from "theme";

import { Dialog, DialogContent } from "@mui/material";

import ReminderComposer from "./ReminderComposer";

/**
 * «Напомнить о долге» modal, opened through `debtReminderStore.open(partnerId)`
 * from the partner detail ⋮ and the Debts «По партнёрам» row ⋮. Mount it once
 * on a page; it closes itself when the page goes away.
 */
export const DebtReminderDialog: React.FC = observer(() => {
	const { t } = useTranslation();
	const { debtReminderStore: store } = useStore();
	const facts = store.facts;

	useEffect(() => () => store.close(), [store]);

	return (
		<Dialog
			open={store.isOpen}
			onClose={store.close}
			slotProps={{ paper: { sx: dialogPaperSx("md") } }}
		>
			<FormDialogHeader
				title={t("partner.reminder.title")}
				subtitle={isPresent(facts) ? facts.partner.name : undefined}
				disabled={false}
				onClose={store.close}
			/>
			{isPresent(facts) ? (
				<ReminderComposer
					key={facts.partner.id}
					facts={facts}
					onCopy={store.copy}
					onSend={store.send}
					onClose={store.close}
				/>
			) : (
				<DialogContent>
					<LoadStateView
						state={facts}
						size="section"
						onRetry={store.reload}
						errorTitle={t("partner.reminder.error.load")}
						notFound={{ title: t("partner.detail.notFound"), backTo: PATHS.partners }}
					/>
				</DialogContent>
			)}
		</Dialog>
	);
});

export default DebtReminderDialog;
