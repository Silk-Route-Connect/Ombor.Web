import { createTheme } from "@mui/material/styles";

const theme = createTheme({
	palette: {
		primary: { main: "#1976d2" },
		secondary: { main: "#009688" },
		background: {
			default: "#f5f7fa",
			paper: "#ffffff",
		},
		text: {
			primary: "#333333",
			secondary: "#555555",
		},
		divider: "#e0e0e0",
		action: {
			hover: "rgba(25,118,210,0.04)",
			selected: "rgba(25,118,210,0.08)",
		},
	},
	shape: { borderRadius: 8 },

	typography: {
		h5: { fontSize: "1.5rem", fontWeight: 600, lineHeight: 1.2 },
		subtitle2: { fontSize: "0.875rem", fontWeight: 600, lineHeight: 1.57 },
		body2: { fontSize: "0.875rem", fontWeight: 400, lineHeight: 1.43 },
		button: { textTransform: "none", fontWeight: 600 },
	},
});

export default theme;
