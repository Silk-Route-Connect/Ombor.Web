import React from "react";
import { SnackbarProvider } from "notistack";
import { layout } from "theme";

import { GlobalStyles } from "@mui/material";

import ToastContent from "./ToastContent";

const CONTAINER_CLASS = "ombor-toasts";
const GUTTER = 24;

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
 * «Настройки» / «Выход»; without a sidebar (sign-in pages) it keeps the gutter.
 */
const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
	<SnackbarProvider
		maxSnack={3}
		preventDuplicate
		anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
		Components={COMPONENTS}
		classes={{ containerAnchorOriginBottomLeft: CONTAINER_CLASS }}
	>
		<GlobalStyles
			styles={{
				[`.notistack-SnackbarContainer.${CONTAINER_CLASS}`]: {
					left: `calc(var(${layout.sidebarWidthVar}, 0px) + ${GUTTER}px)`,
					maxWidth: `calc(100% - var(${layout.sidebarWidthVar}, 0px) - ${GUTTER * 2}px)`,
				},
			}}
		/>
		{children}
	</SnackbarProvider>
);

export default ToastProvider;
