import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import DetailSortHeader, { SortDir } from "components/shared/Detail/DetailSortHeader";
import { compareValues } from "components/shared/Table/DataTable/tableConfigs";
import { PartnerLedgerEntry } from "models/partner";
import { numericSx } from "theme";
import { formatDate, formatDateTime } from "utils/dateUtils";
import { csvDateStamp, exportToCsv } from "utils/exportToCsv";
import { formatPartnerBalance, partnerBalanceColor } from "utils/partnerUtils";

import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import FilterListIcon from "@mui/icons-material/FilterList";
import { Box } from "@mui/material";

import { bodyCellSx, EmptyRecords, headCellSx } from "./detailTable";
import DetailTableCard from "./DetailTableCard";
import FilterDropdown from "./FilterDropdown";
import { DETAIL_ROWS_PER_PAGE_OPTIONS, useDetailTablePage } from "./ledgerHelpers";
import { EventCell, eventLabelKey } from "./ledgerMeta";

type TypeFilter = "all" | "payment" | "deposit" | "withdraw";
type SortCol = "date" | "type" | "amount" | "wallet";

interface PaymentsTabProps {
	payments: PartnerLedgerEntry[];
	partnerName: string;
	onOpen: (entry: PartnerLedgerEntry) => void;
}

export const PaymentsTab: React.FC<PaymentsTabProps> = ({ payments, partnerName, onOpen }) => {
	const { t } = useTranslation();
	const [type, setType] = useState<TypeFilter>("all");
	const [search, setSearch] = useState("");
	const [sortCol, setSortCol] = useState<SortCol>("date");
	const [sortDir, setSortDir] = useState<SortDir>("desc");

	const filtered = useMemo(() => {
		const ql = search.trim().toLowerCase();
		return payments.filter((p) => {
			if (type !== "all" && p.type !== type) {
				return false;
			}
			if (!ql) {
				return true;
			}
			const haystack = [
				t(eventLabelKey(p.type)),
				p.reference ?? "",
				p.walletName ?? "",
				String(Math.abs(p.delta)),
			]
				.join(" ")
				.toLowerCase();
			return haystack.includes(ql);
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [payments, type, search, t]);

	const sorted = useMemo(() => {
		const accessor = (p: PartnerLedgerEntry): string | number => {
			switch (sortCol) {
				case "date":
					return p.date;
				case "type":
					return t(eventLabelKey(p.type));
				case "amount":
					return Math.abs(p.delta);
				case "wallet":
					return p.walletName ?? "";
				default:
					return "";
			}
		};
		const s = [...filtered].sort((a, b) => compareValues(accessor(a), accessor(b)));
		return sortDir === "desc" ? s.reverse() : s;
	}, [filtered, sortCol, sortDir, t]);

	const { page, rowsPerPage, setPage, changeRowsPerPage, paginate } = useDetailTablePage(
		`${type}|${search}|${sortCol}|${sortDir}`,
	);
	const rows = paginate(sorted);

	const onSort = (col: SortCol) => {
		if (col === sortCol) {
			setSortDir((d) => (d === "desc" ? "asc" : "desc"));
		} else {
			setSortCol(col);
			setSortDir("desc");
		}
	};

	const handleExport = () => {
		exportToCsv<PartnerLedgerEntry>(
			`partner_${partnerName}_payments_${csvDateStamp()}`,
			[
				{ header: t("partner.pays.col.date"), value: (p) => formatDate(p.date) },
				{ header: t("partner.pays.col.type"), value: (p) => t(eventLabelKey(p.type)) },
				{ header: t("partner.pays.col.wallet"), value: (p) => p.walletName ?? "" },
				{ header: t("partner.pays.col.amount"), value: (p) => Math.abs(p.delta) },
			],
			filtered,
		);
	};

	return (
		<DetailTableCard
			search={{ value: search, onChange: setSearch, placeholder: t("partner.pays.search") }}
			filters={
				<FilterDropdown<TypeFilter>
					label={t("partner.pays.typeFilter")}
					icon={<FilterListIcon sx={{ fontSize: 15 }} />}
					value={type}
					onChange={setType}
					options={[
						{ value: "all", label: t("partner.pays.type.all") },
						{ value: "payment", label: t("partner.pays.type.payment") },
						{ value: "deposit", label: t("partner.pays.type.deposit") },
						{ value: "withdraw", label: t("partner.pays.type.withdraw") },
					]}
				/>
			}
			onExport={handleExport}
			exportDisabled={filtered.length === 0}
			pagination={{
				count: filtered.length,
				page,
				rowsPerPage,
				rowsPerPageOptions: DETAIL_ROWS_PER_PAGE_OPTIONS,
				onPageChange: setPage,
				onRowsPerPageChange: changeRowsPerPage,
			}}
		>
			{rows.length === 0 ? (
				<EmptyRecords
					icon={<AccountBalanceWalletOutlinedIcon sx={{ fontSize: 22 }} />}
					title={t("partner.pays.empty.title")}
					body={t("partner.pays.empty.body")}
				/>
			) : (
				<Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
					<thead>
						<tr>
							<DetailSortHeader
								col="date"
								label={t("partner.pays.col.date")}
								active={sortCol === "date"}
								dir={sortDir}
								onSort={onSort}
								sx={headCellSx}
							/>
							<DetailSortHeader
								col="type"
								label={t("partner.pays.col.type")}
								active={sortCol === "type"}
								dir={sortDir}
								onSort={onSort}
								sx={headCellSx}
							/>
							<DetailSortHeader
								col="wallet"
								label={t("partner.pays.col.wallet")}
								active={sortCol === "wallet"}
								dir={sortDir}
								onSort={onSort}
								sx={headCellSx}
							/>
							<DetailSortHeader
								col="amount"
								label={t("partner.pays.col.amount")}
								active={sortCol === "amount"}
								dir={sortDir}
								onSort={onSort}
								align="right"
								sx={{ ...headCellSx, textAlign: "right" }}
							/>
						</tr>
					</thead>
					<tbody>
						{rows.map((p) => (
							<Box
								component="tr"
								key={p.id}
								onClick={() => onOpen(p)}
								sx={{ cursor: "pointer", "&:hover": { bgcolor: "grey.50" } }}
							>
								<Box
									component="td"
									sx={{
										...bodyCellSx,
										...numericSx,
										color: "text.secondary",
										whiteSpace: "nowrap",
									}}
								>
									{formatDateTime(p.date)}
								</Box>
								<Box component="td" sx={bodyCellSx}>
									<EventCell type={p.type} label={t(eventLabelKey(p.type))} />
								</Box>
								<Box component="td" sx={{ ...bodyCellSx, fontSize: 13, color: "text.primary" }}>
									{p.walletName ?? (
										<Box component="span" sx={{ color: "text.secondary" }}>
											{t("common.dash")}
										</Box>
									)}
								</Box>
								<Box
									component="td"
									sx={{
										...bodyCellSx,
										textAlign: "right",
										...numericSx,
										fontWeight: 600,
										color: partnerBalanceColor(p.delta),
									}}
								>
									{formatPartnerBalance(p.delta)}
								</Box>
							</Box>
						))}
					</tbody>
				</Box>
			)}
		</DetailTableCard>
	);
};

export default PaymentsTab;
