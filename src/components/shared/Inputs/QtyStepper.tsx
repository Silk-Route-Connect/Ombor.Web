import React, { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { numericSx, radius } from "theme";
import { isQuantityDraft, parseWholeQuantity } from "utils/quantityInput";

import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { Box, FormHelperText, IconButton, OutlinedInput, SxProps, Theme } from "@mui/material";

export interface QtyStepperProps {
	/** The committed whole quantity. */
	value: number;
	/** Receives a whole value ≥ `min` — never a fraction, never below the minimum. */
	onChange: (value: number) => void;
	min?: number;
	id?: string;
	inputRef?: React.Ref<HTMLInputElement>;
	/** Enter in the field (the POS «next product» loop). */
	onEnter?: () => void;
	/** Accessible name where no label above names the field. */
	ariaLabel?: string;
	sx?: SxProps<Theme>;
}

/** What the user is typing, and the committed value it was typed over. */
interface Draft {
	text: string;
	base: number;
}

/** The stepper's width; its message may run past it under the next field instead of widening it. */
const STEPPER_WIDTH = 112;

const stepButtonSx = {
	width: 28,
	height: 28,
	borderRadius: `${radius.sm}px`,
	color: "text.secondary",
	"& .MuiSvgIcon-root": { fontSize: 18 },
} as const;

/**
 * − [qty] + on the theme's 38px outlined input. Typing goes through a draft so the
 * field can be cleared and retyped; only a whole value ≥ `min` commits. A «1,5»
 * stays visible with «Количество — только целое число» and is never committed —
 * stripping the comma would book 15 (rule 21) — and blur restores the last valid
 * value. «−» at the minimum stays enabled and says why nothing changed. ↑ / ↓ step.
 */
export const QtyStepper: React.FC<QtyStepperProps> = ({
	value,
	onChange,
	min = 1,
	id,
	inputRef,
	onEnter,
	ariaLabel,
	sx,
}) => {
	const { t } = useTranslation();
	const autoId = useId();
	const fieldId = id ?? autoId;
	const messageId = `${fieldId}-message`;
	const [draft, setDraft] = useState<Draft | null>(null);
	const [pressedAtMin, setPressedAtMin] = useState(false);

	// A write from outside (a unit switch, a stepper click) drops the draft.
	const text = draft !== null && draft.base === value ? draft.text : null;
	const parsed = text === null ? null : parseWholeQuantity(text);
	const notWhole = parsed?.kind === "fraction" || parsed?.kind === "invalid";
	const belowMin = parsed?.kind === "whole" && parsed.value < min;
	const invalid = notWhole || belowMin;
	const message = notWhole
		? t("common.quantity.wholeOnly")
		: belowMin || pressedAtMin
			? t("common.quantity.min", { min })
			: null;

	const step = (delta: number) => {
		setDraft(null);
		const next = value + delta;
		setPressedAtMin(next < min);
		if (next >= min) {
			onChange(next);
		}
	};

	const handleChange = (raw: string) => {
		if (!isQuantityDraft(raw)) {
			return;
		}
		setPressedAtMin(false);
		const typed = parseWholeQuantity(raw);
		const commits = typed.kind === "whole" && typed.value >= min;
		setDraft({ text: raw, base: commits ? typed.value : value });
		if (commits) {
			onChange(typed.value);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "ArrowUp" || e.key === "ArrowDown") {
			e.preventDefault();
			step(e.key === "ArrowUp" ? 1 : -1);
		} else if (e.key === "Enter" && onEnter) {
			e.preventDefault();
			onEnter();
		}
	};

	return (
		<Box
			sx={[
				{ display: "inline-flex", flexDirection: "column", width: STEPPER_WIDTH },
				...(Array.isArray(sx) ? sx : [sx]),
			]}
		>
			<OutlinedInput
				id={fieldId}
				size="small"
				inputRef={inputRef}
				value={text ?? String(value)}
				error={invalid}
				onChange={(e) => handleChange(e.target.value)}
				onFocus={(e) => e.target.select()}
				onBlur={() => {
					setDraft(null);
					setPressedAtMin(false);
				}}
				onKeyDown={handleKeyDown}
				inputProps={{
					inputMode: "numeric",
					"aria-label": ariaLabel,
					"aria-invalid": invalid,
					"aria-describedby": message ? messageId : undefined,
				}}
				startAdornment={
					<IconButton
						size="small"
						aria-label={t("common.quantity.decrease")}
						onClick={() => step(-1)}
						// The «не меньше» note answers this press; leaving the button retires it,
						// as leaving the field does.
						onBlur={() => setPressedAtMin(false)}
						sx={stepButtonSx}
					>
						<RemoveIcon />
					</IconButton>
				}
				endAdornment={
					<IconButton
						size="small"
						aria-label={t("common.quantity.increase")}
						onClick={() => step(1)}
						sx={stepButtonSx}
					>
						<AddIcon />
					</IconButton>
				}
				sx={{
					px: "4px",
					"& .MuiOutlinedInput-input": {
						px: 0,
						textAlign: "center",
						fontWeight: 600,
						...numericSx,
					},
				}}
			/>
			{message && (
				<FormHelperText id={messageId} error={invalid} sx={{ mx: 0, whiteSpace: "nowrap" }}>
					{message}
				</FormHelperText>
			)}
		</Box>
	);
};

export default QtyStepper;
