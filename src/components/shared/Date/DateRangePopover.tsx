import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import GhostButton from "components/shared/Buttons/GhostButton";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { format, startOfMonth } from "date-fns";
import { customDateRange, DateRangeValue } from "utils/dateRange";

import { Box, Popover, Stack, TextField, Typography } from "@mui/material";

interface DateRangePopoverProps {
	anchorEl: HTMLElement | null;
	open: boolean;
	/** The range currently applied, to start from; otherwise this month so far. */
	current: DateRangeValue;
	onApply: (value: DateRangeValue) => void;
	onClose: () => void;
}

const ISO_DAY = "yyyy-MM-dd";

/**
 * «Период…» of the shared date filter: two calendar fields (С / По). The range
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
		setFrom(current.preset === "custom" ? current.from : format(startOfMonth(today), ISO_DAY));
		setTo(current.preset === "custom" ? current.to : format(today, ISO_DAY));
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
				<Stack direction="row" sx={{ gap: "12px" }}>
					<TextField
						type="date"
						size="small"
						autoFocus
						label={t("common.dateRange.from")}
						value={from}
						onChange={(e) => setFrom(e.target.value)}
						error={error && !from}
						slotProps={{ inputLabel: { shrink: true } }}
					/>
					<TextField
						type="date"
						size="small"
						label={t("common.dateRange.to")}
						value={to}
						onChange={(e) => setTo(e.target.value)}
						error={error && !to}
						slotProps={{ inputLabel: { shrink: true } }}
					/>
				</Stack>
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
