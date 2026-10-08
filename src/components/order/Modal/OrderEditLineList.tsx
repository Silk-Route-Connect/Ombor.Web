import React from "react";
import { useTranslation } from "react-i18next";
import UzsUnit from "components/shared/Money/UzsUnit";
import { designTokens, numericSx, radius } from "theme";
import { formatCurrency } from "utils/formatCurrency";
import { lineNet } from "utils/orderUtils";

import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import { Box, Typography } from "@mui/material";

import OrderEditLineRow, { EditLine } from "./OrderEditLineRow";

interface OrderEditLineListProps {
	lines: EditLine[];
	error: boolean;
	disabled: boolean;
	onUpdate: (index: number, patch: Partial<EditLine>) => void;
	onRemove: (index: number) => void;
}

/** The order's lines card: «Позиции · N» with the draft total, the rows or the empty state. */
const OrderEditLineList: React.FC<OrderEditLineListProps> = ({
	lines,
	error,
	disabled,
	onUpdate,
	onRemove,
}) => {
	const { t } = useTranslation();
	// The draft total of the lines being edited; the order's served total updates on save.
	const total = lines.reduce((sum, l) => sum + lineNet(l), 0);

	return (
		<Box
			sx={{
				border: "1px solid",
				borderColor: error ? designTokens.errorBorder : "divider",
				borderRadius: `${radius.lg}px`,
				overflow: "hidden",
			}}
		>
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					p: "12px 16px",
					bgcolor: designTokens.bgSubtle,
					borderBottom: "1px solid",
					borderColor: "divider",
				}}
			>
				<Typography sx={{ fontSize: 14, fontWeight: 600 }}>
					{t("order.field.lines")}{" "}
					<Box component="span" sx={{ color: "text.disabled", fontWeight: 500 }}>
						· {lines.length}
					</Box>
				</Typography>
				{lines.length > 0 && (
					<Typography sx={{ fontSize: 13, color: "text.secondary" }}>
						{t("order.edit.total")}:{" "}
						<Box component="b" sx={{ ...numericSx, color: "text.primary", fontWeight: 700 }}>
							{formatCurrency(total)}
						</Box>
						<UzsUnit />
					</Typography>
				)}
			</Box>

			{lines.length === 0 ? (
				<Box sx={{ p: "28px 18px", textAlign: "center" }}>
					<Box
						sx={{
							width: 46,
							height: 46,
							borderRadius: "50%",
							mx: "auto",
							mb: "12px",
							display: "grid",
							placeItems: "center",
							bgcolor: designTokens.gray100,
							color: designTokens.gray500,
						}}
					>
						<Inventory2OutlinedIcon sx={{ fontSize: 22 }} />
					</Box>
					<Typography sx={{ fontSize: 14, fontWeight: 600 }}>
						{t("order.edit.emptyTitle")}
					</Typography>
					<Typography sx={{ fontSize: 13, color: "text.secondary", mt: "3px" }}>
						{t("order.edit.emptyBody")}
					</Typography>
					{error && (
						<Typography sx={{ fontSize: 13, color: "error.main", mt: "8px" }}>
							{t("order.new.cart.emptyErrorTitle")}
						</Typography>
					)}
				</Box>
			) : (
				lines.map((line, index) => (
					<OrderEditLineRow
						key={line.productId}
						line={line}
						disabled={disabled}
						onChange={(patch) => onUpdate(index, patch)}
						onRemove={() => onRemove(index)}
					/>
				))
			)}
		</Box>
	);
};

export default OrderEditLineList;
