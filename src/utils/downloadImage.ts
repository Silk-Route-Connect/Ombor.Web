import { toPng } from "html-to-image";

/**
 * Export a DOM node to a PNG file download.
 * Used by the dashboard chart panels (design has a per-chart PNG download).
 */
export async function downloadNodeAsPng(node: HTMLElement, fileName: string): Promise<void> {
	const dataUrl = await toPng(node, {
		cacheBust: true,
		pixelRatio: 2,
		backgroundColor: "#ffffff",
	});

	const link = document.createElement("a");
	link.download = fileName.endsWith(".png") ? fileName : `${fileName}.png`;
	link.href = dataUrl;
	link.click();
}
