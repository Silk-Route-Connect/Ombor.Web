import ProductTypeChip from "components/product/ProductTypeChip";
import { ProductActionMenu } from "components/product/Table/ActionMenu/ProductActionMenu";
import ArchivedBadge from "components/shared/ArchivedBadge/ArchivedBadge";
import { Column } from "components/shared/Table/DataTable/DataTable";
import { ACTIONS_COLUMN_WIDTH } from "components/shared/Table/DataTable/tableConfigs";
import TruncatedText from "components/shared/Table/TruncatedText";
import { TFunction } from "i18next";
import { Product } from "models/product";
import { numericSx, typeScale } from "theme";
import { formatCurrency, formatQuantity } from "utils/formatCurrency";
import { getImageFullUrl, measurementLabel } from "utils/productUtils";

import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import { Box, Typography } from "@mui/material";

interface BuildColumnsOptions {
	t: TFunction;
	onEdit: (product: Product) => void;
	onArchive: (product: Product) => void;
	onRestore: (product: Product) => void;
}

/** Archived rows dim their secondary cells (bundle: tr.is-archived → opacity .55). */
const archivedCellSx = (product: Product) => (product.isArchived ? { opacity: 0.55 } : undefined);

const Dash = () => (
	<Typography component="span" sx={{ color: "text.disabled" }}>
		—
	</Typography>
);

const Money = ({ value, archived }: { value: number | null; archived?: boolean }) =>
	value != null && value > 0 ? (
		<Typography
			component="span"
			sx={{ ...typeScale.numTable, color: "text.primary", opacity: archived ? 0.55 : 1 }}
		>
			{formatCurrency(value)}
		</Typography>
	) : (
		<Dash />
	);

/**
 * Row leading visual per the bundle: the product's image when it has one,
 * otherwise the `.pr-thumb` fallback — a 34×34 rounded tile tinted
 * primary-soft with the primary box icon. Archived rows fade it to 50%.
 */
const ProductThumb = ({ product }: { product: Product }) => {
	const image = product.images?.[0];
	const src = image ? (getImageFullUrl(image.thumbnailUrl ?? image.originalUrl) ?? "") : null;

	return (
		<Box
			sx={{
				width: 34,
				height: 34,
				flex: "0 0 auto",
				borderRadius: "8px",
				overflow: "hidden",
				display: "inline-grid",
				placeItems: "center",
				bgcolor: "primary.light",
				color: "primary.main",
				opacity: product.isArchived ? 0.5 : 1,
			}}
		>
			{src ? (
				<Box
					component="img"
					src={src}
					alt={product.name}
					sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
				/>
			) : (
				<Inventory2OutlinedIcon sx={{ fontSize: 17 }} />
			)}
		</Box>
	);
};

/**
 * Columns built at render time so labels resolve through the live `t`
 * (docs/conventions.md — no `t()` at module scope). Order follows the canonical
 * table convention: №/ID (SKU) → primary entity (name) → type chip → descriptive
 * (category, unit) → money (stock, prices, right + tabular) → ⋮ actions. Sorting,
 * search, filtering and pagination are all client-side via the store + DataTable.
 */
export function buildProductColumns({
	t,
	onEdit,
	onArchive,
	onRestore,
}: BuildColumnsOptions): Column<Product>[] {
	return [
		{
			key: "sku",
			field: "sku",
			headerName: t("product.table.sku"),
			width: "12%",
			renderCell: (product) => (
				<Typography
					component="span"
					sx={{
						...numericSx,
						fontSize: 12.5,
						fontWeight: 500,
						color: "text.secondary",
						...archivedCellSx(product),
					}}
				>
					{product.sku}
				</Typography>
			),
		},
		{
			key: "name",
			field: "name",
			headerName: t("product.table.name"),
			width: "24%",
			renderCell: (product) => (
				<Box sx={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
					<ProductThumb product={product} />
					<TruncatedText
						text={product.name}
						maxWidth={260}
						sx={{
							flex: 1,
							minWidth: 0,
							fontWeight: 600,
							color: product.isArchived ? "text.secondary" : "primary.main",
							textDecoration: product.isArchived ? "line-through" : "none",
						}}
					/>
					{product.isArchived && <ArchivedBadge />}
				</Box>
			),
		},
		{
			key: "type",
			field: "type",
			headerName: t("product.table.type"),
			width: "9%",
			renderCell: (product) => <ProductTypeChip type={product.type} dimmed={product.isArchived} />,
		},
		{
			key: "categoryName",
			field: "categoryName",
			headerName: t("product.table.category"),
			width: "13%",
			renderCell: (product) =>
				product.categoryName ? (
					<Typography component="span" sx={{ color: "text.secondary", ...archivedCellSx(product) }}>
						{product.categoryName}
					</Typography>
				) : (
					<Dash />
				),
		},
		{
			key: "measurement",
			field: "measurement",
			headerName: t("product.table.measurement"),
			width: "11%",
			renderCell: (product) => (
				<Typography
					component="span"
					sx={{ color: "text.secondary", whiteSpace: "nowrap", ...archivedCellSx(product) }}
				>
					{measurementLabel(t, product.measurement)}
				</Typography>
			),
		},
		{
			key: "totalStock",
			field: "totalStock",
			headerName: t("product.table.stock"),
			width: "9%",
			align: "right",
			renderCell: (product) => (
				<Typography
					component="span"
					sx={{
						...typeScale.numTable,
						color: product.totalStock === 0 ? "error.main" : "text.primary",
						...archivedCellSx(product),
					}}
				>
					{formatQuantity(product.totalStock)}
				</Typography>
			),
		},
		{
			key: "salePrice",
			field: "salePrice",
			headerName: t("product.table.salePrice"),
			width: "11%",
			align: "right",
			renderCell: (product) => <Money value={product.salePrice} archived={product.isArchived} />,
		},
		{
			key: "supplyPrice",
			field: "supplyPrice",
			headerName: t("product.table.supplyPrice"),
			width: "11%",
			align: "right",
			renderCell: (product) => <Money value={product.supplyPrice} archived={product.isArchived} />,
		},
		{
			key: "actions",
			headerName: "",
			width: ACTIONS_COLUMN_WIDTH,
			align: "right",
			renderCell: (product) => (
				<ProductActionMenu
					product={product}
					onEdit={() => onEdit(product)}
					onArchive={() => onArchive(product)}
					onRestore={() => onRestore(product)}
				/>
			),
		},
	];
}
