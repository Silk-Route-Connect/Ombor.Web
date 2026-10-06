import React from "react";
import FormDialogHeader from "components/shared/Dialog/Form/FormDialogHeader";
import { dialogPaperSx } from "theme";

import { Dialog, DialogContent } from "@mui/material";

import LoadStateView, { NotFoundConfig } from "./LoadStateView";

interface NotFoundDialogProps {
	open: boolean;
	/** The detail's own title («Корректировка запаса»), as when the record exists. */
	title: string;
	notFound: NotFoundConfig;
	onClose: () => void;
}

/**
 * A modal detail whose URL names a record that does not exist
 * (`/adjustments/999`): the not-found state with «К списку» in the detail's frame.
 */
export const NotFoundDialog: React.FC<NotFoundDialogProps> = ({
	open,
	title,
	notFound,
	onClose,
}) => (
	<Dialog
		open={open}
		onClose={onClose}
		disableRestoreFocus
		slotProps={{ paper: { sx: dialogPaperSx("sm") } }}
	>
		<FormDialogHeader title={title} disabled={false} onClose={onClose} />
		<DialogContent dividers>
			<LoadStateView state={null} size="section" notFound={notFound} />
		</DialogContent>
	</Dialog>
);

export default NotFoundDialog;
