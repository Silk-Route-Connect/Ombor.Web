// src/utils/supplyUtils.ts
import { TableCell, TableRow } from "@mui/material";
import { Loadable } from "helpers/Loading";
import { translate } from "i18n/i18n";

export function formatPrice(value: number): string {
	return value.toLocaleString("ru-RU", { minimumFractionDigits: 2 });
}

export function formatDate(d: Date | string): string {
	return new Date(d).toLocaleDateString("ru-RU");
}

export function renderEmptyOrLoading<T>(loadable: Loadable<T[]>, columnCount: number) {
	if (loadable === "loading") {
		return (
			<TableRow>
				<TableCell colSpan={columnCount} align="center">
					{translate("loading")}…
				</TableCell>
			</TableRow>
		);
	}
	if (Array.isArray(loadable) && loadable.length === 0) {
		return (
			<TableRow>
				<TableCell colSpan={columnCount} align="center">
					{translate("noSuppliesFound")}
				</TableCell>
			</TableRow>
		);
	}
	return null;
}
