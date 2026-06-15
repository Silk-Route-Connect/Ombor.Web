import React from "react";
import { useTranslation } from "react-i18next";
import OrderCard from "components/order/Detail/OrderCard";
import OrderStatusChip from "components/order/OrderStatusChip";
import { Order } from "models/order";
import { designTokens, numericSx } from "theme";
import { formatDate } from "utils/dateUtils";
import { ORDER_STATUS_META, OrderStatusTone } from "utils/orderUtils";

import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import { Box, Typography, useTheme } from "@mui/material";

const timeOf = (iso: string): string => {
	const d = new Date(iso);
	const pad = (n: number) => n.toString().padStart(2, "0");
	return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const StatusHistoryCard: React.FC<{ order: Order }> = ({ order }) => {
	const { t } = useTranslation();
	const theme = useTheme();
	const events = order.history.slice().reverse();

	const toneColor = (tone: OrderStatusTone): string =>
		tone === "neutral" ? designTokens.gray400 : theme.palette[tone].main;

	return (
		<OrderCard
			title={t("order.detail.history")}
			icon={<HistoryOutlinedIcon sx={{ fontSize: 17, color: "text.secondary" }} />}
			count={order.history.length}
		>
			<Box sx={{ p: "18px" }}>
				{events.map((h, i) => {
					const last = i === events.length - 1;
					const dotColor = toneColor(ORDER_STATUS_META[h.to].tone);
					return (
						<Box key={i} sx={{ display: "grid", gridTemplateColumns: "26px 1fr", gap: "12px" }}>
							<Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
								<Box
									sx={{
										width: 12,
										height: 12,
										borderRadius: "50%",
										flex: "0 0 auto",
										mt: "3px",
										bgcolor: dotColor,
										boxShadow: `0 0 0 2px ${dotColor}`,
										border: "2px solid",
										borderColor: "background.paper",
									}}
								/>
								{!last && (
									<Box sx={{ width: 2, flex: 1, mt: "4px", bgcolor: designTokens.gray300 }} />
								)}
							</Box>
							<Box sx={{ pb: last ? 0 : "18px" }}>
								<Typography sx={{ ...numericSx, fontSize: 12.5, color: "text.disabled" }}>
									{formatDate(h.at)}, {timeOf(h.at)}
								</Typography>
								<Box sx={{ display: "flex", alignItems: "center", gap: "9px", mt: "5px" }}>
									{h.from ? (
										<>
											<OrderStatusChip status={h.from} />
											<ChevronRightIcon sx={{ fontSize: 13, color: "text.disabled" }} />
											<OrderStatusChip status={h.to} />
										</>
									) : (
										<>
											<OrderStatusChip status={h.to} />
											<Typography sx={{ fontSize: 12, color: "text.secondary" }}>
												{t("order.detail.created")}
											</Typography>
										</>
									)}
								</Box>
								<Typography sx={{ fontSize: 12.5, color: "text.secondary", mt: "4px" }}>
									{h.by}
								</Typography>
							</Box>
						</Box>
					);
				})}
			</Box>
		</OrderCard>
	);
};

export default StatusHistoryCard;
