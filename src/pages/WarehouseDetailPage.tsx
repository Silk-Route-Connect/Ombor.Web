import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import GhostButton from "components/shared/Buttons/GhostButton";
import DetailPageHeader from "components/shared/Detail/DetailPageHeader";
import DetailTabs, { DetailTabSpec } from "components/shared/Detail/DetailTabs";
import LoadStateView from "components/shared/LoadState/LoadStateView";
import WarehouseArchivedBanner from "components/warehouse/Detail/WarehouseArchivedBanner";
import WarehouseEmptyStock from "components/warehouse/Detail/WarehouseEmptyStock";
import WarehouseKpis from "components/warehouse/Detail/WarehouseKpis";
import WarehouseMovementsTab from "components/warehouse/Detail/WarehouseMovementsTab";
import WarehouseStockTab from "components/warehouse/Detail/WarehouseStockTab";
import OpeningStockModal from "components/warehouse/Form/OpeningStockModal";
import WarehouseFormModal from "components/warehouse/Form/WarehouseFormModal";
import { buildWarehouseActionRows } from "components/warehouse/Table/ActionMenu/WarehouseActionMenu";
import WarehouseDialogs from "components/warehouse/WarehouseDialogs";
import { isLoadError, isPresent, isReady, readyOr } from "helpers/Loading";
import { useRouteEntityId } from "hooks/shared/useRouteEntityId";
import { observer } from "mobx-react-lite";
import { CreateWarehouseRequest, Warehouse } from "models/warehouse";
import { PATHS } from "routing/paths";
import { OpeningStockFormValues, WarehouseFormValues } from "schemas/WarehouseSchema";
import { useStore } from "stores/StoreContext";

import AddIcon from "@mui/icons-material/Add";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import { Box, Stack } from "@mui/material";

type WarehouseDetailTab = "stock" | "movements";

