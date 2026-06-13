import ArchivedBadge from "components/product/ArchivedBadge";
import ProductTypeChip from "components/product/ProductTypeChip";
import { ProductActionMenu } from "components/product/Table/ActionMenu/ProductActionMenu";
import { Column } from "components/shared/Table/DataTable/DataTable";
import { TFunction } from "i18next";
import { Product } from "models/product";
import { numericSx } from "theme";
import { formatCurrency, formatQuantity } from "utils/formatCurrency";
import { getImageFullUrl, MEASUREMENT_SHORT } from "utils/productUtils";

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
			sx={{
				...numericSx,
				fontWeight: 600,
				color: "text.primary",
				opacity: archived ? 0.55 : 1,
			}}
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
	const image = product.images[0];
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
 * (docs/conventions.md — no `t()` at module scope). Sorting, search, filtering
 * and pagination are all client-side via the store + shared DataTable.
 */
export function buildProductColumns({
	t,
	onEdit,
	onArchive,
	onRestore,
}: BuildColumnsOptions): Column<Product>[] {
	return [
		{
			key: "name",
			field: "name",
			headerName: t("product.table.name"),
			width: "26%",
			sortable: true,
			renderCell: (product) => (
				<Box sx={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
					<ProductThumb product={product} />
					<Typography
						component="span"
						sx={{
							fontWeight: 600,
							color: product.isArchived ? "text.secondary" : "primary.main",
							textDecoration: product.isArchived ? "line-through" : "none",
							overflow: "hidden",
							textOverflow: "ellipsis",
							whiteSpace: "nowrap",
						}}
					>
						{product.name}
					</Typography>
					{product.isArchived && <ArchivedBadge />}
				</Box>
			),
		},
		{
			key: "sku",
			field: "sku",
			headerName: t("product.table.sku"),
			width: "11%",
			sortable: true,
			renderCell: (product) => (
				<Typography
					component="span"
					sx={{
						...numericSx,
						fontSize: 12.5,
						color: "text.secondary",
						...archivedCellSx(product),
					}}
				>
					{product.sku}
				</Typography>
			),
		},
		{
			key: "categoryName",
			field: "categoryName",
			headerName: t("product.table.category"),
			width: "15%",
			sortable: true,
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
			headerName: t("product.table.measurement"),
			width: "8%",
			renderCell: (product) => (
				<Typography component="span" sx={{ color: "text.secondary", ...archivedCellSx(product) }}>
					{MEASUREMENT_SHORT[product.measurement]}
				</Typography>
			),
		},
		{
			key: "type",
			field: "type",
			headerName: t("product.table.type"),
			width: "9%",
			sortable: true,
			renderCell: (product) => <ProductTypeChip type={product.type} dimmed={product.isArchived} />,
		},
		{
			key: "totalStock",
			field: "totalStock",
			headerName: t("product.table.stock"),
			width: "9%",
			align: "right",
			sortable: true,
			renderCell: (product) => (
				<Typography
					component="span"
					sx={{
						...numericSx,
						fontWeight: 700,
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
			width: "13%",
			align: "right",
			sortable: true,
			renderCell: (product) => <Money value={product.salePrice} archived={product.isArchived} />,
		},
		{
			key: "supplyPrice",
			field: "supplyPrice",
			headerName: t("product.table.supplyPrice"),
			width: "13%",
			align: "right",
			sortable: true,
			renderCell: (product) => <Money value={product.supplyPrice} archived={product.isArchived} />,
		},
		{
			key: "actions",
			headerName: "",
			width: 56,
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
