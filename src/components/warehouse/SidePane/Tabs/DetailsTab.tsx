import React from "react";
import { translate } from "i18n/i18n";
import { Warehouse } from "models/warehouse";
import { valueOrPlaceholder } from "utils/stringUtils";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Box, Button, Chip, Divider, Typography } from "@mui/material";

interface InfoTabProps {
	warehouse: Warehouse;
	onEdit: (warehouse: Warehouse) => void;
	onDelete: (warehouse: Warehouse) => void;
}

const DetailsTab: React.FC<InfoTabProps> = ({ warehouse, onEdit, onDelete }) => {
	return (
		<Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
			<Box sx={{ flex: 1, overflow: "auto", p: 3 }}>
				<Box mb={3}>
					<Typography variant="subtitle2" color="text.secondary" gutterBottom>
						{translate("warehouse.sidePane.info.details")}
					</Typography>

					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: "1fr 1fr",
							gap: 2,
							mt: 2,
						}}
					>
						<Box>
							<Typography variant="caption" color="text.secondary">
								{translate("warehouse.field.name")}
							</Typography>
							<Typography variant="body1" fontWeight={500}>
								{warehouse.name}
							</Typography>
						</Box>

						<Box>
							<Typography variant="caption" color="text.secondary">
								{translate("warehouse.field.status")}
							</Typography>
							<Box mt={0.5}>
								<Chip
									label={translate(
										warehouse.isActive ? "warehouse.status.active" : "warehouse.status.inactive",
									)}
									color={warehouse.isActive ? "success" : "default"}
									size="small"
								/>
							</Box>
						</Box>

						<Box sx={{ gridColumn: "1 / -1" }}>
							<Typography variant="caption" color="text.secondary">
								{translate("warehouse.field.location")}
							</Typography>
							<Typography variant="body1">{valueOrPlaceholder(warehouse.location)}</Typography>
						</Box>
					</Box>
				</Box>

				<Divider sx={{ my: 3 }} />

				<Box>
					<Typography variant="subtitle2" color="text.secondary" gutterBottom>
						{translate("warehouse.sidePane.info.statistics")}
					</Typography>

					<Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mt: 2 }}>
						<Box>
							<Typography variant="caption" color="text.secondary">
								{translate("warehouse.sidePane.info.totalProducts")}
							</Typography>
							<Typography variant="h6">{warehouse.items.length}</Typography>
						</Box>

						<Box>
							<Typography variant="caption" color="text.secondary">
								{translate("warehouse.sidePane.info.totalStock")}
							</Typography>
							<Typography variant="h6">
								{warehouse.items.reduce((sum, item) => sum + item.quantity, 0)}
							</Typography>
						</Box>

						<Box>
							<Typography variant="caption" color="text.secondary">
								{translate("warehouse.sidePane.info.lowStockItems")}
							</Typography>
							<Typography variant="h6" color="error.main">
								{warehouse.items.filter((item) => item.quantity <= item.lowStockThreshold).length}
							</Typography>
						</Box>
					</Box>
				</Box>
			</Box>

			<Box
				sx={{
					p: 2,
					borderTop: 1,
					borderColor: "divider",
					display: "flex",
					gap: 1,
				}}
			>
				<Button
					variant="outlined"
					startIcon={<EditIcon />}
					onClick={() => onEdit(warehouse)}
					fullWidth
				>
					{translate("common.edit")}
				</Button>
				<Button
					variant="outlined"
					color="error"
					startIcon={<DeleteIcon />}
					onClick={() => onDelete(warehouse)}
					fullWidth
				>
					{translate("common.delete")}
				</Button>
			</Box>
		</Box>
	);
};

export default DetailsTab;
