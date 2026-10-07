import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import GhostButton from "components/shared/Buttons/GhostButton";
import { isLoadError, LoadError } from "helpers/Loading";
import { useDocumentTitle } from "hooks/shared/useDocumentTitle";
import { useRetryOnReconnect } from "hooks/shared/useRetryOnReconnect";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/StoreContext";

import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";
import { Box, CircularProgress } from "@mui/material";

import StateMessage, { StateSize } from "./StateMessage";

export interface NotFoundConfig {
	/** «Платёж не найден». */
	title: string;
	/** The line under the title; defaults to «Возможно, запись удалили или ссылка неверна.». */
	body?: string;
	/** The list route the «К списку» button returns to. */
	backTo: string;
	backLabel?: string;
}

export interface LoadStateViewProps {
	/** A not-ready state: in flight, failed, or `null` (a by-id record that does not exist). */
	state: "loading" | LoadError | null;
	/** Re-runs the failed load. Without it the error offers a page reload. */
	onRetry?: () => unknown;
	/** What failed, e.g. «Не удалось загрузить партнёров»; defaults to a generic line. */
	errorTitle?: string;
	/** Required wherever `state` can be `null`. */
	notFound?: NotFoundConfig;
	/** "page" for a whole page, "section" for a table body, tab or dashboard card. */
	size?: StateSize;
}

/**
 * The one renderer for everything that is not data: spinner while loading, an
 * error with «Повторить» after a failed load, or not-found with a way back.
 * A failed load never renders as empty data or zeros (conventions.md → MobX).
 * A load that failed for lack of a connection re-runs `onRetry` by itself when
 * the connection returns — unless the connection relapsed right after the last
 * return (`ConnectivityStore.reloadsOnReconnect`); then «Повторить» is the way.
 */
export const LoadStateView: React.FC<LoadStateViewProps> = observer(
	({ state, onRetry, errorTitle, notFound, size = "page" }) => {
		const { t } = useTranslation();
		const navigate = useNavigate();
		const { connectivityStore } = useStore();
		const notFoundTitle = notFound?.title ?? t("common.loadState.notFound");
		useDocumentTitle(state === null && size === "page" ? notFoundTitle : null);
		const retriesOnReconnect =
			Boolean(onRetry) &&
			isLoadError(state) &&
			state.kind === "network" &&
			connectivityStore.reloadsOnReconnect;
		useRetryOnReconnect(onRetry, retriesOnReconnect);

		if (state === "loading") {
			return (
				<Box
					sx={{
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						py: size === "page" ? 10 : 6,
					}}
				>
					<CircularProgress size={size === "page" ? 40 : 32} />
				</Box>
			);
		}

		if (state === null) {
			return (
				<StateMessage
					size={size}
					icon={<SearchOffOutlinedIcon />}
					title={notFoundTitle}
					body={notFound?.body ?? t("common.loadState.notFoundBody")}
					action={
						notFound && (
							<GhostButton onClick={() => void navigate(notFound.backTo)}>
								{notFound.backLabel ?? t("common.loadState.backToList")}
							</GhostButton>
						)
					}
				/>
			);
		}

		return (
			<StateMessage
				size={size}
				role="alert"
				tone="error"
				icon={<ErrorOutlineIcon />}
				title={errorTitle ?? t("common.loadState.errorTitle")}
				body={t(
					retriesOnReconnect
						? "common.loadState.reason.networkAutoRetry"
						: `common.loadState.reason.${state.kind}`,
				)}
				action={
					<GhostButton
						icon={<RefreshIcon />}
						onClick={() => (onRetry ? void onRetry() : window.location.reload())}
					>
						{t("common.retry")}
					</GhostButton>
				}
			/>
		);
	},
);

export default LoadStateView;
