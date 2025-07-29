import React, { useRef } from "react";
import { Box, Divider, Grid, Paper } from "@mui/material";
import { TransactionFormType } from "hooks/transactions/useCreateTransactionForm";
import { DebtPayment, TransactionPaymentRecord } from "models/transaction";

import DetailsSection from "./Sections/Details/DetailsSection";
import LinesSection from "./Sections/Details/LinesSection";
import { LinesTableHandle } from "./Sections/Details/LinesTable";
import ProductSelectionSection from "./Sections/Details/ProductSelectionSection";
import { ProductTableHandle } from "./Sections/Details/ProductTable";
import PaymentSection from "./Sections/Payment/PaymentSection";

export type TransactionFormMode = "Sale" | "Supply";

export type TransactionFormLinePayload = {
	productId: number;
	productName: string;
	quantity: number;
	unitPrice: number;
	discount: number;
};

export interface TransactionFormPayload {
	partnerId: number;
	type: TransactionFormMode;
	lines: TransactionFormLinePayload[];
	payments: TransactionPaymentRecord[];
	debtPayments?: DebtPayment[];
	notes?: string;
	attachments?: File[];
	shouldReturnChange: boolean;
}

interface TransactionFormProps {
	mode: TransactionFormMode;
	form: TransactionFormType;
	onSave: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ mode, form, onSave }) => {
	const prodTableRef = useRef<ProductTableHandle>(null);
	const linesRef = useRef<LinesTableHandle>(null);

	return (
		<Grid container spacing={3} sx={{ height: "100%" }}>
			<Grid size={{ xs: 12, md: 8 }} sx={{ height: "100%" }}>
				<Paper
					elevation={2}
					sx={{
						p: 2,
						border: 1,
						borderColor: "divider",
						height: "100%",
						display: "flex",
						flexDirection: "column",
						overflow: "hidden",
					}}
				>
					<DetailsSection form={form} mode={mode} />

					<Box
						sx={{
							flexGrow: 1,
							minHeight: 0,
							display: "flex",
							flexDirection: "column",
							mt: 3,
						}}
					>
						{mode === "Supply" && (
							<Box sx={{ flex: 1, minHeight: 0, mt: 0 }}>
								<ProductSelectionSection
									form={form}
									mode={mode}
									productTableRef={prodTableRef}
									linesRef={linesRef}
								/>
							</Box>
						)}

						{mode === "Supply" && <Divider />}

						<Box sx={{ flex: 1, minHeight: 0, mt: mode === "Supply" ? 2 : 0 }}>
							<LinesSection
								mode={mode}
								form={form}
								linesRef={linesRef}
								onReturnFocus={() => prodTableRef.current?.focus()}
							/>
						</Box>

						{mode === "Sale" && (
							<Box sx={{ flex: 1, minHeight: 0, mt: 2 }}>
								<ProductSelectionSection
									form={form}
									mode={mode}
									productTableRef={prodTableRef}
									linesRef={linesRef}
								/>
							</Box>
						)}
					</Box>
				</Paper>
			</Grid>

			<Grid size={{ xs: 12, md: 4 }} sx={{ height: "100%" }}>
				<Paper
					elevation={2}
					sx={{
						p: 2,
						border: 1,
						borderColor: "divider",
						height: "100%",
						display: "flex",
						flexDirection: "column",
					}}
				>
					<PaymentSection form={form} onSave={onSave} />
				</Paper>
			</Grid>
		</Grid>
	);
};

export default TransactionForm;
