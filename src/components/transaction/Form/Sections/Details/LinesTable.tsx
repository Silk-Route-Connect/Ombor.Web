import React, { forwardRef, useImperativeHandle, useRef } from "react";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import {
	IconButton,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
	useTheme,
} from "@mui/material";
import NumericField from "components/shared/Inputs/NumericField";
import { TransactionFormLinePayload } from "components/shared/Transaction/Form/TransactionFormModal";
import { translate } from "i18n/i18n";

interface Props {
	rows: TransactionFormLinePayload[];
	onUpdate: (productId: number, patch: Partial<TransactionFormLinePayload>) => void;
	onRemove: (productId: number) => void;
	onReturnFocus?: () => void;
}

export interface LinesTableHandle {
	focusQuantity(productId: number): void;
}

const CELL_SX = { py: 1, px: 1 };

const LinesTable = forwardRef<LinesTableHandle, Props>(
	({ rows, onUpdate, onRemove, onReturnFocus }, ref) => {
		const theme = useTheme();
		const quantityRefs = useRef<Map<number, HTMLInputElement>>(new Map<number, HTMLInputElement>());

		useImperativeHandle(ref, () => ({
			focusQuantity: (id) => quantityRefs.current.get(id)?.focus(),
		}));

		return (
			<TableContainer
				sx={{
					height: "100%",
					overflowY: "auto",
					"& .MuiTableRow-root:hover": { bgcolor: "action.hover" },
				}}
			>
				<Table stickyHeader size="small" sx={{ width: "100%", tableLayout: "fixed" }}>
					<TableHead>
						<TableRow sx={{ bgcolor: theme.palette.background.paper }}>
							{/* wider product name, narrower discount & qty */}
							<TableCell sx={{ ...CELL_SX, width: "40%" }}>{translate("product.name")}</TableCell>
							<TableCell sx={{ ...CELL_SX, width: "20%" }} align="left">
								{translate("transaction.line.unitPrice")}
							</TableCell>
							<TableCell sx={{ ...CELL_SX, width: "15%" }} align="left">
								{translate("transaction.line.discount")}
							</TableCell>
							<TableCell sx={{ ...CELL_SX, width: "15%" }} align="left">
								{translate("transaction.line.quantity")}
							</TableCell>
							<TableCell sx={{ ...CELL_SX, width: "15%" }} align="right">
								{translate("transaction.line.total")}
							</TableCell>
							<TableCell sx={{ ...CELL_SX, width: 48 }} />
						</TableRow>
					</TableHead>

					<TableBody>
						{rows.map((row) => {
							const total = row.unitPrice * row.quantity - (row.discount ?? 0);

							return (
								<TableRow key={row.productId}>
									<TableCell sx={CELL_SX}>{row.productName}</TableCell>

									<TableCell sx={CELL_SX} align="left">
										<NumericField
											size="small"
											value={row.unitPrice}
											onChange={(e) =>
												onUpdate(row.productId, { unitPrice: Number(e.target.value) })
											}
											fullWidth
										/>
									</TableCell>

									<TableCell sx={CELL_SX} align="left">
										<NumericField
											size="small"
											value={row.discount ?? 0}
											onChange={(e) =>
												onUpdate(row.productId, { discount: Number(e.target.value) })
											}
											fullWidth
										/>
									</TableCell>

									<TableCell sx={CELL_SX} align="left">
										<NumericField
											inputRef={(el) => el && quantityRefs.current.set(row.productId, el)}
											size="small"
											value={row.quantity}
											onChange={(e) =>
												onUpdate(row.productId, { quantity: Number(e.target.value) })
											}
											onKeyDown={(e) => {
												if (e.key === "Enter") {
													e.preventDefault();
													onReturnFocus?.(); // focus product table
												}
											}}
											fullWidth
										/>
									</TableCell>

									<TableCell sx={CELL_SX} align="right">
										<Typography fontWeight={500}>{total.toLocaleString()}</Typography>
									</TableCell>

									<TableCell sx={CELL_SX}>
										<IconButton
											size="small"
											color="error"
											onClick={() => onRemove(row.productId)}
											aria-label={translate("actionDelete")}
										>
											<DeleteForeverIcon fontSize="small" />
										</IconButton>
									</TableCell>
								</TableRow>
							);
						})}

						{rows.length === 0 && (
							<TableRow>
								<TableCell colSpan={6} sx={{ py: 3 }}>
									<Typography variant="body2" color="text.secondary" align="center">
										{translate("transaction.noLines")}
									</Typography>
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</TableContainer>
		);
	},
);

LinesTable.displayName = "LinesTable";
export default LinesTable;
