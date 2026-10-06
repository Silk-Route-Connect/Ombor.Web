import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import GhostButton from "components/shared/Buttons/GhostButton";
import { LoadError } from "helpers/Loading";

import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";
import { Box, CircularProgress } from "@mui/material";

import StateMessage, { StateSize } from "./StateMessage";

export interface NotFoundConfig {
	/** «Платёж не найден». */
	title: string;
	/** The list route the «К списку» button returns to. */
	backTo: string;
	backLabel?: string;
}

export interface LoadStateViewProps {
	/** A not-ready state: in flight, failed, or `null` (a by-id record that does not exist). */
	state: "loading" | LoadError | null;
	/** Re-runs the failed load. Without it the error offers a page reload. */
	onRetry?: () => void;
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
 */
export const LoadStateView: React.FC<LoadStateViewProps> = ({
	state,
	onRetry,
	errorTitle,
	notFound,
	size = "page",
}) => {
	const { t } = useTranslation();
	const navigate = useNavigate();

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
				title={notFound?.title ?? t("common.loadState.notFound")}
				body={t("common.loadState.notFoundBody")}
				action={
					notFound && (
						<GhostButton onClick={() => navigate(notFound.backTo)}>
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
			body={t(`common.loadState.reason.${state.kind}`)}
			action={
				<GhostButton icon={<RefreshIcon />} onClick={onRetry ?? (() => window.location.reload())}>
					{t("common.retry")}
				</GhostButton>
			}
		/>
	);
};

export default LoadStateView;
