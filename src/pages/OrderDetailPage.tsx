import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import DeliveryInfoCard from "components/order/Detail/DeliveryInfoCard";
import OrderDetailHeader from "components/order/Detail/OrderDetailHeader";
import OrderPositionsCard from "components/order/Detail/OrderPositionsCard";
import OrderSidebar from "components/order/Detail/OrderSidebar";
import OrderStepper from "components/order/Detail/OrderStepper";
import StatusHistoryCard from "components/order/Detail/StatusHistoryCard";
import TerminalBanner from "components/order/Detail/TerminalBanner";
import DeliveryConfirmModal from "components/order/Modal/DeliveryConfirmModal";
import OrderFormModal from "components/order/Modal/OrderFormModal";
import { DETAIL_RAIL_COLUMNS } from "components/shared/Detail/detailLayout";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import LoadStateView from "components/shared/LoadState/LoadStateView";
import { isReady } from "helpers/Loading";
import { useRouteEntityId } from "hooks/shared/useRouteEntityId";
import { observer } from "mobx-react-lite";
import { partnerDetailPath, PATHS, saleDetailPath } from "routing/paths";
import { useStore } from "stores/StoreContext";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import { Box } from "@mui/material";

const OrderDetailPage: React.FC = observer(() => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const orderId = useRouteEntityId();
	const { orderStore, notificationStore } = useStore();

	// The page reads the orders cache; a cache that is still empty or failed is (re)fetched.
	useEffect(() => {
		if (!isReady(orderStore.allOrders)) {
			void orderStore.getAll();
		}
	}, [orderStore]);

	const allOrders = orderStore.allOrders;
	const order = orderId === null ? null : orderStore.orderById(orderId);
	if (!isReady(allOrders) || !order) {
		return (
			<LoadStateView
				state={isReady(allOrders) ? null : allOrders}
				onRetry={() => void orderStore.getAll()}
				errorTitle={t("order.error.getAll")}
				notFound={{ title: t("order.detail.notFound"), backTo: PATHS.orders }}
			/>
		);
	}

	const openCustomer = () => navigate(partnerDetailPath(order.customerId));

	const twoColSx = {
		display: "grid",
		gridTemplateColumns: DETAIL_RAIL_COLUMNS,
		gap: "20px",
		alignItems: "start",
	} as const;

	const dialog = orderStore.dialogMode;

	return (
		<Box>
			<OrderDetailHeader
				order={order}
				onAdvance={orderStore.advance}
				onEdit={orderStore.openEdit}
				onCancel={orderStore.openCancel}
				onReject={orderStore.openReject}
				onReturn={orderStore.openReturn}
				onDownload={() => notificationStore.info(t("order.detail.downloadInfo"))}
			/>

			<OrderStepper order={order} />
			<TerminalBanner order={order} onOpenSale={(saleId) => navigate(saleDetailPath(saleId))} />

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
				content={t("order.confirm.return.body")}
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
