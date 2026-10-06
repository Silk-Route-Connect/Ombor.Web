import React from "react";
import StateMessage from "components/shared/LoadState/StateMessage";
import { controlSize, designTokens } from "theme";

import AddIcon from "@mui/icons-material/Add";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import SearchIcon from "@mui/icons-material/Search";
import { Box, ButtonBase, Typography } from "@mui/material";

import { posCardSx } from "./posStyles";

interface LineEditorCardProps {
	title: string;
	count: number;
	/** Header action — «Очистить», or «Загрузить шаблон» while the card is empty. */
	action?: React.ReactNode;
	empty: {
		title: string;
		/** After a submit attempt with no lines: the error title on the error tile. */
		errorTitle: string;
		body: string;
		showError: boolean;
	};
	addLabel: string;
	/** «+ Добавить товар» — back to the product search. */
	onAdd: () => void;
	/** Below the add row (the sale / supply bulk discount). */
	footer?: React.ReactNode;
	/** The line rows; none renders the empty state. */
	children?: React.ReactNode;
}

/**
 * The «Позиции» card of New Sale, Supply and Order: a titled header with the line
 * count, the lines (or the shared empty state), a «+ Добавить товар» row and an
 * optional footer.
 */
export const LineEditorCard: React.FC<LineEditorCardProps> = ({
	title,
	count,
	action,
	empty,
	addLabel,
	onAdd,
	footer,
	children,
}) => (
	<Box sx={{ ...posCardSx, overflow: "hidden" }}>
		<Box
			sx={{
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				gap: "12px",
				minHeight: controlSize.sm.height,
				boxSizing: "content-box",
				p: "12px 20px",
				borderBottom: count > 0 ? "1px solid" : "none",
				borderColor: "divider",
			}}
		>
			<Typography variant="h3" component="h2">
				{title}{" "}
				<Box component="span" sx={{ color: "text.secondary", fontWeight: 500 }}>
					· {count}
				</Box>
			</Typography>
			{action}
		</Box>

		{count === 0 ? (
			<StateMessage
				size="inline"
				tone={empty.showError ? "error" : "neutral"}
				icon={empty.showError ? <ErrorOutlineIcon /> : <SearchIcon />}
				title={empty.showError ? empty.errorTitle : empty.title}
				body={empty.body}
				role={empty.showError ? "alert" : undefined}
			/>
		) : (
			<>
				{children}
				<ButtonBase
					onClick={onAdd}
					sx={{
						width: "100%",
						justifyContent: "flex-start",
						gap: "8px",
						p: "12px 20px",
						borderTop: "1px solid",
						borderColor: "divider",
						fontSize: 13,
						fontWeight: 600,
						color: "primary.main",
						"& .MuiSvgIcon-root": { fontSize: 18 },
						"&:hover": { bgcolor: designTokens.primarySoft },
					}}
				>
					<AddIcon />
					{addLabel}
				</ButtonBase>
				{footer}
			</>
		)}
	</Box>
);

export default LineEditorCard;
