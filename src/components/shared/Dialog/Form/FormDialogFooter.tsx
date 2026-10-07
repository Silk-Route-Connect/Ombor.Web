import React from "react";
import { useTranslation } from "react-i18next";
import GhostButton from "components/shared/Buttons/GhostButton";
import SaveButton from "components/shared/Buttons/SaveButton";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/StoreContext";

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
	 * Disable the submit while the backend is unreachable (F-028; default on).
	 * Off only for a submit that needs no server (the debt reminder's «Telegram»).
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
		const offline = offlineGate && connectivityStore.isBackendDown;

		return (
			<>
				{onCancel && (
					<GhostButton onClick={onCancel} disabled={loading}>
						{cancelLabel ?? t("common.cancel")}
					</GhostButton>
				)}
				{secondaryActions}
				<SaveButton
					disabled={!canSave || offline}
					loading={loading}
					tooltip={offline ? t("common.offline.saveTooltip") : undefined}
					label={submitLabel}
					icon={submitIcon}
					onSave={onSave}
				/>
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
 * while the backend is unreachable (F-028). `variant="close"` is the read-only
 * footer: a single «Закрыть» (or «Готово»).
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
