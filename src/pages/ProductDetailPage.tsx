import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ProductArchivedBanner from "components/product/Detail/ProductArchivedBanner";
import ProductDetailRail from "components/product/Detail/ProductDetailRail";
import ProductMovementsTab from "components/product/Detail/ProductMovementsTab";
import ProductOverviewTab from "components/product/Detail/ProductOverviewTab";
import ProductTransactionsTab from "components/product/Detail/ProductTransactionsTab";
import ProductFormModal from "components/product/Form/ProductFormModal";
import { ActionMenuRow } from "components/shared/ActionMenuCell/MenuActionCell";
import { DETAIL_RAIL_COLUMNS } from "components/shared/Detail/detailLayout";
import DetailPageHeader from "components/shared/Detail/DetailPageHeader";
import DetailTabs, { DetailTabSpec } from "components/shared/Detail/DetailTabs";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import LoadStateView from "components/shared/LoadState/LoadStateView";
import { isPresent, isReady } from "helpers/Loading";
import { useRouteEntityId } from "hooks/shared/useRouteEntityId";
import { observer } from "mobx-react-lite";
import { CreateProductRequest, Product } from "models/product";
import { PATHS } from "routing/paths";
import { ProductFormValues } from "schemas/ProductSchema";
import { useStore } from "stores/StoreContext";
import { designTokens } from "theme";
import { mapFormPackagingToPackaging } from "utils/productUtils";

import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import UnarchiveOutlinedIcon from "@mui/icons-material/UnarchiveOutlined";
import { Box } from "@mui/material";

type ProductDetailTab = "overview" | "transactions" | "movements";

