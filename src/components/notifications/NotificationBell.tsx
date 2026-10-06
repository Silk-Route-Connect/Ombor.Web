import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import LoadStateView from "components/shared/LoadState/LoadStateView";
import TableEmptyState from "components/shared/Table/TableEmptyState";
import { isReady } from "helpers/Loading";
import { useAlertRefresh } from "hooks/notifications/useAlertRefresh";
import { useOpenAlert } from "hooks/notifications/useOpenAlert";
import { observer } from "mobx-react-lite";
import { NotificationKind } from "models/notification";
import { useStore } from "stores/StoreContext";

import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import { Badge, Box, Button, IconButton, Popover, Tooltip, Typography } from "@mui/material";

import AlertBlock from "./AlertBlock";

/**
 * The topbar bell: a badge with the alerts that grew since the user last
 * marked them read, and a popover with each alert in plain words («Заканчиваются
 * 7 товаров») leading to the list narrowed to it. Re-read on open, on window
 * focus and every 5 minutes.
 */
const NotificationBell: React.FC = observer(() => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { alertStore } = useStore();
	const openAlert = useOpenAlert();
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);
	useAlertRefresh(alertStore.load, alertStore.refreshIfStale);

	const { alerts, unseenCount } = alertStore;

	const open = (e: React.MouseEvent<HTMLElement>) => {
		setAnchor(e.currentTarget);
		void alertStore.load();
	};
	const close = () => setAnchor(null);
	const goToAlert = (kind: NotificationKind) => {
		close();
		openAlert(kind);
	};
	const goToItem = (path: string) => {
		close();
		navigate(path);
	};

	return (
		<>
			<Tooltip title={t("topbar.notifications")} arrow enterDelay={200}>
				<IconButton
					onClick={open}
					aria-label={
						unseenCount > 0
							? t("notifications.bellNew", { count: unseenCount })
							: t("topbar.notifications")
					}
					aria-haspopup="true"
					sx={{ width: 38, height: 38, borderRadius: 1, color: "text.secondary" }}
				>
					<Badge badgeContent={unseenCount} color="error" max={9}>
						<NotificationsNoneOutlinedIcon sx={{ fontSize: 19 }} />
					</Badge>
				</IconButton>
			</Tooltip>
			<Popover
				anchorEl={anchor}
				open={Boolean(anchor)}
				onClose={close}
				anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
				transformOrigin={{ vertical: "top", horizontal: "right" }}
				slotProps={{ paper: { sx: { width: 420, maxWidth: "calc(100vw - 32px)" } } }}
			>
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						gap: 1,
						px: 2,
						py: 1.25,
						borderBottom: 1,
						borderColor: "divider",
					}}
				>
					<Typography sx={{ fontSize: 15, fontWeight: 600 }}>
						{t("topbar.notifications")}
					</Typography>
					{unseenCount > 0 && (
						<Button size="small" onClick={alertStore.markAllSeen}>
							{t("notifications.markRead")}
						</Button>
					)}
				</Box>
				<Box sx={{ maxHeight: "min(70vh, 560px)", overflowY: "auto" }}>
					{!isReady(alerts) ? (
						<LoadStateView
							state={alerts}
							size="section"
							onRetry={() => void alertStore.load()}
							errorTitle={t("notifications.error")}
						/>
					) : alerts.length === 0 ? (
						<TableEmptyState
							icon={<TaskAltOutlinedIcon />}
							title={t("notifications.allGood.title")}
							hint={t("notifications.allGood.hint")}
						/>
					) : (
						alerts.map((alert) => (
							<AlertBlock
								key={alert.kind}
								alert={alert}
								unseen={alertStore.isUnseen(alert)}
								onOpenAlert={() => goToAlert(alert.kind)}
								onOpenItem={goToItem}
							/>
						))
					)}
				</Box>
			</Popover>
		</>
	);
});

export default NotificationBell;
