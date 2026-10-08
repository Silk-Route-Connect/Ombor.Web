import React from "react";
import { SnackbarProvider } from "notistack";
import { layout } from "theme";

import { Fade, GlobalStyles } from "@mui/material";

import ToastContent from "./ToastContent";

const CONTAINER_CLASS = "ombor-toasts";
const GUTTER = 24;
const DIALOG_TOAST_WIDTH = 320;

/** Every variant renders the app's own toast body. */
const COMPONENTS = {
	default: ToastContent,
	success: ToastContent,
	error: ToastContent,
	warning: ToastContent,
	info: ToastContent,
};

/**
 * The app's toast host: at most three at a time, an identical message once,
 * bottom-left of the content — past the sidebar (its width comes from the
 * `layout.sidebarWidthVar` the sidebar publishes), so a toast never covers
 * «Настройки»; without a sidebar (sign-in pages) it keeps the gutter.
 * While a dialog is open the sidebar sits behind its backdrop, so the toasts
 * move back to the screen edge instead of covering the dialog's own buttons.
 * Toasts fade in place: notistack's default slide enters from the viewport's
 * left edge and would sweep across the sidebar on every toast.
 */
const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
	<SnackbarProvider
		maxSnack={3}
		preventDuplicate
		anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
		Components={COMPONENTS}
		classes={{ containerAnchorOriginBottomLeft: CONTAINER_CLASS }}
		TransitionComponent={Fade}
	>
		<GlobalStyles
			styles={{
				[`.notistack-SnackbarContainer.${CONTAINER_CLASS}`]: {
					left: `calc(var(${layout.sidebarWidthVar}, 0px) + ${GUTTER}px)`,
					maxWidth: `calc(100% - var(${layout.sidebarWidthVar}, 0px) - ${GUTTER * 2}px)`,
				},
				// …and narrow to the card's minimum, which fits the gutter beside a
				// 640px dialog on a 1366px laptop.
				[`body:has(.MuiDialog-root) .notistack-SnackbarContainer.${CONTAINER_CLASS}`]: {
					left: GUTTER,
					maxWidth: `min(${DIALOG_TOAST_WIDTH}px, calc(100% - ${GUTTER * 2}px))`,
				},
				// notistack's 288px floor overflows the column beside the rail on a phone;
				// the toast card sets its own minimum from `sm` up.
				[`.${CONTAINER_CLASS} .notistack-Snackbar`]: { minWidth: 0 },
			}}
		/>
		{children}
	</SnackbarProvider>
);

export default ToastProvider;
