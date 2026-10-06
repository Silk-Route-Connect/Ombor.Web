import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import PartnerLink from "components/partner/Links/PartnerLink";
import ProductLink from "components/product/Links/ProductLink";
import { movementKindLabelKey } from "components/shared/Chip/movementKind";
import MovementKindChip from "components/shared/Chip/MovementKindChip";
import DetailTable from "components/shared/Detail/DetailTable";
import DetailTableCard from "components/shared/Detail/DetailTableCard";
import EntityFilterSelect from "components/shared/EntityFilterSelect/EntityFilterSelect";
import DateCell from "components/shared/Table/cells/DateCell";
import MutedTextCell from "components/shared/Table/cells/MutedTextCell";
import NotesCell from "components/shared/Table/cells/NotesCell";
import QuantityCell from "components/shared/Table/cells/QuantityCell";
import { Column } from "components/shared/Table/DataTable/DataTable";
import TableEmptyState from "components/shared/Table/TableEmptyState";
import { useTableOrder } from "components/shared/Table/tableOrder";
import MovementSourceCell from "components/stockMovement/MovementSourceCell";
import MovementSourceDialogs from "components/stockMovement/MovementSourceDialogs";
import WarehouseLink from "components/warehouse/Links/WarehouseLink";
import { useMovementSourceOpener } from "hooks/stockMovement/useMovementSourceOpener";
import { TFunction } from "i18next";
import {
	WAREHOUSE_MOVEMENT_KINDS,
	WarehouseMovement,
	WarehouseMovementKind,
} from "models/warehouse";
import { formatDate } from "utils/dateUtils";
import { csvDateStamp, exportToCsv } from "utils/exportToCsv";
import { entityNumberSortValue } from "utils/formatEntityId";
import {
	isMovementSourceOpenable,
	movementSourceCsv,
	movementSourceNumber,
} from "utils/movementSource";
import { measurementShort } from "utils/productUtils";
import { matchesSearch } from "utils/stringUtils";

import FilterListIcon from "@mui/icons-material/FilterList";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";

interface WarehouseMovementsTabProps {
	warehouseName: string;
	movements: WarehouseMovement[];
}

type KindFilter = WarehouseMovementKind | typeof ALL_TYPES;
/** Movements key by position — a source event id is not unique across kinds. */
type MovementRow = WarehouseMovement & { eventId: number };

const ALL_TYPES = "__all__";

/**
 * An adjustment's counterparty is its served reason enum («Theft») — shown
 * through the reason labels the Adjustments list uses, never raw.
 */
const counterpartyText = (t: TFunction, m: WarehouseMovement): string | null =>
	m.kind === "Adjustment" && m.counterparty
		? t(`adjustment.reason.${m.counterparty}`, { defaultValue: m.counterparty })
		: (m.counterparty ?? null);

/** The other side of a movement: the other warehouse, the partner, the reason, or the note. */
const CounterpartyCell: React.FC<{ movement: WarehouseMovement }> = ({ movement: m }) => {
	const { t } = useTranslation();
	if (m.kind === "Transfer" && m.counterpartyWarehouseId) {
		return <WarehouseLink id={m.counterpartyWarehouseId} name={m.counterparty ?? ""} />;
	}
	if (m.counterpartyPartnerId && m.counterparty) {
		return <PartnerLink id={m.counterpartyPartnerId} name={m.counterparty} />;
	}
	const text = counterpartyText(t, m);
	if (text) {
		return <MutedTextCell text={text} />;
	}
	return <NotesCell text={m.note} maxWidth={220} />;
};

/**
 * «Движения»: the warehouse stock ledger — № · Дата · Товар · Событие ·
 * Контрагент · Количество (signed) · Остаток — searchable by product,
 * filterable by event. A row (or its №) opens the source document: a sale /
 * supply / refund page, or the transfer / adjustment detail in place.
 */
