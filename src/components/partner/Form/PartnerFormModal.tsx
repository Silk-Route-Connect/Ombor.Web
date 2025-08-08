import React from "react";
import { Box, Dialog, DialogContent, LinearProgress } from "@mui/material";
import PartnerFormFields from "components/partner/Form/PartnerFormFields";
import ConfirmDialog from "components/shared/ConfirmDialog";
import DialogTitleWithClose from "components/shared/Dialog/DialogTitle";
import FormDialogFooter from "components/shared/Dialog/Form/FormDialogFooter";
import { PartnerFormPayload, usePartnerForm } from "hooks/partner/usePartnerForm";
import { translate } from "i18n/i18n";
import { Partner } from "models/partner";
import { dialogTranslation } from "utils/translationUtils";

export interface PartnerFormModalProps {
	isOpen: boolean;
	isSaving: boolean;
	partner?: Partner | null;
	onSave: (payload: PartnerFormPayload) => void;
	onClose: () => void;
}

const PartnerFormModal: React.FC<PartnerFormModalProps> = ({
	isOpen,
	isSaving,
	partner,
	onSave,
	onClose,
}) => {
	const { form, canSave, submit, requestClose, discardOpen, confirmDiscard, cancelDiscard } =
		usePartnerForm({
			isOpen,
			isSaving,
			partner,
			onSave,
			onClose,
		});

	const title = partner ? translate("partner.title.edit") : translate("partner.title.create");

	return (
		<>
			<Dialog
				open={isOpen}
				onClose={requestClose}
				fullWidth
				maxWidth="md"
				disableEscapeKeyDown={isSaving}
				disableRestoreFocus
			>
				<DialogTitleWithClose title={title} onClose={requestClose} disabled={isSaving} />

				{isSaving && (
					<Box sx={{ position: "relative", height: 4 }}>
						<LinearProgress sx={{ position: "absolute", inset: 0 }} />
					</Box>
				)}

				<DialogContent dividers sx={{ pt: 2 }}>
					<PartnerFormFields form={form} disabled={isSaving} />
				</DialogContent>

				<FormDialogFooter
					onCancel={requestClose}
					onSave={submit}
					canSave={canSave}
					loading={isSaving}
				/>
			</Dialog>

			<ConfirmDialog
				isOpen={discardOpen}
				title={dialogTranslation("title")}
				content={dialogTranslation("body")}
				confirmLabel={dialogTranslation("confirm")}
				cancelLabel={dialogTranslation("cancel")}
				onConfirm={confirmDiscard}
				onCancel={cancelDiscard}
			/>
		</>
	);
};

export default PartnerFormModal;
