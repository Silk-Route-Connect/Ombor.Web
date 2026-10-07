import React, { useState } from "react";
import { KindPresentation } from "components/shared/Chip/movementKind";
import { useRestoreFocus } from "hooks/shared/useRestoreFocus";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/StoreContext";
import { dialogBelowHeaderSx, dialogPaperSx, DialogSize } from "theme";

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
	/**
	 * Return focus to the opener on close (off by default: most modals open from a
	 * menu that is gone). `useRestoreFocus`, not MUI's own restore — see there.
	 */
	restoreFocus?: boolean;
	children: React.ReactNode;
}

/**
 * The one modal shell: paper of a `dialogWidth` size, `FormDialogHeader` (title,
 * subtitle, record tile, ✕), a save progress bar that overlays the header rule
 * without shifting the form, the themed body (dividers, padding, scroll shadows)
 * and the footer — plus the discard confirm. Every create / edit / detail modal
 * renders through it so they share one anatomy. While the header shows a
 * connection problem (drawn above the backdrop, so the user sees why a save is
 * blocked) the paper keeps below the header instead of running under the pill.
 */
const FormDialog: React.FC<FormDialogProps> = observer(
	({
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
	}) => {
		const { connectivityStore } = useStore();
		useRestoreFocus(open, restoreFocus);
		// Latched for as long as the modal is open: it clears the header when a problem
		// shows, but a recovery never moves it back up — the save re-enables at that
		// moment, and a form jumping under the pointer turns a click into a backdrop click.
		const [belowHeader, setBelowHeader] = useState(false);
		if (open && connectivityStore.isDisconnected && !belowHeader) {
			setBelowHeader(true);
		}

		return (
			<>
				<Dialog
					open={open}
					onClose={onClose}
					disableEscapeKeyDown={busy}
					disableRestoreFocus
					onKeyDown={onKeyDown}
					slotProps={{
						paper: { sx: [dialogPaperSx(size), belowHeader && dialogBelowHeaderSx] },
						transition: { onExited: () => setBelowHeader(false) },
					}}
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
	},
);

export default FormDialog;
