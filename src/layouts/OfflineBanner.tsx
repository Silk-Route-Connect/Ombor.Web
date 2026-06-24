import React from "react";
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/StoreContext";

import CloudOffOutlinedIcon from "@mui/icons-material/CloudOffOutlined";
import { Box, Collapse } from "@mui/material";

/**
 * A global, non-dismissible bar shown while the backend is unreachable (F-028).
 * It explains why mutating actions are blocked and clears itself once a request
 * succeeds again.
 */
const OfflineBanner: React.FC = observer(() => {
	const { t } = useTranslation();
	const { connectivityStore } = useStore();

	return (
		<Collapse in={connectivityStore.isBackendDown} unmountOnExit>
			<Box
				role="alert"
				sx={{
					display: "flex",
					alignItems: "center",
					gap: "10px",
					px: 3,
					py: "10px",
					bgcolor: "error.main",
					color: "error.contrastText",
					fontSize: 13.5,
					fontWeight: 600,
				}}
			>
				<CloudOffOutlinedIcon sx={{ fontSize: 18 }} />
				{t("common.offline.banner")}
			</Box>
		</Collapse>
	);
});

export default OfflineBanner;