const WarehouseDetailPage: React.FC = observer(() => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const warehouseId = useRouteEntityId();
	const { warehouseStore, selectedWarehouseStore } = useStore();

	const [tab, setTab] = useState<WarehouseDetailTab>("stock");

	useEffect(() => {
		if (warehouseId !== null) {
			void selectedWarehouseStore.load(warehouseId);
		}
		setTab("stock");
		return () => selectedWarehouseStore.clear();
	}, [warehouseId, selectedWarehouseStore]);

	const goBack = () => navigate(PATHS.warehouses);

	const warehouse = warehouseId === null ? null : selectedWarehouseStore.warehouse;
	const dialogMode = warehouseStore.dialogMode;
	const editingWarehouse = dialogMode.kind === "form" ? (dialogMode.warehouse ?? null) : null;
	const retry = () => warehouseId !== null && void selectedWarehouseStore.load(warehouseId);

	if (!isPresent(warehouse)) {
		return (
			<LoadStateView
				state={warehouse}
				onRetry={retry}
				errorTitle={t("warehouse.error.getById")}
				notFound={{ title: t("warehouse.detail.notFound"), backTo: PATHS.warehouses }}
			/>
		);
	}

	const handleFormSave = async (payload: WarehouseFormValues): Promise<void> => {
		const request: CreateWarehouseRequest = { name: payload.name, location: payload.location };
		const updated = await warehouseStore.update({ ...request, id: warehouse.id });
		if (updated) {
			selectedWarehouseStore.applyWarehouse(updated);
		}
	};

	const reflect = (updated: Warehouse): void => {
		selectedWarehouseStore.applyWarehouse(updated);
	};

	const handleDelete = (): void => {
		if (warehouse.isDeletable) {
			warehouseStore.openDelete(warehouse);
		} else {
			warehouseStore.openCannotDelete(warehouse);
		}
	};

	const handleOpeningSave = async (payload: OpeningStockFormValues): Promise<void> => {
		const updated = await warehouseStore.addOpeningStock(warehouse.id, {
			warehouseId: warehouse.id,
			items: payload.items,
			note: payload.note,
		});
		if (updated) {
			selectedWarehouseStore.applyWarehouse(updated);
			await selectedWarehouseStore.reloadLedgers(warehouse.id);
		}
	};

	const stockState = selectedWarehouseStore.stock;
	const movementsState = selectedWarehouseStore.movements;
	const stock = readyOr(stockState, []);
	const movements = readyOr(movementsState, []);
	const ledgersReady = isReady(stockState) && isReady(movementsState);
	const ledgersState = isLoadError(stockState)
		? stockState
		: isLoadError(movementsState)
			? movementsState
			: "loading";

	const empty = warehouse.productCount === 0;

	const actions = buildWarehouseActionRows(t, {
		warehouse,
		onEdit: () => warehouseStore.openEdit(warehouse),
		onArchive: () => warehouseStore.openArchive(warehouse),
		onRestore: () => warehouseStore.openRestore(warehouse),
		onDelete: handleDelete,
	});

	// «Начальный остаток» — a child-event create action (locked pattern 2),
	// kept as a standalone header button beside the lifecycle ⋮ kebab. Hidden on
	// archived warehouses (no new operations until restored).
	const primaryAction = warehouse.isArchived ? undefined : (
		<GhostButton
			icon={<AddIcon sx={{ fontSize: "18px !important" }} />}
			onClick={() => warehouseStore.openOpeningStock(warehouse)}
		>
			{t("warehouse.opening.action")}
		</GhostButton>
	);

	const tabs: DetailTabSpec<WarehouseDetailTab>[] = [
		{
			key: "stock",
			label: t("warehouse.detail.tabs.stock"),
			count: isReady(stockState) ? stock.length : undefined,
		},
		{
			key: "movements",
			label: t("warehouse.detail.tabs.movements"),
			count: isReady(movementsState) ? movements.length : undefined,
		},
	];

	return (
		<Box>
			<DetailPageHeader
				backTo={PATHS.warehouses}
				title={warehouse.name}
				meta={
					warehouse.location ? (
						<>
							<PlaceOutlinedIcon sx={{ fontSize: 16, color: "text.disabled" }} />
							{warehouse.location}
						</>
					) : undefined
				}
				actions={actions}
				primaryAction={primaryAction}
				isArchived={warehouse.isArchived}
				archivedLabel={t("warehouse.table.archivedBadge")}
			/>

			{warehouse.isArchived && <WarehouseArchivedBanner />}

			<WarehouseKpis warehouse={warehouse} />

			{empty && !warehouse.isArchived ? (
				<WarehouseEmptyStock onOpeningStock={() => warehouseStore.openOpeningStock(warehouse)} />
			) : (
				<Stack sx={{ gap: "16px" }}>
					<DetailTabs<WarehouseDetailTab> tabs={tabs} active={tab} onChange={setTab} />

					{!ledgersReady ? (
						<LoadStateView
							state={ledgersState}
							size="section"
							onRetry={retry}
							errorTitle={t("warehouse.error.getStock")}
						/>
					) : tab === "stock" ? (
						<WarehouseStockTab
							warehouse={warehouse}
							stock={stock}
							onAddOpeningStock={
								warehouse.isArchived ? undefined : () => warehouseStore.openOpeningStock(warehouse)
							}
						/>
					) : (
						<WarehouseMovementsTab movements={movements} />
					)}
				</Stack>
			)}

			<WarehouseFormModal
				isOpen={dialogMode.kind === "form"}
				isSaving={warehouseStore.isSaving}
				warehouse={editingWarehouse}
				onClose={warehouseStore.closeDialog}
				onSave={handleFormSave}
			/>

			<OpeningStockModal
				isOpen={dialogMode.kind === "opening"}
				isSaving={warehouseStore.isSaving}
				warehouse={warehouse}
				stock={stock}
				onClose={warehouseStore.closeDialog}
				onSave={handleOpeningSave}
			/>

			<WarehouseDialogs onArchived={reflect} onRestored={reflect} onDeleted={goBack} />
		</Box>
	);
});

export default WarehouseDetailPage;
