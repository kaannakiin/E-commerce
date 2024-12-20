import { MantineColorsTuple } from "@mantine/core";

export function generateShades(hexColor: string, factor: number): string {
  // Hex'i RGB'ye çevir
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  // Rengi aç/koyulaştır
  const newR = Math.round(r + (255 - r) * factor);
  const newG = Math.round(g + (255 - g) * factor);
  const newB = Math.round(b + (255 - b) * factor);

  // RGB'yi Hex'e çevir
  const toHex = (n: number) => {
    const hex = Math.max(0, Math.min(255, n)).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}

export function generateMantineColors(baseColor: string): MantineColorsTuple {
  return [
    generateShades(baseColor, 0.95), // 0
    generateShades(baseColor, 0.85), // 1
    generateShades(baseColor, 0.75), // 2
    generateShades(baseColor, 0.65), // 3
    generateShades(baseColor, 0.55), // 4
    generateShades(baseColor, 0.45), // 5
    generateShades(baseColor, 0.35), // 6
    generateShades(baseColor, 0.25), // 7
    generateShades(baseColor, 0.15), // 8
    generateShades(baseColor, 0.05), // 9
  ] as MantineColorsTuple;
}
