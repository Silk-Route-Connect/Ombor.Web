import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ru } from "date-fns/locale";

import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ruRU } from "@mui/x-date-pickers/locales";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

const RU_PICKER_TEXT = ruRU.components.MuiLocalizationProvider.defaultProps.localeText;

/**
 * The locale of every date / time field (mounted once at the app root): date-fns
 * with the Russian locale — month names, Monday-first weeks — and MUI's Russian
 * picker texts, so a field never follows the browser's locale. The hour / minute
 * placeholders read «ЧЧ:ММ» beside the date's «ДД.ММ.ГГГГ».
 */
export const DatePickersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const { t } = useTranslation();
	const localeText = useMemo(
		() => ({
			...RU_PICKER_TEXT,
			fieldHoursPlaceholder: () => t("common.picker.hoursPlaceholder"),
			fieldMinutesPlaceholder: () => t("common.picker.minutesPlaceholder"),
		}),
		[t],
	);

	return (
		<LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru} localeText={localeText}>
			{children}
		</LocalizationProvider>
	);
};

export default DatePickersProvider;
