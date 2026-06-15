import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import DeliveryInfoCard from "components/order/Detail/DeliveryInfoCard";
import OrderDetailHeader from "components/order/Detail/OrderDetailHeader";
import OrderPositionsCard from "components/order/Detail/OrderPositionsCard";
import OrderSidebar from "components/order/Detail/OrderSidebar";
import OrderStepper from "components/order/Detail/OrderStepper";
import StatusHistoryCard from "components/order/Detail/StatusHistoryCard";
import TerminalBanner from "components/order/Detail/TerminalBanner";
import DeliveryConfirmModal from "components/order/Modal/DeliveryConfirmModal";
import OrderFormModal from "components/order/Modal/OrderFormModal";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import { observer } from "mobx-react-lite";
import { partnerDetailPath, PATHS } from "routing/paths";
import { useStore } from "stores/StoreContext";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import { Box, CircularProgress, Typography } from "@mui/material";

const OrderDetailPage: React.FC = observer(() => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const orderId = Number(id);
	const { orderStore, notificationStore } = useStore();

	useEffect(() => {
		if (orderStore.allOrders === "loading") {
			void orderStore.getAll();
		}
	}, [orderStore]);

	if (orderStore.allOrders === "loading") {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
				<CircularProgress />
			</Box>
		);
	}

	const order = orderStore.orderById(orderId);
	if (!order) {
		return (
			<Box sx={{ py: 10, textAlign: "center" }}>
				<Typography sx={{ color: "text.secondary" }}>{t("order.detail.notFound")}</Typography>
			</Box>
		);
	}

	const goBack = () => navigate(PATHS.orders);
	const openCustomer = () => navigate(partnerDetailPath(order.customerId));
	const openSale = (saleId: number) =>
		notificationStore.info(t("order.detail.openSaleInfo", { id: saleId }));

	const twoColSx = {
		display: "grid",
		gridTemplateColumns: { xs: "1fr", md: "1fr 372px" },
		gap: "20px",
		alignItems: "start",
	} as const;

	const dialog = orderStore.dialogMode;

	return (
		<Box>
			<OrderDetailHeader
				order={order}
				onBack={goBack}
				onAdvance={orderStore.advance}
				onEdit={orderStore.openEdit}
				onCancel={orderStore.openCancel}
				onReject={orderStore.openReject}
				onReturn={orderStore.openReturn}
				onOpenSale={openSale}
				onOpenCustomer={openCustomer}
				onDownload={() => notificationStore.info(t("order.detail.downloadInfo"))}
			/>

			<OrderStepper order={order} />
			<TerminalBanner order={order} />

			<Box sx={twoColSx}>
				<Box sx={{ display: "flex", flexDirection: "column", gap: "16px", minWidth: 0 }}>
					<OrderPositionsCard order={order} />
					<DeliveryInfoCard order={order} />
					<StatusHistoryCard order={order} />
				</Box>
				<Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
					<OrderSidebar order={order} onOpenCustomer={openCustomer} />
				</Box>
			</Box>

			<OrderFormModal
				isOpen={dialog.kind === "edit"}
				isSaving={orderStore.isSaving}
				order={dialog.kind === "edit" ? dialog.order : null}
				onClose={orderStore.closeDialog}
				onSave={(payload) => orderStore.update(payload)}
			/>

			<DeliveryConfirmModal
				isOpen={dialog.kind === "delivery"}
				isSaving={orderStore.isSaving}
				order={dialog.kind === "delivery" ? dialog.order : null}
				onClose={orderStore.closeDialog}
				onConfirm={(warehouseId) =>
					dialog.kind === "delivery" && orderStore.deliver(dialog.order.id, warehouseId)
				}
			/>

			<ConfirmDialog
				isOpen={dialog.kind === "cancel"}
				icon={<UndoOutlinedIcon sx={{ fontSize: 22 }} />}
				iconTone="warning"
				title={t("order.confirm.cancel.title", {
					number: dialog.kind === "cancel" ? dialog.order.orderNumber : "",
				})}
				content={t("order.confirm.cancel.body", {
					customer: dialog.kind === "cancel" ? dialog.order.customerName : "",
				})}
				confirmLabel={t("order.confirm.cancel.confirm")}
				cancelLabel={t("order.confirm.back")}
				confirmVariant="danger"
				onConfirm={() => dialog.kind === "cancel" && orderStore.cancel(dialog.order.id)}
				onCancel={orderStore.closeDialog}
			/>

			<ConfirmDialog
				isOpen={dialog.kind === "reject"}
				icon={<ReportProblemOutlinedIcon sx={{ fontSize: 22 }} />}
				iconTone="warning"
				title={t("order.confirm.reject.title", {
					number: dialog.kind === "reject" ? dialog.order.orderNumber : "",
				})}
				content={t("order.confirm.reject.body")}
				confirmLabel={t("order.confirm.reject.confirm")}
				cancelLabel={t("order.confirm.back")}
				confirmVariant="danger"
				onConfirm={() => dialog.kind === "reject" && orderStore.reject(dialog.order.id)}
				onCancel={orderStore.closeDialog}
			/>

			<ConfirmDialog
				isOpen={dialog.kind === "return"}
				icon={<DeleteOutlineIcon sx={{ fontSize: 22 }} />}
				iconTone="warning"
				title={t("order.confirm.return.title", {
					number: dialog.kind === "return" ? dialog.order.orderNumber : "",
				})}
				content={t("order.confirm.return.body", {
					saleId: dialog.kind === "return" ? (dialog.order.saleId ?? "") : "",
				})}
				confirmLabel={t("order.confirm.return.confirm")}
				cancelLabel={t("order.confirm.back")}
				confirmVariant="danger"
				onConfirm={() => dialog.kind === "return" && orderStore.returnOrder(dialog.order.id)}
				onCancel={orderStore.closeDialog}
			/>
		</Box>
	);
});

export default OrderDetailPage;
