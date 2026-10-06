import React from "react";
import { useTranslation } from "react-i18next";
import PaymentSettlementModal from "components/payment/Form/PaymentSettlementModal";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import { UseTransactionEntry } from "hooks/transactions/useTransactionEntry";
import { SettlementInput } from "models/payment";
import { formatCurrency } from "utils/formatCurrency";

import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

import SaveTemplateModal from "./SaveTemplateModal";

export type PosDialog = "none" | "unsaved" | "noPay" | "settle" | "saveTemplate";

interface NewTransactionDialogsProps {
	dialog: PosDialog;
	entry: UseTransactionEntry;
	walletName: string;
	templateSaving: boolean;
	onClose: () => void;
	onLeave: () => void;
	onSubmitUnpaid: () => void;
	onSettle: (settlements: SettlementInput[]) => void;
	onSaveTemplate: (name: string) => void;
}

/** The New Sale / Supply dialogs: leave unsaved, commit unpaid, settle debts, save as template. */
export const NewTransactionDialogs: React.FC<NewTransactionDialogsProps> = ({
	dialog,
	entry,
	walletName,
	templateSaving,
	onClose,
	onLeave,
	onSubmitUnpaid,
	onSettle,
	onSaveTemplate,
}) => {
	const { t } = useTranslation();
	const { direction } = entry;

	return (
		<>
			<ConfirmDialog
				isOpen={dialog === "unsaved"}
				title={t("transaction.new.dialog.unsaved.title")}
				content={t(`transaction.new.dialog.unsaved.body.${direction}`)}
				icon={<ErrorOutlineIcon />}
				iconTone="warning"
				confirmVariant="warning"
				cancelLabel={t("transaction.new.dialog.unsaved.stay")}
				confirmLabel={t("transaction.new.dialog.unsaved.leave")}
				onCancel={onClose}
				onConfirm={onLeave}
			/>

			<ConfirmDialog
				isOpen={dialog === "noPay"}
				title={t("transaction.new.dialog.noPay.title")}
				content={t(`transaction.new.dialog.noPay.body.${direction}`, {
					amount: formatCurrency(entry.total),
					partner: entry.partner?.name ?? "",
				})}
				icon={<ErrorOutlineIcon />}
				iconTone="info"
				confirmVariant="primary"
				cancelLabel={t("transaction.new.dialog.noPay.back")}
				confirmLabel={t("transaction.new.dialog.noPay.confirm")}
				onCancel={onClose}
				onConfirm={onSubmitUnpaid}
			/>

			{dialog === "settle" && (
				<PaymentSettlementModal
					isOpen
					isSaving={false}
					partnerName={entry.partner?.name ?? ""}
					amount={entry.overExcess}
					walletName={walletName}
					direction={direction === "Sale" ? "Income" : "Expense"}
					mode="apply"
					outstanding={entry.outstanding}
					onBack={onClose}
					onConfirm={onSettle}
				/>
			)}

			<SaveTemplateModal
				isOpen={dialog === "saveTemplate"}
				isSaving={templateSaving}
				onClose={onClose}
				onSave={onSaveTemplate}
			/>
		</>
	);
};

export default NewTransactionDialogs;
