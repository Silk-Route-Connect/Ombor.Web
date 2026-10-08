import React, { useId } from "react";
import { visuallyHiddenSx } from "theme";

import { Box, buttonClasses, Tooltip } from "@mui/material";

/** Spread on the blocked button: it looks disabled but keeps focus. */
export interface BlockedButtonProps {
	className?: string;
	"aria-disabled"?: true;
	"aria-describedby"?: string;
	disableRipple?: boolean;
}

interface BlockedActionProps {
	/** Why the action cannot run now (the offline gate); undefined while it can. */
	reason?: string;
	fullWidth?: boolean;
	/** Renders the button: spread `buttonProps` on it and drop its `onClick` while `blocked`. */
	children: (blocked: boolean, buttonProps: BlockedButtonProps) => React.ReactNode;
}

/**
 * The blocked state of an action button (the offline gate, F-028). Unlike
 * `disabled` the button stays focusable (`aria-disabled` with the theme's own
 * disabled class), so keyboard and screen-reader users reach the reason: the
 * tooltip on hover and focus, and the button's accessible description. The
 * wrapper renders whether or not the action is blocked, so the gate setting or
 * lifting never remounts — and never unfocuses — the button.
 */
const BlockedAction: React.FC<BlockedActionProps> = ({ reason, fullWidth = false, children }) => {
	const reasonId = useId();
	const blocked = Boolean(reason);
	const buttonProps: BlockedButtonProps = blocked
		? {
				className: buttonClasses.disabled,
				"aria-disabled": true,
				"aria-describedby": reasonId,
				disableRipple: true,
			}
		: {};

	return (
		<Tooltip title={blocked ? reason : ""} placement="top">
			<Box component="span" sx={{ display: "inline-flex", width: fullWidth ? "100%" : "auto" }}>
				{children(blocked, buttonProps)}
				{blocked && (
					<Box component="span" id={reasonId} sx={visuallyHiddenSx}>
						{reason}
					</Box>
				)}
			</Box>
		</Tooltip>
	);
};

export default BlockedAction;
