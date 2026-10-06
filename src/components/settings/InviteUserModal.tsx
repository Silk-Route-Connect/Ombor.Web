import React from "react";
import { useTranslation } from "react-i18next";
import FormDialogFooter from "components/shared/Dialog/Form/FormDialogFooter";
import FormDialogHeader from "components/shared/Dialog/Form/FormDialogHeader";
import { useInviteUserForm, UseInviteUserFormOptions } from "hooks/settings/useInviteUserForm";
import { useFormKeyboardSubmit } from "hooks/shared/useFormKeyboardSubmit";
import { dialogPaperSx } from "theme";

import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import { Dialog, DialogContent } from "@mui/material";

import InviteUserFields from "./InviteUserFields";
import InviteUserSuccess from "./InviteUserSuccess";

interface Props {
	isOpen: boolean;
	saving: boolean;
	onClose: () => void;
	onInvite: UseInviteUserFormOptions["onInvite"];
}

/**
 * Invite a colleague — name and phone (login is phone-based; v1 invites by phone
 * only). On success the modal turns into how that colleague signs in, because no
 * invite SMS is sent. Validation runs on submit; the submit is never disabled
 * except while the request is in flight (hard rule 5).
 */
const InviteUserModal: React.FC<Props> = ({ isOpen, saving, onClose, onInvite }) => {
	const { t } = useTranslation();
	const { form, submit, invited } = useInviteUserForm({ isOpen, onInvite });
	const onKeyDown = useFormKeyboardSubmit(() => void submit(), saving || invited !== null);
	const close = () => {
		if (!saving) {
			onClose();
		}
	};

	return (
		<Dialog
			open={isOpen}
			onClose={close}
			slotProps={{ paper: { sx: dialogPaperSx("sm") } }}
			disableEscapeKeyDown={saving}
			onKeyDown={onKeyDown}
		>
			<FormDialogHeader
				title={invited ? t("settings.invite.doneTitle") : t("settings.invite.title")}
				subtitle={invited ? undefined : t("settings.invite.subtitle")}
				disabled={saving}
				onClose={close}
			/>

			{invited ? (
				<InviteUserSuccess user={invited} onDone={close} />
			) : (
				<>
					<DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
						<InviteUserFields form={form} disabled={saving} />
					</DialogContent>
					<FormDialogFooter
						canSave={!saving}
						loading={saving}
						onCancel={close}
						onSave={() => void submit()}
						submitLabel={t("settings.invite.send")}
						submitIcon={<PersonAddAltOutlinedIcon />}
					/>
				</>
			)}
		</Dialog>
	);
};

export default InviteUserModal;
