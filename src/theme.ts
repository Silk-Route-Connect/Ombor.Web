import { createTheme } from "@mui/material/styles";

const theme = createTheme({
	palette: {
		background: { default: "#f5f7fa", paper: "#fff" },
		primary: { main: "#1976d2" },
		action: { selected: "#e3f2fd" },
		divider: "#e0e0e0",
		text: { primary: "#333" },
	},
});

export default theme;
