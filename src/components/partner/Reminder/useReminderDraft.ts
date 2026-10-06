import { useState } from "react";
import { useTranslation } from "react-i18next";
import { buildDebtReminderText, DebtReminderFacts } from "utils/debtReminder";

interface Draft {
	/** Whose reminder the text was built for; a new partner (or a reopen) rebuilds it. */
	key: number | null;
	text: string;
	empty: boolean;
}

/**
 * The reminder text being edited: built from the facts when they arrive for a
 * partner, editable, and flagged — never sent — once emptied.
 */
export function useReminderDraft(facts: DebtReminderFacts | null, open: boolean) {
	const { t } = useTranslation();
	const key = open && facts ? facts.partner.id : null;
	const [draft, setDraft] = useState<Draft>({ key: null, text: "", empty: false });

	if (draft.key !== key) {
		setDraft({
			key,
			text: facts && key !== null ? buildDebtReminderText(t, facts) : "",
			empty: false,
		});
	}

	const setText = (text: string) => setDraft((d) => ({ ...d, text, empty: false }));

	/** Runs an action with the trimmed text, or flags the field when it is empty. */
	const withText = (action: (value: string) => void) => () => {
		const value = draft.text.trim();
		setDraft((d) => ({ ...d, empty: value === "" }));
		if (value) {
			action(value);
		}
	};

	return { text: draft.text, empty: draft.empty, setText, withText };
}
