import React from "react";
import PartnerLink from "components/partner/Links/PartnerLink";
import PartnerTypeChip from "components/partner/PartnerTypeChip";
import StatusPill from "components/shared/Chip/StatusPill";
import EntityAvatar from "components/shared/EntityAvatar/EntityAvatar";
import DateCell from "components/shared/Table/cells/DateCell";
import EntityCell from "components/shared/Table/cells/EntityCell";
import MoneyCell from "components/shared/Table/cells/MoneyCell";
import QuantityCell from "components/shared/Table/cells/QuantityCell";
import { Column } from "components/shared/Table/DataTable/DataTable";
import { TFunction } from "i18next";
import { DebtPartnerGroup } from "stores/DebtStore";

import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import { Box } from "@mui/material";

/**
 * By-partner debt columns (conventions.md → Tables): Партнёр · Тип · Документов
 * · Самый старый · Сумма. The sum is a direction amount: green when they owe us,
 * red when we owe them, unsigned (pattern 4).
 */
export function buildPartnerDebtColumns(t: TFunction): Column<DebtPartnerGroup>[] {
	return [
		{
			key: "partner",
			headerName: t("debt.partnerTable.partner"),
			sortValue: (g) => g.partnerName,
			renderCell: (g) => (
				<EntityCell avatar={<EntityAvatar name={g.partnerName} />} secondary={g.partnerCompany}>
					<PartnerLink id={g.partnerId} name={g.partnerName} />
				</EntityCell>
			),
		},
		{
			key: "type",
			headerName: t("debt.partnerTable.type"),
			// The chip reflects the debt-direction role: they owe us → «Клиент»,
			// we owe them → «Поставщик».
			sortValue: (g) =>
				t(`partner.typeShort.${g.direction === "Receivable" ? "Customer" : "Supplier"}`),
			renderCell: (g) => (
				<PartnerTypeChip type={g.direction === "Receivable" ? "Customer" : "Supplier"} />
			),
		},
		{
			key: "count",
			headerName: t("debt.partnerTable.count"),
			align: "right",
			sortValue: (g) => g.count,
			renderCell: (g) => <QuantityCell value={g.count} />,
		},
		{
			key: "oldest",
			headerName: t("debt.partnerTable.oldest"),
			sortValue: (g) => g.oldestDate,
			renderCell: (g) => (
				<Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
					<DateCell value={g.oldestDate} kind="date" />
					{g.overdueCount > 0 && (
						<StatusPill
							token="overdue"
							icon={ReportProblemOutlinedIcon}
							label={t("debt.partnerTable.overdueCount", { count: g.overdueCount })}
						/>
					)}
				</Box>
			),
		},
		{
			key: "amount",
			headerName: t("debt.partnerTable.amount"),
			align: "right",
			// Absolute value — «largest debt first» regardless of direction.
			sortValue: (g) => Math.abs(g.sum),
			renderCell: (g) => (
				<MoneyCell value={Math.abs(g.sum)} main tone={g.sum > 0 ? "income" : "expense"} />
			),
		},
	];
}
