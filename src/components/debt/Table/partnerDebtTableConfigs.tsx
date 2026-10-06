import React from "react";
import PartnerLink from "components/partner/Links/PartnerLink";
import { buildPartnerDocumentRows } from "components/partner/PartnerDocumentActions";
import PartnerTypeChip from "components/partner/PartnerTypeChip";
import ActionMenu from "components/shared/ActionMenuCell/MenuActionCell";
import StatusPill from "components/shared/Chip/StatusPill";
import EntityAvatar from "components/shared/EntityAvatar/EntityAvatar";
import InfoHint from "components/shared/InfoHint/InfoHint";
import EntityCell from "components/shared/Table/cells/EntityCell";
import MoneyCell from "components/shared/Table/cells/MoneyCell";
import NoValue from "components/shared/Table/cells/NoValue";
import QuantityCell from "components/shared/Table/cells/QuantityCell";
import { Column } from "components/shared/Table/DataTable/DataTable";
import { ACTIONS_COLUMN_WIDTH } from "components/shared/Table/DataTable/tableConfigs";
import { TFunction } from "i18next";
import { DebtPartnerRow } from "stores/DebtStore";
import { numericSx } from "theme";
import { formatCurrency } from "utils/formatCurrency";

import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import { Box } from "@mui/material";

export interface PartnerDebtRowHandlers {
	onRemind: (row: DebtPartnerRow) => void;
	onStatement: (row: DebtPartnerRow) => void;
}

/**
 * Why the position differs from its unpaid documents: the advances netted into
 * it. A partner can hold both at once (ours raises what it owes, its own lowers
 * it), and the amount only reconciles when both are named.
 */
function positionNotes(p: DebtPartnerRow, t: TFunction): string[] {
	if (p.direction === "Settled") {
		return [t("debt.position.settled")];
	}
	const notes: string[] = [];
	if (p.partnerAdvance > 0) {
		notes.push(t("debt.position.partnerAdvance", { amount: formatCurrency(p.partnerAdvance) }));
	}
	if (p.companyAdvance > 0) {
		notes.push(t("debt.position.companyAdvance", { amount: formatCurrency(p.companyAdvance) }));
	}
	return notes;
}

/**
 * The amount over one muted note — a row never grows past two lines (a 52px
 * row). Two advances fold into «с учётом авансов» with both named in its «i».
 */
const AmountCell: React.FC<{ row: DebtPartnerRow; t: TFunction }> = ({ row, t }) => {
	const tone =
		row.direction === "Receivable" ? "income" : row.direction === "Payable" ? "expense" : "ink";
	const notes = positionNotes(row, t);
	return (
		<Box sx={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-end" }}>
			<MoneyCell value={row.amount} main tone={tone} />
			{notes.length > 0 && (
				<Box
					component="span"
					sx={{
						display: "inline-flex",
						alignItems: "center",
						gap: 0.5,
						typography: "caption",
						color: "text.secondary",
						whiteSpace: "nowrap",
					}}
				>
					{notes.length === 1 ? notes[0] : t("debt.position.advances")}
					{notes.length > 1 && <InfoHint text={notes.join(" · ")} />}
				</Box>
			)}
		</Box>
	);
};

/**
 * By-partner columns (conventions.md → Tables): Партнёр · Тип · Документов ·
 * Старейший долг · Сумма долга · ⋮. The amount is the served net position —
 * green when they owe us, red when we owe them, unsigned (pattern 4) — with a
 * note when an advance is netted into it. The ⋮ offers the reminder (only when
 * they owe us) and the Акт сверки.
 */
export function buildPartnerDebtColumns(
	t: TFunction,
	handlers: PartnerDebtRowHandlers,
): Column<DebtPartnerRow>[] {
	return [
		{
			key: "partner",
			headerName: t("debt.partnerTable.partner"),
			sortValue: (p) => p.name,
			renderCell: (p) => (
				<EntityCell
					avatar={<EntityAvatar name={p.name} muted={p.isArchived} />}
					archived={p.isArchived}
					secondary={p.company}
				>
					<PartnerLink id={p.partnerId} name={p.name} archived={p.isArchived} />
				</EntityCell>
			),
		},
		{
			key: "type",
			headerName: t("debt.partnerTable.type"),
			sortValue: (p) => t(`partner.typeShort.${p.partnerType}`),
			renderCell: (p) => <PartnerTypeChip type={p.partnerType} dimmed={p.isArchived} />,
		},
		{
			key: "count",
			headerName: t("debt.partnerTable.count"),
			align: "right",
			sortValue: (p) => p.unpaidDocumentCount,
			renderCell: (p) => <QuantityCell value={p.unpaidDocumentCount} />,
		},
		{
			key: "oldest",
			headerName: t("debt.partnerTable.oldest"),
			sortValue: (p) => p.oldestAgeDays ?? -1,
			renderCell: (p) => (
				<Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
					{p.oldestAgeDays == null ? (
						<NoValue />
					) : (
						<Box
							component="span"
							sx={{ ...numericSx, color: "text.secondary", whiteSpace: "nowrap" }}
						>
							{t("debt.ageDays", { days: p.oldestAgeDays })}
						</Box>
					)}
					{p.overdueCount > 0 && (
						<StatusPill
							token="overdue"
							icon={ReportProblemOutlinedIcon}
							label={t("debt.partnerTable.overdueCount", { count: p.overdueCount })}
						/>
					)}
				</Box>
			),
		},
		{
			key: "amount",
			headerName: t("debt.partnerTable.amount"),
			align: "right",
			// Largest exposure first regardless of direction.
			sortValue: (p) => p.amount,
			renderCell: (p) => <AmountCell row={p} t={t} />,
		},
		{
			key: "actions",
			headerName: "",
			align: "right",
			width: ACTIONS_COLUMN_WIDTH,
			renderCell: (p) => (
				<ActionMenu
					actions={buildPartnerDocumentRows(t, {
						owesUs: p.direction === "Receivable",
						onRemind: () => handlers.onRemind(p),
						onStatement: () => handlers.onStatement(p),
					})}
				/>
			),
		},
	];
}
