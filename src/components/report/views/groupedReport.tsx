import React from "react";
import PartnerLink from "components/partner/Links/PartnerLink";
import ProductLink from "components/product/Links/ProductLink";
import WarehouseLink from "components/warehouse/Links/WarehouseLink";
import { TFunction } from "i18next";
import { isTimeGroupBy, ReportGroupBy } from "models/report";
import { bucketLabel, bucketTick } from "utils/report/reportLabels";

import { Box } from "@mui/material";

import { ReportChartPoint, ReportColumn } from "../View/types";

/** A served grouped row: a calendar bucket or an entity (`key` = its id). */
export interface GroupedRow {
	key: string;
	label: string;
}

/** Whose side a partner grouping reads from: «Клиент» on sales, «Поставщик» on purchases. */
export type PartnerSide = "sale" | "supply";

/** Ranking charts show the largest rows only. */
const RANKING_LIMIT = 10;

/** The row's name as shown and exported: a bucket in words, or the entity's current name. */
export function groupLabel(groupBy: ReportGroupBy, row: GroupedRow, t: TFunction): string {
	return isTimeGroupBy(groupBy) ? bucketLabel(groupBy, row.key, t) : row.label;
}

/** The entity behind a row as a link (a category has no page — plain 600 text). */
function groupCell(groupBy: ReportGroupBy, row: GroupedRow): React.ReactNode {
	const id = Number(row.key);
	switch (groupBy) {
		case "Product":
			return <ProductLink id={id} name={row.label} />;
		case "Partner":
			return <PartnerLink id={id} name={row.label} />;
		case "Warehouse":
			return <WarehouseLink id={id} name={row.label} />;
		case "Category":
			return (
				<Box component="span" sx={{ fontWeight: 600 }}>
					{row.label}
				</Box>
			);
		default:
			return row.label;
	}
}

/** First column of a grouped report: «День» / «Товар» / «Клиент» … */
export function groupColumn<Row extends GroupedRow>(
	groupBy: ReportGroupBy,
	side: PartnerSide,
	t: TFunction,
): ReportColumn<Row> {
	const time = isTimeGroupBy(groupBy);
	return {
		key: "group",
		header: t(groupBy === "Partner" ? `report.group.Partner.${side}` : `report.group.${groupBy}`),
		kind: "text",
		value: (row) => groupLabel(groupBy, row, t),
		sort: time ? (row) => row.key : undefined,
		cell: time ? (row) => groupLabel(groupBy, row, t) : (row) => groupCell(groupBy, row),
	};
}

/** Chart points of a grouped report: every bucket in time order, or the largest entities. */
export function groupPoints<Row extends GroupedRow>(
	groupBy: ReportGroupBy,
	rows: Row[],
	values: (row: Row) => Record<string, number>,
	t: TFunction,
): ReportChartPoint[] {
	const time = isTimeGroupBy(groupBy);
	return (time ? rows : rows.slice(0, RANKING_LIMIT)).map((row) => ({
		key: row.key,
		tick: time ? bucketTick(groupBy, row.key) : row.label,
		heading: groupLabel(groupBy, row, t),
		values: values(row),
	}));
}

/** «31 день», «12 товаров», «3 склада» — the rows of a grouping in words. */
export const groupCount =
	(groupBy: ReportGroupBy, t: TFunction) =>
	(count: number): string =>
		t(`report.count.${groupBy}`, { count });

/** The grouping as a print subtitle line. */
export const groupDetail = (groupBy: ReportGroupBy, t: TFunction): string =>
	t("report.groupBy.print", { value: t(`report.groupBy.${groupBy}`) });
