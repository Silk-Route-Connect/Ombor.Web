import React, { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react-lite";
import { ConnectivityStatus } from "stores/ConnectivityStore";
import { useStore } from "stores/StoreContext";

import { Box, Fade, Popover } from "@mui/material";

import ConnectivityDetails from "./ConnectivityDetails";
import ConnectivityPill from "./ConnectivityPill";
import {
	isProblem,
	ProblemStatus,
	ShownStatus,
	STATUS_PRESENTATION,
	visuallyHiddenSx,
} from "./presentation";

/**
 * What to draw while a part fades out: the pill keeps its last status after
 * «connected», the popover its last problem after the connection returns.
 */
function useLastShown(status: ConnectivityStatus): { pill: ShownStatus; problem: ProblemStatus } {
	const [pill, setPill] = useState<ShownStatus>(status === "connected" ? "restored" : status);
	const [problem, setProblem] = useState<ProblemStatus>(isProblem(status) ? status : "backendDown");
	if (status !== "connected" && status !== pill) {
		setPill(status);
	}
	if (isProblem(status) && status !== problem) {
		setProblem(status);
	}
	return { pill: status === "connected" ? pill : status, problem };
}

/**
 * The header's connection status (DEC-11, owner decision 2026-10-07): nothing
 * while connected; a pill while the device is offline or the backend does not
 * answer, opening a popover with the details and «Проверить сейчас»; a brief
 * green «Связь восстановлена» when it comes back. Each change is announced
 * through a polite live region. The state and the re-checking live in
 * `ConnectivityStore`.
 */
const ConnectivityIndicator: React.FC = observer(() => {
	const { t } = useTranslation();
	const { connectivityStore: store } = useStore();
	const popoverId = useId();
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);
	const { status } = store;
	const shown = useLastShown(status);
	const problem = isProblem(status);

	// The popover explains a problem; once the connection is back it has nothing to say.
	if (!problem && anchor) {
		setAnchor(null);
	}

	const label = status === "connected" ? "" : t(STATUS_PRESENTATION[status].labelKey);

	return (
		<>
			<Box role="status" sx={visuallyHiddenSx}>
				{problem
					? t("common.connectivity.announce", {
							status: label,
							consequences: t("common.connectivity.consequences"),
						})
					: label}
			</Box>
			{/* Above the modal layer: a form's backdrop must not dim why its save is blocked
			    (FormDialog clears the header meanwhile, so the pill never covers a modal). */}
			<Fade in={status !== "connected"} unmountOnExit>
				<Box
					sx={{ display: "flex", position: "relative", zIndex: (theme) => theme.zIndex.modal + 1 }}
				>
					<ConnectivityPill
						status={shown.pill}
						checking={store.isChecking}
						expanded={Boolean(anchor)}
						popoverId={popoverId}
						onOpen={setAnchor}
					/>
				</Box>
			</Fade>
			<Popover
				id={popoverId}
				open={Boolean(anchor) && problem}
				anchorEl={anchor}
				onClose={() => setAnchor(null)}
				anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
				transformOrigin={{ vertical: "top", horizontal: "right" }}
				slotProps={{ paper: { sx: { mt: 1 } } }}
			>
				<ConnectivityDetails status={shown.problem} />
			</Popover>
		</>
	);
});

export default ConnectivityIndicator;
