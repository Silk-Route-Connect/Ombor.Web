import React from "react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import { ActionMenuRow } from "components/shared/ActionMenuCell/MenuActionCell";
import DetailPageHeader from "components/shared/Detail/DetailPageHeader";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { Order } from "models/order";
import { PATHS, saleDetailPath } from "routing/paths";
import { designTokens, numericSx } from "theme";
import { formatEntityId } from "utils/formatEntityId";
import { isOrderEditable, ORDER_NEXT_STEP, PRE_DELIVERY } from "utils/orderUtils";

import CheckIcon from "@mui/icons-material/Check";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import { Box, Typography } from "@mui/material";

const STEP_ICON: Record<string, React.ReactNode> = {
	process: <CheckIcon />,
	ship: <LocalShippingOutlinedIcon />,
	deliver: <CheckIcon />,
};

interface OrderDetailHeaderProps {
	order: Order;
	onAdvance: (order: Order) => void;
	onEdit: (order: Order) => void;
	onCancel: (order: Order) => void;
	onReject: (order: Order) => void;
	onReturn: (order: Order) => void;
	onDownload: () => void;
}

/**
 * The promoted / original Sale reference tile beside the actions — a real
 * router link to the sale's detail (the backend promotes a Delivered order to a
 * real Sale; `saleId` is its transaction id). Entity-link affordance: pointer +
 * underline-on-hover on the «№…» number.
 */
const SaleLink: React.FC<{
	caption: string;
	saleId: number;
	muted?: boolean;
}> = ({ caption, saleId, muted }) => (
	<Box
		component={RouterLink}
		to={saleDetailPath(saleId)}
		sx={{
			display: "flex",
			alignItems: "center",
			gap: "11px",
			p: "7px 12px",
			borderRadius: "8px",
			cursor: "pointer",
			border: "1px solid",
			textDecoration: "none",
			"&:hover .sale-link-num": { textDecoration: "underline" },
			...(muted
				? {
						bgcolor: designTokens.gray50,
						borderColor: designTokens.gray200,
						color: "text.secondary",
					}
				: {
						bgcolor: designTokens.successBg,
						borderColor: designTokens.successBorder,
						color: "success.main",
					}),
		}}
	>
		<ReceiptLongOutlinedIcon sx={{ fontSize: 17 }} />
		<Box>
			<Typography sx={{ fontSize: 11, lineHeight: 1.2 }}>{caption}</Typography>
			<Typography
				className="sale-link-num"
				sx={{ ...numericSx, fontWeight: 700, fontSize: 13.5, lineHeight: 1.3 }}
			>
				{formatEntityId(saleId)}
			</Typography>
		</Box>
		<ChevronRightIcon sx={{ fontSize: 16 }} />
	</Box>
);

/** Status-aware kebab rows for the shared ActionMenu (DSN-1 tones). */
function buildOrderActionRows(
	t: (key: string) => string,
	order: Order,
	handlers: Pick<
		OrderDetailHeaderProps,
		"onEdit" | "onCancel" | "onReject" | "onReturn" | "onDownload"
	>,
): ActionMenuRow[] {
	const rows: ActionMenuRow[] = [];

	if (isOrderEditable(order.status)) {
		rows.push({
			key: "edit",
			label: t("common.edit"),
			icon: <EditOutlinedIcon fontSize="small" />,
			onClick: () => handlers.onEdit(order),
		});
	}

	rows.push({
		key: "download",
		label: t("order.action.download"),
		icon: <DownloadOutlinedIcon fontSize="small" />,
		onClick: handlers.onDownload,
	});

	if (order.status === "Delivered") {
		rows.push({
			key: "return",
			label: t("order.action.return"),
			icon: <UndoOutlinedIcon fontSize="small" />,
			tone: "danger",
			onClick: () => handlers.onReturn(order),
		});
	}

	if (PRE_DELIVERY.includes(order.status)) {
		rows.push(
			{
				key: "reject",
				label: t("order.action.reject"),
				icon: <CloseIcon fontSize="small" />,
				tone: "warn",
				dividerBefore: true,
				onClick: () => handlers.onReject(order),
			},
			{
				key: "cancel",
				label: t("order.action.cancel"),
				icon: <DeleteOutlineIcon fontSize="small" />,
				tone: "danger",
				onClick: () => handlers.onCancel(order),
			},
		);
	}

	return rows;
}

/**
 * Order detail header on the shared {@link DetailPageHeader}: the «№…» title
 * ONLY (name-only rule — status/source/customer/created-on live in the stepper,
 * sidebar and history sections), with the forward-transition button + Sale
 * reference tile in the primary-action slot.
 */
export const OrderDetailHeader: React.FC<OrderDetailHeaderProps> = ({
	order,
	onAdvance,
	onEdit,
	onCancel,
	onReject,
	onReturn,
	onDownload,
}) => {
	const { t } = useTranslation();
	const step = ORDER_NEXT_STEP[order.status];

	return (
		<DetailPageHeader
			backTo={PATHS.orders}
			title={formatEntityId(order.orderNumber)}
			primaryAction={
				<>
					{step && (
						<PrimaryButton icon={STEP_ICON[step.action]} onClick={() => onAdvance(order)}>
							{t(`order.action.${step.action}`)}
						</PrimaryButton>
					)}
					{order.status === "Delivered" && order.saleId != null && (
						<SaleLink caption={t("order.detail.promotedSale")} saleId={order.saleId} />
					)}
					{order.status === "Returned" && order.saleId != null && (
						<SaleLink caption={t("order.detail.originalSale")} saleId={order.saleId} muted />
					)}
				</>
			}
			actions={buildOrderActionRows(t, order, { onEdit, onCancel, onReject, onReturn, onDownload })}
		/>
	);
};

export default OrderDetailHeader;
