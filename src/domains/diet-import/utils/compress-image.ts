// Fotos do celular passam fácil de 3 MB: reduz pra no máximo 1.600 px no
// maior lado, em JPEG, antes de enviar (texto da dieta continua legível).
// PDF e formatos que o navegador não decodifica (HEIC fora do Safari) vão
// como estão.

const MAX_SIDE = 1600;
const QUALITY = 0.85;

export async function compressImage(file: File): Promise<File> {
	if (!file.type.startsWith("image/")) return file;
	try {
		const bitmap = await createImageBitmap(file);
		const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
		const canvas = document.createElement("canvas");
		canvas.width = Math.round(bitmap.width * scale);
		canvas.height = Math.round(bitmap.height * scale);
		canvas
			.getContext("2d")
			?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
		bitmap.close();
		const blob = await new Promise<Blob | null>((resolve) =>
			canvas.toBlob(resolve, "image/jpeg", QUALITY),
		);
		if (!blob || blob.size >= file.size) return file;
		const name = file.name.replace(/\.[^.]+$/, "") || "foto";
		return new File([blob], `${name}.jpg`, { type: "image/jpeg" });
	} catch {
		return file;
	}
}
