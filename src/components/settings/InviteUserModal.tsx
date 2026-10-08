import React from "react";
import { useTranslation } from "react-i18next";
import FormDialog from "components/shared/Dialog/Form/FormDialog";
import FormDialogFooter from "components/shared/Dialog/Form/FormDialogFooter";
import { recordTile } from "components/shared/IconTile/recordTile";
import { useInviteUserForm, UseInviteUserFormOptions } from "hooks/settings/useInviteUserForm";
import { useFormKeyboardSubmit } from "hooks/shared/useFormKeyboardSubmit";

import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import { Stack } from "@mui/material";

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
		<FormDialog
			open={isOpen}
			size="sm"
			title={invited ? t("settings.invite.doneTitle") : t("settings.invite.title")}
			subtitle={invited ? undefined : t("settings.invite.subtitle")}
			tile={recordTile("User")}
			busy={saving}
			onClose={close}
			onKeyDown={onKeyDown}
			restoreFocus
			footer={
				invited ? (
					<FormDialogFooter
						variant="close"
						emphasis="primary"
						closeLabel={t("settings.invite.done")}
						onClose={close}
					/>
				) : (
					<FormDialogFooter
						canSave={!saving}
						loading={saving}
						onCancel={close}
						onSave={() => void submit()}
						submitLabel={t("settings.invite.send")}
						submitIcon={<PersonAddAltOutlinedIcon />}
					/>
				)
			}
		>
			{invited ? (
				<InviteUserSuccess user={invited} />
			) : (
				<Stack sx={{ gap: "16px" }}>
					<InviteUserFields form={form} disabled={saving} />
				</Stack>
			)}
		</FormDialog>
	);
};

export default InviteUserModal;