export const WarehouseMovementsTab: React.FC<WarehouseMovementsTabProps> = ({
	warehouseName,
	movements,
}) => {
	const { t } = useTranslation();
	const tableOrder = useTableOrder<MovementRow>();
	const openSource = useMovementSourceOpener();
	const [query, setQuery] = useState("");
	const [type, setType] = useState<KindFilter>(ALL_TYPES);
	const isFiltering = query.trim() !== "" || type !== ALL_TYPES;

	const rows = useMemo<MovementRow[]>(
		() =>
			movements
				.filter(
					(m) =>
						(type === ALL_TYPES || m.kind === type) &&
						(!query.trim() || matchesSearch(m.productName, query)),
				)
				.map((m, index) => ({ ...m, id: index, eventId: m.id })),
		[movements, query, type],
	);

	const columns = useMemo<Column<MovementRow>[]>(
		() => [
			{
				key: "number",
				headerName: t("warehouse.movements.number"),
				sortValue: (m) => entityNumberSortValue(movementSourceNumber(m)),
				renderCell: (m) => <MovementSourceCell movement={m} onOpen={openSource} />,
			},
			{
				key: "date",
				headerName: t("warehouse.movements.date"),
				sortValue: (m) => Date.parse(m.date),
				renderCell: (m) => <DateCell value={m.date} />,
			},
			{
				key: "product",
				headerName: t("warehouse.movements.product"),
				sortValue: (m) => m.productName,
				renderCell: (m) => <ProductLink id={m.productId} name={m.productName} />,
			},
			{
				key: "event",
				headerName: t("warehouse.movements.event"),
				sortValue: (m) => t(movementKindLabelKey(m.kind)),
				renderCell: (m) => <MovementKindChip kind={m.kind} />,
			},
			{
				key: "counterparty",
				headerName: t("warehouse.movements.counterparty"),
				sortValue: (m) => counterpartyText(t, m) ?? "",
				renderCell: (m) => <CounterpartyCell movement={m} />,
			},
			{
				key: "quantity",
				headerName: t("warehouse.movements.quantity"),
				align: "right",
				sortValue: (m) => m.quantity,
				renderCell: (m) => (
					<QuantityCell
						value={m.quantity}
						measurement={m.measurement}
						direction={m.quantity >= 0 ? "in" : "out"}
					/>
				),
			},
			{
				key: "balance",
				headerName: t("warehouse.movements.balance"),
				align: "right",
				sortValue: (m) => m.balanceAfter,
				renderCell: (m) => <QuantityCell value={m.balanceAfter} measurement={m.measurement} />,
			},
		],
		[t, openSource],
	);

	const handleExport = () => {
		exportToCsv<MovementRow>(
			`warehouse_${warehouseName}_movements_${csvDateStamp()}`,
			[
				{ header: t("warehouse.movements.number"), value: (m) => movementSourceCsv(m, t) },
				{ header: t("warehouse.movements.date"), value: (m) => formatDate(m.date) },
				{ header: t("warehouse.movements.product"), value: (m) => m.productName },
				{ header: t("warehouse.movements.event"), value: (m) => t(movementKindLabelKey(m.kind)) },
				{
					header: t("warehouse.movements.counterparty"),
					value: (m) => counterpartyText(t, m) ?? m.note ?? "",
				},
				{ header: t("warehouse.movements.quantity"), value: (m) => m.quantity },
				{ header: t("warehouse.movements.balance"), value: (m) => m.balanceAfter },
				{ header: t("warehouse.stock.unit"), value: (m) => measurementShort(t, m.measurement) },
			],
			tableOrder.apply(rows),
		);
	};

	return (
		<DetailTableCard
			search={{
				value: query,
				onChange: setQuery,
				placeholder: t("warehouse.movements.searchPlaceholder"),
			}}
			filters={
				<EntityFilterSelect<KindFilter>
					icon={<FilterListIcon />}
					value={type}
					allValue={ALL_TYPES}
					allLabel={t("warehouse.movements.allTypes")}
					options={WAREHOUSE_MOVEMENT_KINDS.map((kind) => ({
						value: kind,
						label: t(movementKindLabelKey(kind)),
					}))}
					onChange={setType}
				/>
			}
			exportCsv={{ onExport: handleExport, rowCount: rows.length }}
		>
			<DetailTable<MovementRow>
				exportOrder={tableOrder}
				rows={rows}
				columns={columns}
				defaultSort={{ key: "date", order: "desc" }}
				pagination
				onRowClick={openSource}
				isRowClickable={isMovementSourceOpenable}
				empty={
					<TableEmptyState
						icon={<LayersOutlinedIcon />}
						title={
							isFiltering
								? t("warehouse.movements.emptyFilteredTitle")
								: t("warehouse.movements.emptyTitle")
						}
						hint={
							isFiltering
								? t("warehouse.movements.emptyFilteredBody")
								: t("warehouse.movements.emptyBody")
						}
					/>
				}
			/>
			<MovementSourceDialogs />
		</DetailTableCard>
	);
};

export default WarehouseMovementsTab;
