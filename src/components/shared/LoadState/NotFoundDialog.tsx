import React from "react";
import { KindPresentation } from "components/shared/Chip/movementKind";
import FormDialog from "components/shared/Dialog/Form/FormDialog";

import LoadStateView, { NotFoundConfig } from "./LoadStateView";

interface NotFoundDialogProps {
	open: boolean;
	/** The detail's own title («Корректировка запаса»), as when the record exists. */
	title: string;
	/** The detail's record tile, as when the record exists. */
	tile?: KindPresentation;
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
	tile,
	notFound,
	onClose,
}) => (
	<FormDialog open={open} size="sm" title={title} tile={tile} onClose={onClose}>
		<LoadStateView state={null} size="section" notFound={notFound} />
	</FormDialog>
);

export default NotFoundDialog;
