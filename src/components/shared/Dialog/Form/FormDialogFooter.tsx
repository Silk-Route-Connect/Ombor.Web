import React from "react";
import { useTranslation } from "react-i18next";
import GhostButton from "components/shared/Buttons/GhostButton";
import SaveButton from "components/shared/Buttons/SaveButton";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { useSaveBlockedReason } from "hooks/shared/useSaveBlockedReason";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/StoreContext";
import { visuallyHiddenSx } from "theme";

import { Box, DialogActions } from "@mui/material";

import CommitNote from "./CommitNote";

interface FooterCommonProps {
	/** Left-hand slot — e.g. a positions / total counter, or a read-only note. */
	summary?: React.ReactNode;
}

interface SubmitFooterProps extends FooterCommonProps {
	variant?: "submit";
	/** Submission allowed — false only while a save is in flight (hard rule 5). */
	canSave: boolean;
	loading: boolean;
	/** «Отмена»; omit it where the header ✕ is the only way out (the debt reminder). */
	onCancel?: () => void;
	/** Sync or async; a returned promise is not awaited — the store reports its own outcome. */
	onSave: () => unknown;
	/** Submit text; defaults to «Сохранить». Create says «Создать …», immutable events say what happens. */
	submitLabel?: string;
	submitIcon?: React.ReactNode;
	/** Overrides «Отмена» — e.g. «Назад» on the second step of a two-step commit. */
	cancelLabel?: string;
	/** Consequence + correction line under the submit (immutable events only). */
	commitNote?: string;
	/** Further ghost actions between «Отмена» and the submit (the reminder's «Копировать» / «SMS»). */
	secondaryActions?: React.ReactNode;
	/**
	 * Block the submit while there is no connection — the device offline or the
	 * backend unreachable (F-028; default on). Off only for a submit that needs no
	 * server (the debt reminder's «Telegram»).
	 */
	offlineGate?: boolean;
}

interface CloseFooterProps extends FooterCommonProps {
	/** A read-only modal or a finished flow: one closing button. */
	variant: "close";
	onClose: () => void;
	/** Defaults to «Закрыть». */
	closeLabel?: string;
	/** `primary` for the last step of a flow («Готово»); a read-only detail stays ghost. */
	emphasis?: "primary" | "secondary";
}

export type FormDialogFooterProps = SubmitFooterProps | CloseFooterProps;

const SubmitActions: React.FC<SubmitFooterProps> = observer(
	({
		canSave,
		loading,
		onCancel,
		onSave,
		submitLabel,
		submitIcon,
		cancelLabel,
		secondaryActions,
		offlineGate = true,
	}) => {
		const { t } = useTranslation();
		const { connectivityStore } = useStore();
		const blockedReason = useSaveBlockedReason(offlineGate);
		// The header's live region is hidden from assistive tech behind an open modal,
		// so the modal says it itself when its save is gated and when it comes back.
		const announcement =
			blockedReason ??
			(offlineGate && connectivityStore.status === "restored"
				? t("common.connectivity.restored")
				: "");

		return (
			<>
				{onCancel && (
					<GhostButton onClick={onCancel} disabled={loading}>
						{cancelLabel ?? t("common.cancel")}
					</GhostButton>
				)}
				{secondaryActions}
				<SaveButton
					disabled={!canSave}
					loading={loading}
					blockedReason={blockedReason}
					label={submitLabel}
					icon={submitIcon}
					onSave={onSave}
				/>
				<Box role="status" sx={visuallyHiddenSx}>
					{announcement}
				</Box>
			</>
		);
	},
);

const CloseAction: React.FC<CloseFooterProps> = ({ onClose, closeLabel, emphasis }) => {
	const { t } = useTranslation();
	const label = closeLabel ?? t("common.close");
	return emphasis === "primary" ? (
		<PrimaryButton autoFocus onClick={onClose}>
			{label}
		</PrimaryButton>
	) : (
		<GhostButton onClick={onClose}>{label}</GhostButton>
	);
};

/**
 * The one modal footer, per the design system's `.fcard-foot`: the theme's
 * surface-subtle band (MuiDialogActions); optional summary left; ghost «Отмена»,
 * any secondary actions and the primary submit right; and, for immutable events,
 * one `CommitNote` line under the buttons. The submit stays enabled (validation
 * runs on submit, rule 5); it is disabled only while a save is in flight or
 * while there is no connection (F-028: the device offline or the backend
 * unreachable) — then it stays focusable with the cause as its tooltip and
 * description, and a polite status inside the modal announces the gate and the
 * recovery. `variant="close"` is the read-only footer: a single «Закрыть» (or
 * «Готово»).
 */
const FormDialogFooter: React.FC<FormDialogFooterProps> = (props) => {
	const commitNote = props.variant === "close" ? undefined : props.commitNote;

	return (
		<DialogActions sx={{ flexDirection: "column", alignItems: "stretch", gap: "8px" }}>
			<Box sx={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
				{props.summary}
				<Box sx={{ flexGrow: 1 }} />
				{props.variant === "close" ? <CloseAction {...props} /> : <SubmitActions {...props} />}
			</Box>
			{commitNote && <CommitNote text={commitNote} sx={{ justifyContent: "flex-end" }} />}
		</DialogActions>
	);
};

export default FormDialogFooter;
