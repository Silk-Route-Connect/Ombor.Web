import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import DetailTable from "components/shared/Detail/DetailTable";
import DetailTableCard from "components/shared/Detail/DetailTableCard";
import EntityFilterSelect from "components/shared/EntityFilterSelect/EntityFilterSelect";
import DateCell from "components/shared/Table/cells/DateCell";
import DocNumberCell from "components/shared/Table/cells/DocNumberCell";
import MoneyCell from "components/shared/Table/cells/MoneyCell";
import NoValue from "components/shared/Table/cells/NoValue";
import { Column } from "components/shared/Table/DataTable/DataTable";
import TableEmptyState from "components/shared/Table/TableEmptyState";
import WalletLink from "components/wallet/Links/WalletLink";
import { PartnerLedgerEntry } from "models/partner";
import { formatDate } from "utils/dateUtils";
import { csvDateStamp, exportToCsv } from "utils/exportToCsv";
import { entityNumberSortValue, formatOptionalNumber } from "utils/formatEntityId";

import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import FilterListIcon from "@mui/icons-material/FilterList";

import { ledgerSourcePath } from "./ledgerHelpers";
import { EventCell, eventLabelKey } from "./ledgerMeta";

type TypeFilter = "all" | "payment" | "deposit" | "withdraw";

interface PaymentsTabProps {
	payments: PartnerLedgerEntry[];
	partnerName: string;
	onOpen: (entry: PartnerLedgerEntry) => void;
}

/**
 * A payment that lowers what the partner owes us is money in (green); one that
 * raises it — we paid them — is money out (red). Amounts stay unsigned.
 */
const isIncome = (p: PartnerLedgerEntry) => p.delta < 0;

/**
 * The partner's payments in the canonical column order (conventions.md →
 * Tables): № · Дата · Тип · Касса · Сумма.
 */
export const PaymentsTab: React.FC<PaymentsTabProps> = ({ payments, partnerName, onOpen }) => {
	const { t } = useTranslation();
	const [type, setType] = useState<TypeFilter>("all");
	const [search, setSearch] = useState("");

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
	}, [payments, type, search, t]);

	const columns = useMemo<Column<PartnerLedgerEntry>[]>(
		() => [
			{
				key: "number",
				headerName: t("partner.pays.col.number"),
				sortValue: (p) => entityNumberSortValue(p.reference),
				renderCell: (p) => (
					<DocNumberCell number={p.reference} to={ledgerSourcePath(p) ?? undefined} />
				),
			},
			{
				key: "date",
				headerName: t("partner.pays.col.date"),
				sortValue: (p) => Date.parse(p.date),
				renderCell: (p) => <DateCell value={p.date} />,
			},
			{
				key: "type",
				headerName: t("partner.pays.col.type"),
				sortValue: (p) => t(eventLabelKey(p.type)),
				renderCell: (p) => <EventCell type={p.type} label={t(eventLabelKey(p.type))} />,
			},
			{
				key: "wallet",
				headerName: t("partner.pays.col.wallet"),
				sortValue: (p) => p.walletName ?? "",
				renderCell: (p) =>
					p.walletId && p.walletName ? (
						<WalletLink id={p.walletId} name={p.walletName} />
					) : (
						(p.walletName ?? <NoValue />)
					),
			},
			{
				key: "amount",
				headerName: t("partner.pays.col.amount"),
				align: "right",
				sortValue: (p) => Math.abs(p.delta),
				renderCell: (p) => (
					<MoneyCell value={Math.abs(p.delta)} main tone={isIncome(p) ? "income" : "expense"} />
				),
			},
		],
		[t],
	);

	const handleExport = () => {
		exportToCsv<PartnerLedgerEntry>(
			`partner_${partnerName}_payments_${csvDateStamp()}`,
			[
				{
					header: t("partner.pays.col.number"),
					value: (p) => formatOptionalNumber(p.reference, t("common.noNumber")),
				},
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
				<EntityFilterSelect<TypeFilter>
					label={t("partner.pays.typeFilter")}
					icon={<FilterListIcon />}
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
			exportCsv={{ onExport: handleExport, rowCount: filtered.length }}
		>
			<DetailTable<PartnerLedgerEntry>
				rows={filtered}
				columns={columns}
				defaultSort={{ key: "date", order: "desc" }}
				pagination
				onRowClick={onOpen}
				empty={
					<TableEmptyState
						icon={<AccountBalanceWalletOutlinedIcon />}
						title={t("partner.pays.empty.title")}
						hint={t("partner.pays.empty.body")}
					/>
				}
			/>
		</DetailTableCard>
	);
};

export default PaymentsTab;