const ProductDetailPage: React.FC = observer(() => {
	const { t } = useTranslation();
	const productId = useRouteEntityId();
	const { productStore, selectedProductStore } = useStore();

	const [tab, setTab] = useState<ProductDetailTab>("overview");

	useEffect(() => {
		if (productId !== null) {
			void selectedProductStore.load(productId);
		}
		// The same route instance serves every product id — reset the tab too.
		setTab("overview");
		return () => selectedProductStore.clear();
	}, [productId, selectedProductStore]);

	const product = productId === null ? null : selectedProductStore.product;
	const dialogMode = productStore.dialogMode;
	const editingProduct = dialogMode.kind === "form" ? (dialogMode.product ?? null) : null;
	const retry = () => productId !== null && void selectedProductStore.load(productId);

	if (!isPresent(product)) {
		return (
			<LoadStateView
				state={product}
				onRetry={retry}
				errorTitle={t("product.error.getById")}
				notFound={{ title: t("product.detail.notFound"), backTo: PATHS.products }}
			/>
		);
	}

	// Edit/archive/restore only change product fields, never stock history —
	// reflect the fresh product in place rather than refetching the ledgers.
	const handleFormSave = async (
		payload: ProductFormValues,
		imagesToRemove: number[],
	): Promise<void> => {
		const request: CreateProductRequest = {
			categoryId: payload.categoryId,
			name: payload.name,
			sku: payload.sku,
			description: payload.description,
			barcode: payload.barcode,
			salePrice: payload.salePrice,
			supplyPrice: payload.supplyPrice,
			measurement: payload.measurement,
			type: payload.type,
			lowStockThreshold: payload.lowStockThreshold ?? null,
			packaging: mapFormPackagingToPackaging(payload.packaging),
			attachments: payload.attachments,
		};

		const updated = await productStore.update({
			...request,
			id: product.id,
			imagesToDelete: imagesToRemove,
		});
		if (updated) {
			selectedProductStore.applyProduct(updated);
		}
	};

	const handleArchiveConfirmed = async (target: Product): Promise<void> => {
		const updated = await productStore.archive(target);
		if (updated) {
			selectedProductStore.applyProduct(updated);
		}
	};

	const handleRestoreConfirmed = async (target: Product): Promise<void> => {
		const updated = await productStore.restore(target);
		if (updated) {
			selectedProductStore.applyProduct(updated);
		}
	};

	const transactions = selectedProductStore.transactions;
	const movements = selectedProductStore.movements;

	// Edit + Archive/Restore — no delete for products (immutable stock history).
	const actions: ActionMenuRow[] = [
		{
			key: "edit",
			label: t("common.edit"),
			icon: <EditOutlinedIcon fontSize="small" sx={{ color: "text.secondary" }} />,
			onClick: () => productStore.openEdit(product),
		},
		product.isArchived
			? {
					key: "restore",
					label: t("common.restore"),
					labelColor: "success.main",
					dividerBefore: true,
					icon: <UnarchiveOutlinedIcon fontSize="small" sx={{ color: "success.main" }} />,
					onClick: () => productStore.openRestore(product),
				}
			: {
					key: "archive",
					label: t("common.archive"),
					labelColor: designTokens.saffron700,
					dividerBefore: true,
					icon: <ArchiveOutlinedIcon fontSize="small" sx={{ color: designTokens.saffron600 }} />,
					onClick: () => productStore.openArchive(product),
				},
	];

	const tabs: DetailTabSpec<ProductDetailTab>[] = [
		{ key: "overview", label: t("product.detail.tabs.overview") },
		{
			key: "transactions",
			label: t("product.detail.tabs.transactions"),
			count: isReady(transactions) ? transactions.length : undefined,
		},
		{
			key: "movements",
			label: t("product.detail.tabs.movements"),
			count: isReady(movements) ? movements.length : undefined,
		},
	];

	return (
		<Box>
			<DetailPageHeader
				backTo={PATHS.products}
				title={product.name}
				actions={actions}
				isArchived={product.isArchived}
			/>

			{product.isArchived && <ProductArchivedBanner />}

			{/* sale-detail: tabbed main column + persistent 372px rail */}
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: DETAIL_RAIL_COLUMNS,
					gap: "20px",
					alignItems: "start",
				}}
			>
				<Box sx={{ display: "flex", flexDirection: "column", gap: "16px", minWidth: 0 }}>
					<DetailTabs tabs={tabs} active={tab} onChange={setTab} />

					{tab === "overview" && <ProductOverviewTab product={product} />}
					{tab === "transactions" &&
						(!isReady(transactions) ? (
							<LoadStateView
								state={transactions}
								size="section"
								onRetry={retry}
								errorTitle={t("product.error.getTransactions")}
							/>
						) : (
							<ProductTransactionsTab
								transactions={transactions}
								measurement={product.measurement}
							/>
						))}
					{tab === "movements" &&
						(!isReady(movements) ? (
							<LoadStateView
								state={movements}
								size="section"
								onRetry={retry}
								errorTitle={t("product.error.getTransactions")}
							/>
						) : (
							<ProductMovementsTab movements={movements} />
						))}
				</Box>

				<Box sx={{ position: "sticky", top: 0 }}>
					<ProductDetailRail product={product} />
				</Box>
			</Box>

			<ProductFormModal
				isOpen={dialogMode.kind === "form"}
				isSaving={productStore.isSaving}
				product={editingProduct}
				onClose={productStore.closeDialog}
				onSave={handleFormSave}
			/>

			<ConfirmDialog
				isOpen={dialogMode.kind === "archive"}
				icon={<ArchiveOutlinedIcon sx={{ fontSize: 22 }} />}
				iconTone="warning"
				title={t("product.archive.title", {
					name: dialogMode.kind === "archive" ? dialogMode.product.name : "",
				})}
				content={t("product.archive.body")}
				confirmLabel={t("common.archive")}
				cancelLabel={t("common.cancel")}
				confirmVariant="warning"
				onCancel={productStore.closeDialog}
				onConfirm={() => {
					if (dialogMode.kind === "archive") {
						void handleArchiveConfirmed(dialogMode.product);
					}
				}}
			/>

			<ConfirmDialog
				isOpen={dialogMode.kind === "restore"}
				icon={<UnarchiveOutlinedIcon sx={{ fontSize: 22 }} />}
				iconTone="info"
				title={t("product.restore.title", {
					name: dialogMode.kind === "restore" ? dialogMode.product.name : "",
				})}
				content={t("product.restore.body")}
				confirmLabel={t("common.restore")}
				cancelLabel={t("common.cancel")}
				confirmVariant="primary"
				onCancel={productStore.closeDialog}
				onConfirm={() => {
					if (dialogMode.kind === "restore") {
						void handleRestoreConfirmed(dialogMode.product);
					}
				}}
			/>
		</Box>
	);
});

export default ProductDetailPage;
