import "server-only";
import QRCode from "qrcode";

/** A QR code as an SVG string, black on white, sized by its container. */
export async function qrSvg(text: string) {
  return QRCode.toString(text, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#0A0A0A", light: "#FFFFFF" } });
}
