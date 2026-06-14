import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import WarehouseArchivedBanner from "components/warehouse/Detail/WarehouseArchivedBanner";
import WarehouseDetailHeader from "components/warehouse/Detail/WarehouseDetailHeader";
import WarehouseDetailTabs, {
	WarehouseDetailTab,
} from "components/warehouse/Detail/WarehouseDetailTabs";
import WarehouseEmptyStock from "components/warehouse/Detail/WarehouseEmptyStock";
import WarehouseKpis from "components/warehouse/Detail/WarehouseKpis";
import WarehouseMovementsTab from "components/warehouse/Detail/WarehouseMovementsTab";
import WarehouseStockTab from "components/warehouse/Detail/WarehouseStockTab";
import OpeningStockModal from "components/warehouse/Form/OpeningStockModal";
import WarehouseFormModal from "components/warehouse/Form/WarehouseFormModal";
import { observer } from "mobx-react-lite";
import { CreateWarehouseRequest, Warehouse } from "models/warehouse";
import { PATHS } from "routing/paths";
import { OpeningStockFormValues, WarehouseFormValues } from "schemas/WarehouseSchema";
import { useStore } from "stores/StoreContext";

import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import UnarchiveOutlinedIcon from "@mui/icons-material/UnarchiveOutlined";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";

const WarehouseDetailPage: React.FC = observer(() => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const warehouseId = Number(id);
	const { warehouseStore, selectedWarehouseStore } = useStore();

	const [tab, setTab] = useState<WarehouseDetailTab>("stock");

	useEffect(() => {
		if (Number.isFinite(warehouseId)) {
			selectedWarehouseStore.load(warehouseId);
		}
		setTab("stock");
		return () => selectedWarehouseStore.clear();
	}, [warehouseId, selectedWarehouseStore]);

	const goBack = () => navigate(PATHS.warehouses);

	const warehouse = selectedWarehouseStore.warehouse;
	const dialogMode = warehouseStore.dialogMode;
	const editingWarehouse = dialogMode.kind === "form" ? (dialogMode.warehouse ?? null) : null;

	if (warehouse === "loading") {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
				<CircularProgress />
			</Box>
		);
	}

	if (warehouse === null) {
		return (
			<Box sx={{ py: 10, textAlign: "center" }}>
				<Typography sx={{ color: "text.secondary" }}>{t("warehouse.detail.notFound")}</Typography>
			</Box>
		);
	}

	const handleFormSave = async (payload: WarehouseFormValues): Promise<void> => {
		const request: CreateWarehouseRequest = { name: payload.name, location: payload.location };
		const updated = await warehouseStore.update({ ...request, id: warehouse.id });
		if (updated) {
			selectedWarehouseStore.applyWarehouse(updated);
		}
	};

	const reflect = async (updated: Warehouse | null): Promise<void> => {
		if (updated) {
			selectedWarehouseStore.applyWarehouse(updated);
		}
	};

	const handleOpeningSave = async (payload: OpeningStockFormValues): Promise<void> => {
		const updated = await warehouseStore.addOpeningStock(warehouse.id, {
			items: [
				{ productId: payload.productId, quantity: payload.quantity, unitCost: payload.unitCost },
			],
			note: payload.note,
		});
		if (updated) {
			selectedWarehouseStore.applyWarehouse(updated);
			await selectedWarehouseStore.reloadLedgers(warehouse.id);
		}
	};

	const stock = selectedWarehouseStore.stock === "loading" ? [] : selectedWarehouseStore.stock;
	const movements =
		selectedWarehouseStore.movements === "loading" ? [] : selectedWarehouseStore.movements;
	const ledgersLoading =
		selectedWarehouseStore.stock === "loading" || selectedWarehouseStore.movements === "loading";

	const empty = warehouse.productCount === 0;

	return (
		<Box>
			<WarehouseDetailHeader
				warehouse={warehouse}
				onBack={goBack}
				onEdit={() => warehouseStore.openEdit(warehouse)}
				onArchive={() => warehouseStore.openArchive(warehouse)}
				onRestore={() => warehouseStore.openRestore(warehouse)}
				onOpeningStock={() => warehouseStore.openOpeningStock(warehouse)}
			/>

			{warehouse.isArchived && <WarehouseArchivedBanner />}

			<WarehouseKpis warehouse={warehouse} />

			{empty && !warehouse.isArchived ? (
				<WarehouseEmptyStock onOpeningStock={() => warehouseStore.openOpeningStock(warehouse)} />
			) : (
				<Stack sx={{ gap: "16px" }}>
					<WarehouseDetailTabs value={tab} onChange={setTab} />

					{ledgersLoading ? (
						<Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
							<CircularProgress size={28} />
						</Box>
					) : tab === "stock" ? (
						<WarehouseStockTab warehouse={warehouse} stock={stock} />
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

			<ConfirmDialog
				isOpen={dialogMode.kind === "archive"}
				icon={<ArchiveOutlinedIcon sx={{ fontSize: 22 }} />}
				iconTone="warning"
				title={t("warehouse.archive.title", {
					name: dialogMode.kind === "archive" ? dialogMode.warehouse.name : "",
				})}
				content={t("warehouse.archive.body")}
				confirmLabel={t("common.archive")}
				cancelLabel={t("common.cancel")}
				confirmVariant="warning"
				onCancel={warehouseStore.closeDialog}
				onConfirm={() => {
					if (dialogMode.kind === "archive") {
						void warehouseStore.archive(dialogMode.warehouse).then(reflect);
					}
				}}
			/>

			<ConfirmDialog
				isOpen={dialogMode.kind === "restore"}
				icon={<UnarchiveOutlinedIcon sx={{ fontSize: 22 }} />}
				iconTone="info"
				title={t("warehouse.restore.title", {
					name: dialogMode.kind === "restore" ? dialogMode.warehouse.name : "",
				})}
				content={t("warehouse.restore.body")}
				confirmLabel={t("common.restore")}
				cancelLabel={t("common.cancel")}
				confirmVariant="primary"
				onCancel={warehouseStore.closeDialog}
				onConfirm={() => {
					if (dialogMode.kind === "restore") {
						void warehouseStore.restore(dialogMode.warehouse).then(reflect);
					}
				}}
			/>
		</Box>
	);
});

export default WarehouseDetailPage;
