import React from "react";
import { useTranslation } from "react-i18next";
import { Order } from "models/order";
import { designTokens, radius } from "theme";
import { ORDER_FLOW } from "utils/orderUtils";

import CheckIcon from "@mui/icons-material/Check";
import { Box, Typography } from "@mui/material";

/**
 * Status stepper across the happy path (Pending → Delivered). Progress is the
 * furthest of the current status and the history, so the current step is always
 * lit even when no history was recorded (live-ui-6); for a halted branch
 * (cancelled/rejected) the history shows how far it got, and every order has at
 * least been Pending. Remaining dots on a halted branch are drawn dashed.
 */
export const OrderStepper: React.FC<{ order: Order }> = ({ order }) => {
	const { t } = useTranslation();
	const reached = order.history.reduce(
		(max, h) => Math.max(max, ORDER_FLOW.indexOf(h.to)),
		Math.max(0, ORDER_FLOW.indexOf(order.status)),
	);
	const completed = order.status === "Delivered" || order.status === "Returned";
	const branchStop = order.status === "Cancelled" || order.status === "Rejected";

	return (
		<Box
			sx={{
				display: "flex",
				alignItems: "flex-start",
				bgcolor: "background.paper",
				border: "1px solid",
				borderColor: "divider",
				borderRadius: `${radius.lg}px`,
				boxShadow: 1,
				p: "20px 26px",
				mb: "18px",
			}}
		>
			{ORDER_FLOW.map((status, i) => {
				const done = completed ? true : branchStop ? i <= reached : i < reached;
				const current = !completed && !branchStop && i === reached;
				const lineDone = completed || i < reached;
				const dashed = branchStop && !done;

				return (
					<React.Fragment key={status}>
						<Box
							sx={{
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								gap: "9px",
								width: 116,
								flex: "0 0 auto",
								textAlign: "center",
							}}
						>
							<Box
								sx={{
									width: 30,
									height: 30,
									borderRadius: "50%",
									display: "grid",
									placeItems: "center",
									border: "2px solid",
									borderStyle: dashed ? "dashed" : "solid",
									transition: "all .15s",
									...(done || current
										? {
												bgcolor: "primary.main",
												borderColor: "primary.main",
												color: designTokens.gray0,
											}
										: {
												bgcolor: "background.paper",
												borderColor: designTokens.gray300,
												color: designTokens.fg3,
											}),
									...(current ? { boxShadow: `0 0 0 4px ${designTokens.primarySoft}` } : null),
								}}
							>
								{done ? (
									<CheckIcon sx={{ fontSize: 16 }} />
								) : current ? (
									<Box
										sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: designTokens.gray0 }}
									/>
								) : null}
							</Box>
							<Typography
								sx={{
									fontSize: 13,
									fontWeight: current ? 700 : 600,
									color: current ? "primary.main" : done ? designTokens.gray700 : "text.secondary",
								}}
							>
								{t(`order.status.${status}`)}
							</Typography>
						</Box>
						{i < ORDER_FLOW.length - 1 && (
							<Box
								sx={{
									flex: 1,
									height: 2,
									mt: "14px",
									borderRadius: `${radius.pill}px`,
									minWidth: 24,
									bgcolor: lineDone ? "primary.main" : designTokens.gray300,
								}}
							/>
						)}
					</React.Fragment>
				);
			})}
		</Box>
	);
};

export default OrderStepper;
