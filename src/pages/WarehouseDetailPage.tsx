import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DetailMovementsTab from "components/warehouse/Detail/DetailMovementsTab";
import DetailStockTab from "components/warehouse/Detail/DetailStockTab";
import WarehouseDialogs from "components/warehouse/WarehouseDialogs";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import { Warehouse } from "models/warehouse";
import { useStore } from "stores/StoreContext";
import { formatMoney } from "utils/formatCurrency";
import { getWarehouseStats } from "utils/warehouseStats";

import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import TuneIcon from "@mui/icons-material/Tune";
import {
	Box,
	Button,
	CircularProgress,
	IconButton,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
	Paper,
	Tab,
	Tabs,
	Typography,
} from "@mui/material";

const StatCard: React.FC<{
	icon: React.ReactNode;
	tone: "teal" | "saffron";
	caption: string;
	value: string;
	unit?: string;
}> = ({ icon, tone, caption, value, unit }) => (
	<Paper
		elevation={1}
		sx={{
			display: "flex",
			alignItems: "center",
			gap: 1.75,
			border: 1,
			borderColor: "divider",
			borderRadius: 1.5,
			p: 2,
		}}
	>
		<Box
			sx={{
				width: 42,
				height: 42,
				flexShrink: 0,
				borderRadius: "11px",
				display: "grid",
				placeItems: "center",
				bgcolor: tone === "teal" ? "primary.light" : "secondary.light",
				color: tone === "teal" ? "primary.main" : "secondary.dark",
			}}
		>
			{icon}
		</Box>
		<Box sx={{ minWidth: 0 }}>
			<Typography variant="body2" sx={{ color: "text.secondary" }}>
				{caption}
			</Typography>
			<Typography
				sx={{
					fontSize: "1.5rem",
					fontWeight: 700,
					letterSpacing: "-0.02em",
					lineHeight: 1.1,
					mt: 0.25,
					fontVariantNumeric: "tabular-nums",
				}}
			>
				{value}
				{unit && (
					<Typography
						component="span"
						sx={{ ml: 0.5, fontSize: "0.8125rem", fontWeight: 600, color: "text.disabled" }}
					>
						{unit}
					</Typography>
				)}
			</Typography>
		</Box>
	</Paper>
);

const WarehouseDetailPage: React.FC = observer(() => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { warehouseStore, productStore } = useStore();
	const [tab, setTab] = useState<"stock" | "movements">("stock");
	const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

	const warehouseId = Number(id);

	useEffect(() => {
		warehouseStore.getAll();
		productStore.getAll();
	}, [warehouseStore, productStore]);

	const all = warehouseStore.allWarehouses;
	const isLoading = all === "loading";
	const warehouse: Warehouse | null = useMemo(
		() => (all === "loading" ? null : (all.find((w) => w.id === warehouseId) ?? null)),
		[all, warehouseId],
	);

	// Drive the selected-warehouse store (loads movements) from the route.
	useEffect(() => {
		warehouseStore.setSelectedWarehouse(warehouse);
		return () => warehouseStore.setSelectedWarehouse(null);
	}, [warehouse, warehouseStore]);

	if (isLoading) {
		return (
			<Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
				<CircularProgress />
			</Box>
		);
	}

	if (!warehouse) {
		return (
			<Box>
				<Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/warehouses")}>
					{translate("warehouse.title")}
				</Button>
				<Typography variant="body2" sx={{ color: "text.secondary", py: 6, textAlign: "center" }}>
					{translate("warehouse.detail.notFound")}
				</Typography>
			</Box>
		);
	}

	const stats = getWarehouseStats(warehouse);
	const closeMenu = () => setMenuAnchor(null);
	const runMenu = (action: () => void) => () => {
		closeMenu();
		action();
	};

	return (
		<Box>
			{/* Header */}
			<Box
				sx={{
					display: "flex",
					alignItems: "flex-start",
					justifyContent: "space-between",
					flexWrap: "wrap",
					gap: 2,
					mb: 3,
				}}
			>
				<Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
					<IconButton
						onClick={() => navigate("/warehouses")}
						sx={{ border: 1, borderColor: "divider", color: "text.secondary" }}
					>
						<ArrowBackIcon fontSize="small" />
					</IconButton>
					<Box sx={{ minWidth: 0 }}>
						<Typography variant="h1">{warehouse.name}</Typography>
						<Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
							{warehouse.location || translate("warehouse.card.noAddress")}
						</Typography>
					</Box>
				</Box>

				<Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
					<Button
						variant="outlined"
						startIcon={<SwapHorizIcon />}
						onClick={() => warehouseStore.openTransfer(warehouse)}
					>
						{translate("warehouse.detail.action.transfer")}
					</Button>
					<Button
						variant="contained"
						startIcon={<TuneIcon />}
						onClick={() => warehouseStore.openAdjustStock(warehouse)}
					>
						{translate("warehouse.detail.action.adjust")}
					</Button>
					<IconButton
						onClick={(e) => setMenuAnchor(e.currentTarget)}
						sx={{ border: 1, borderColor: "divider", color: "text.secondary" }}
					>
						<MoreVertIcon fontSize="small" />
					</IconButton>
					<Menu
						anchorEl={menuAnchor}
						open={Boolean(menuAnchor)}
						onClose={closeMenu}
						anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
						transformOrigin={{ vertical: "top", horizontal: "right" }}
					>
						<MenuItem onClick={runMenu(() => warehouseStore.openEdit(warehouse))}>
							<ListItemIcon>
								<EditOutlinedIcon fontSize="small" />
							</ListItemIcon>
							<ListItemText>{translate("warehouse.menu.edit")}</ListItemText>
						</MenuItem>
						<MenuItem
							onClick={runMenu(() => warehouseStore.archive(warehouse))}
							sx={{ color: "secondary.dark" }}
						>
							<ListItemIcon>
								<ArchiveOutlinedIcon fontSize="small" sx={{ color: "secondary.dark" }} />
							</ListItemIcon>
							<ListItemText>{translate("warehouse.menu.archive")}</ListItemText>
						</MenuItem>
					</Menu>
				</Box>
			</Box>

			{/* Summary */}
			<Box
				sx={{
					display: "grid",
					gap: 2,
					gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
					mb: 3,
				}}
			>
				<StatCard
					icon={<Inventory2OutlinedIcon />}
					tone="teal"
					caption={translate("warehouse.card.products")}
					value={stats.products.toString()}
				/>
				<StatCard
					icon={<LayersOutlinedIcon />}
					tone="teal"
					caption={translate("warehouse.card.units")}
					value={formatMoney(stats.units)}
				/>
				<StatCard
					icon={<PaymentsOutlinedIcon />}
					tone="saffron"
					caption={translate("warehouse.card.value")}
					value={stats.value === null ? "—" : formatMoney(stats.value)}
					unit={stats.value === null ? undefined : "UZS"}
				/>
			</Box>

			{/* Tabs */}
			<Tabs
				value={tab}
				onChange={(_, v) => setTab(v)}
				sx={{
					mb: 2,
					"& .MuiTab-root": { textTransform: "none", fontWeight: 500, fontSize: "0.9375rem" },
				}}
			>
				<Tab value="stock" label={translate("warehouse.detail.tab.stock")} />
				<Tab value="movements" label={translate("warehouse.detail.tab.movements")} />
			</Tabs>

			{tab === "stock" ? (
				<DetailStockTab warehouse={warehouse} />
			) : (
				<DetailMovementsTab warehouseId={warehouse.id} />
			)}

			<WarehouseDialogs />
		</Box>
	);
});

export default WarehouseDetailPage;
