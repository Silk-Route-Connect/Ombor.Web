import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import GhostButton from "components/shared/Buttons/GhostButton";
import FormField from "components/shared/Forms/FormField";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { addDays, format, startOfMonth } from "date-fns";
import { customDateRange, DateRangeValue, resolveDateRange } from "utils/dateRange";
import { DAY_VALUE_FORMAT } from "utils/dateUtils";

import { Box, Popover, Stack, Typography } from "@mui/material";

import DateField from "./DateField";

interface DateRangePopoverProps {
	anchorEl: HTMLElement | null;
	open: boolean;
	/** The period currently applied, to start from; «Весь период» starts from this month so far. */
	current: DateRangeValue;
	onApply: (value: DateRangeValue) => void;
	onClose: () => void;
}

/**
 * «Период…» of the shared date filter: two date fields (С / По). The range
 * is applied only on «Применить»; days typed in reverse order are swapped.
 */
const DateRangePopover: React.FC<DateRangePopoverProps> = ({
	anchorEl,
	open,
	current,
	onApply,
	onClose,
}) => {
	const { t } = useTranslation();
	const [from, setFrom] = useState("");
	const [to, setTo] = useState("");
	const [error, setError] = useState(false);

	useEffect(() => {
		if (!open) {
			return;
		}
		const today = new Date();
		const range = resolveDateRange(current, today);
		setFrom(format(range ? range.start : startOfMonth(today), DAY_VALUE_FORMAT));
		setTo(format(range ? addDays(range.end, -1) : today, DAY_VALUE_FORMAT));
		setError(false);
	}, [open, current]);

	const apply = () => {
		if (!from || !to) {
			setError(true);
			return;
		}
		onApply(customDateRange(from, to));
	};

	return (
		<Popover
			open={open}
			anchorEl={anchorEl}
			onClose={onClose}
			anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
			transformOrigin={{ vertical: "top", horizontal: "left" }}
			slotProps={{ paper: { sx: { mt: "6px", p: "16px", width: 320 } } }}
		>
			<Box
				component="form"
				noValidate
				onSubmit={(e: React.FormEvent) => {
					e.preventDefault();
					apply();
				}}
			>
				<Typography variant="h3" sx={{ mb: "12px" }}>
					{t("common.dateRange.customTitle")}
				</Typography>
				<Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
					<FormField label={t("common.dateRange.from")}>
						<DateField autoFocus value={from} onChange={setFrom} error={error && !from} />
					</FormField>
					<FormField label={t("common.dateRange.to")}>
						<DateField value={to} onChange={setTo} error={error && !to} />
					</FormField>
				</Box>
				{error && (
					<Typography sx={{ mt: "6px", fontSize: 12, color: "error.main" }}>
						{t("common.dateRange.bothRequired")}
					</Typography>
				)}
				<Stack direction="row" sx={{ gap: "8px", justifyContent: "flex-end", mt: "16px" }}>
					<GhostButton onClick={onClose}>{t("common.cancel")}</GhostButton>
					<PrimaryButton type="submit">{t("common.dateRange.apply")}</PrimaryButton>
				</Stack>
			</Box>
		</Popover>
	);
};

export default DateRangePopover;
