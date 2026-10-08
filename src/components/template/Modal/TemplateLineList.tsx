import React from "react";
import { useTranslation } from "react-i18next";
import UzsUnit from "components/shared/Money/UzsUnit";
import { Product } from "models/product";
import { TemplateFormInputs } from "schemas/TemplateSchema";
import { designTokens, numericSx, radius } from "theme";
import { formatCurrency } from "utils/formatCurrency";

import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import { Box, Typography } from "@mui/material";

import TemplateLineRow from "./TemplateLineRow";

type TemplateLine = TemplateFormInputs["items"][number];

interface TemplateLineListProps {
	/** Field-array rows (keys) and the watched values they edit. */
	items: TemplateLine[];
	values: TemplateLine[] | undefined;
	products: Product[];
	/** The draft basket total (display only — the template is not a money event). */
	total: number;
	error: boolean;
	disabled: boolean;
	onUpdate: (index: number, patch: Partial<TemplateLine>) => void;
	onRemove: (index: number) => void;
}

/** The template's lines card: «Товары · N» with the basket total, the rows or the empty state. */
const TemplateLineList: React.FC<TemplateLineListProps> = ({
	items,
	values,
	products,
	total,
	error,
	disabled,
	onUpdate,
	onRemove,
}) => {
	const { t } = useTranslation();

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
					{t("template.form.itemsTitle")}{" "}
					<Box component="span" sx={{ color: "text.disabled", fontWeight: 500 }}>
						· {items.length}
					</Box>
				</Typography>
				{items.length > 0 && (
					<Typography sx={{ fontSize: 13, color: "text.secondary" }}>
						{t("template.form.total")}:{" "}
						<Box component="b" sx={{ ...numericSx, color: "text.primary", fontWeight: 700 }}>
							{formatCurrency(total)}
						</Box>
						<UzsUnit />
					</Typography>
				)}
			</Box>

			{items.length === 0 ? (
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
						{t("template.form.emptyTitle")}
					</Typography>
					<Typography sx={{ fontSize: 13, color: "text.secondary", mt: "3px" }}>
						{t("template.form.emptyBody")}
					</Typography>
					{error && (
						<Typography sx={{ fontSize: 13, color: "error.main", mt: "8px" }}>
							{t("template.validation.itemsRequired")}
						</Typography>
					)}
				</Box>
			) : (
				items.map((item, index) => {
					const line = values?.[index];
					const product = products.find((p) => p.id === line?.productId);
					return (
						<TemplateLineRow
							key={item.productId}
							productName={item.productName}
							sku={product?.sku ?? ""}
							quantity={line?.quantity ?? 1}
							unitPrice={line?.unitPrice ?? 0}
							disabled={disabled}
							onChange={(patch) => onUpdate(index, patch)}
							onRemove={() => onRemove(index)}
						/>
					);
				})
			)}
		</Box>
	);
};

export default TemplateLineList;
