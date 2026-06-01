import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import WarehouseCard from "components/warehouse/Card/WarehouseCard";
import WarehouseHeader from "components/warehouse/Header/WarehouseHeader";
import WarehouseSummary from "components/warehouse/Summary/WarehouseSummary";
import WarehouseDialogs from "components/warehouse/WarehouseDialogs";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import { Warehouse } from "models/warehouse";
import { useStore } from "stores/StoreContext";
import { getWarehousesSummary } from "utils/warehouseStats";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Box, CircularProgress, Collapse, Typography } from "@mui/material";

const GRID_SX = {
	display: "grid",
	gap: 2,
	gridTemplateColumns: { xs: "1fr", sm: "repeat(auto-fill, minmax(340px, 1fr))" },
} as const;

const WarehousesPage: React.FC = observer(() => {
	const { warehouseStore } = useStore();
	const navigate = useNavigate();
	const [archivedOpen, setArchivedOpen] = useState(true);

	useEffect(() => {
		warehouseStore.getAll();
	}, [warehouseStore]);

	const warehouses = warehouseStore.filteredWarehouses;
	const isLoading = warehouses === "loading";
	const list = useMemo(() => (warehouses === "loading" ? [] : warehouses), [warehouses]);

	const active = useMemo(() => list.filter((w) => w.isActive), [list]);
	const archived = useMemo(() => list.filter((w) => !w.isActive), [list]);
	const summary = useMemo(() => getWarehousesSummary(list), [list]);

	const cardHandlers = {
		onOpen: (w: Warehouse) => navigate(`/warehouses/${w.id}`),
		onEdit: warehouseStore.openEdit,
		onArchive: warehouseStore.archive,
		onRestore: warehouseStore.restore,
		onDelete: warehouseStore.openDelete,
	};

	return (
		<Box>
			<WarehouseHeader onCreate={warehouseStore.openCreate} />

			{isLoading ? (
				<Box display="flex" justifyContent="center" alignItems="center" minHeight={360}>
					<CircularProgress />
				</Box>
			) : (
				<>
					<WarehouseSummary summary={summary} />

					{active.length === 0 && archived.length === 0 ? (
						<Typography
							variant="body2"
							sx={{ color: "text.secondary", py: 6, textAlign: "center" }}
						>
							{translate("warehouse.empty")}
						</Typography>
					) : (
						<Box sx={GRID_SX}>
							{active.map((warehouse) => (
								<WarehouseCard key={warehouse.id} warehouse={warehouse} {...cardHandlers} />
							))}
						</Box>
					)}

					{archived.length > 0 && (
						<Box sx={{ mt: 4 }}>
							<Box
								onClick={() => setArchivedOpen((v) => !v)}
								sx={{
									display: "inline-flex",
									alignItems: "center",
									gap: 1,
									mb: 1.75,
									px: 1,
									py: 0.5,
									ml: -1,
									borderRadius: 1.5,
									cursor: "pointer",
									userSelect: "none",
									"&:hover": { bgcolor: "grey.100" },
								}}
							>
								<ExpandMoreIcon
									sx={{
										fontSize: 18,
										color: "text.secondary",
										transition: "transform .16s",
										transform: archivedOpen ? "rotate(0deg)" : "rotate(-90deg)",
									}}
								/>
								<Typography
									variant="overline"
									sx={{ color: "text.secondary", letterSpacing: "0.04em" }}
								>
									{translate("warehouse.archived.title")}
								</Typography>
								<Typography
									component="span"
									sx={{
										fontWeight: 700,
										color: "text.disabled",
										fontVariantNumeric: "tabular-nums",
									}}
								>
									· {archived.length}
								</Typography>
							</Box>
							<Collapse in={archivedOpen} timeout="auto" unmountOnExit>
								<Box sx={GRID_SX}>
									{archived.map((warehouse) => (
										<WarehouseCard
											key={warehouse.id}
											warehouse={warehouse}
											archived
											{...cardHandlers}
										/>
									))}
								</Box>
							</Collapse>
						</Box>
					)}
				</>
			)}

			<WarehouseDialogs />
		</Box>
	);
});

export default WarehousesPage;
