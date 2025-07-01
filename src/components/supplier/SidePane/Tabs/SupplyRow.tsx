import React from "react";
import {
	KeyboardArrowDown as KeyboardArrowDownIcon,
	KeyboardArrowUp as KeyboardArrowUpIcon,
} from "@mui/icons-material";
import {
	Box,
	Collapse,
	IconButton,
	Link,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
} from "@mui/material";
import { translate } from "i18n/i18n";
import { Supply } from "models/supply";
import { formatDate, formatPrice } from "utils/supplyUtils";

interface SupplyRowProps {
	supply: Supply;
	isOpen: boolean;
	onToggle: (id: number) => void;
}

export const SupplyRow: React.FC<SupplyRowProps> = ({ supply, isOpen, onToggle }) => (
	<>
		<TableRow hover>
			<TableCell padding="checkbox">
				<IconButton size="medium" onClick={() => onToggle(supply.id)} sx={{ p: 0 }}>
					{isOpen ? (
						<KeyboardArrowUpIcon fontSize="small" />
					) : (
						<KeyboardArrowDownIcon fontSize="small" />
					)}
				</IconButton>
			</TableCell>
			<TableCell>
				<Link href={`/supplies/${supply.id}`} underline="hover">
					{supply.id}
				</Link>
			</TableCell>
			<TableCell>{formatDate(supply.date)}</TableCell>
			<TableCell align="right">{formatPrice(supply.totalDue)}</TableCell>
			<TableCell align="right">{formatPrice(supply.totalPaid)}</TableCell>
			<TableCell>{supply.notes ?? "—"}</TableCell>
		</TableRow>
		<TableRow>
			<TableCell
				style={{ paddingBottom: 0, paddingTop: 0, paddingRight: 0, paddingLeft: 0 }}
				colSpan={6}
			>
				<Collapse in={isOpen} timeout="auto" unmountOnExit>
					<Paper
						elevation={0}
						sx={{
							backgroundColor: (theme) => theme.palette.grey[50],
							margin: 0,
						}}
					>
						<Box sx={{ margin: 0 }}>
							<Table size="small">
								<TableHead>
									<TableRow>
										<TableCell>{translate("fieldProductName")}</TableCell>
										<TableCell align="right">{translate("fieldQuantity")}</TableCell>
										<TableCell align="right">{translate("fieldUnitPrice")}</TableCell>
										<TableCell align="right">{translate("fieldTotalPrice")}</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{supply.items.map((item) => (
										<TableRow key={item.id}>
											<TableCell>
												<Link href={`/products/${item.productId}`} underline="hover">
													{item.productName}
												</Link>
											</TableCell>
											<TableCell align="right">{item.quantity}</TableCell>
											<TableCell align="right">{formatPrice(item.unitPrice)}</TableCell>
											<TableCell align="right">
												{formatPrice(item.quantity * item.unitPrice)}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</Box>
					</Paper>
				</Collapse>
			</TableCell>
		</TableRow>
	</>
);
