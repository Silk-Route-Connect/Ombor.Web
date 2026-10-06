import React from "react";
import { KindPresentation } from "components/shared/Chip/movementKind";
import { dialogPaperSx, DialogSize } from "theme";

import type { SxProps, Theme } from "@mui/material";
import { Box, Dialog, DialogContent, LinearProgress } from "@mui/material";

import DiscardChangesDialog, {
	DiscardChangesDialogProps,
} from "../ConfirmDialog/DiscardChangesDialog";
import FormDialogHeader from "./FormDialogHeader";

export interface FormDialogProps {
	open: boolean;
	size: DialogSize;
	title: string;
	subtitle?: React.ReactNode;
	/** The record's tile (`recordTile(kind)`) leading the title. */
	tile?: KindPresentation;
	/** A save is in flight: the progress bar shows, ✕ and Esc do nothing. */
	busy?: boolean;
	/** ✕, Esc and the backdrop — usually `requestClose` from `useDirtyClose`. */
	onClose: () => void;
	onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
	/** A `FormDialogFooter`. */
	footer?: React.ReactNode;
	/**
	 * A fixed body height (px) for a long form whose sections expand or switch,
	 * so the dialog keeps one size instead of jumping; it still shrinks to fit a
	 * short viewport and scrolls.
	 */
	bodyHeight?: number;
	contentSx?: SxProps<Theme>;
	/** The «Закрыть форму?» confirm of a dirty form (`useDirtyClose`). */
	discard?: DiscardChangesDialogProps;
	/** Return focus to the opener on close (off by default: most modals open from a menu that is gone). */
	restoreFocus?: boolean;
	children: React.ReactNode;
}

/**
 * The one modal shell: paper of a `dialogWidth` size, `FormDialogHeader` (title,
 * subtitle, record tile, ✕), a save progress bar that overlays the header rule
 * without shifting the form, the themed body (dividers, padding, scroll shadows)
 * and the footer — plus the discard confirm. Every create / edit / detail modal
 * renders through it so they share one anatomy.
 */
const FormDialog: React.FC<FormDialogProps> = ({
	open,
	size,
	title,
	subtitle,
	tile,
	busy = false,
	onClose,
	onKeyDown,
	footer,
	bodyHeight,
	contentSx,
	discard,
	restoreFocus = false,
	children,
}) => (
	<>
		<Dialog
			open={open}
			onClose={onClose}
			disableEscapeKeyDown={busy}
			disableRestoreFocus={!restoreFocus}
			onKeyDown={onKeyDown}
			slotProps={{ paper: { sx: dialogPaperSx(size) } }}
		>
			<FormDialogHeader
				title={title}
				subtitle={subtitle}
				tile={tile}
				disabled={busy}
				onClose={onClose}
			/>
			{busy && (
				<Box sx={{ position: "relative", height: 0, zIndex: 1 }}>
					<LinearProgress sx={{ position: "absolute", top: 0, left: 0, right: 0 }} />
				</Box>
			)}
			<DialogContent
				sx={[
					bodyHeight != null && { height: bodyHeight },
					...(Array.isArray(contentSx) ? contentSx : [contentSx]),
				]}
			>
				{children}
			</DialogContent>
			{footer}
		</Dialog>
		{discard && <DiscardChangesDialog {...discard} />}
	</>
);

export default FormDialog;
