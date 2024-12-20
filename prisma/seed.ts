// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Seeding başlatılıyor...");

    await prisma.googleCategory.deleteMany();

    // TXT dosyasının yolu
    const filePath = path.join(process.cwd(), "public", "google-taxonomy.txt");

    // Dosyayı satır satır okumak için readline interface
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    const categories = [];
    const processedPaths = new Set<string>();

    // Her satırı işle
    for await (const line of rl) {
      // Başlık satırını veya boş satırları atla
      if (line.startsWith("#") || !line.trim()) continue;

      // Satırı parçala (örnek: "5181 - Bavullar ve Çantalar > Alışveriş Çantaları")
      const match = line.match(/^(\d+) - (.+)$/);
      if (!match) continue;

      const [_, categoryId, fullPath] = match;
      const pathParts = fullPath.split(" > ");

      // Parent yolu oluştur
      const parentPath = pathParts.slice(0, -1).join(" > ");

      // Kategori verisi
      const categoryData = {
        id: parseInt(categoryId),
        name: pathParts[pathParts.length - 1],
        fullPath: fullPath,
        parentPath: parentPath,
        level: pathParts.length,
        isLeaf: true, // Varsayılan olarak leaf kabul ediyoruz, sonra güncelleyeceğiz
        parentId: null, // Parent ID'yi sonra güncelleyeceğiz
        metaTitle: `${pathParts[pathParts.length - 1]} - Satın Al`,
        metaDescription: `${fullPath} kategorisinde ürünleri keşfedin ve en uygun fiyatlarla satın alın.`,
        breadcrumbs: pathParts,
        schemaType: "Product",
      };

      // Eğer bu path daha önce işlenmediyse ekle
      if (!processedPaths.has(fullPath)) {
        categories.push(categoryData);
        processedPaths.add(fullPath);
      }
    }

    // Parent-child ilişkilerini ve isLeaf değerlerini güncelle
    categories.forEach((category) => {
      if (category.parentPath) {
        const parent = categories.find(
          (c) => c.fullPath === category.parentPath,
        );
        if (parent) {
          category.parentId = parent.id;
          parent.isLeaf = false; // Parent olan kategoriler leaf olamaz
        }
      }
    });

    // Kategorileri toplu olarak ekle
    console.log(`${categories.length} kategori import ediliyor...`);

    // Batch insert
    const batchSize = 100;
    for (let i = 0; i < categories.length; i += batchSize) {
      const batch = categories.slice(i, i + batchSize);
      await prisma.googleCategory.createMany({
        data: batch,
        skipDuplicates: true,
      });
    }

    // Parent ilişkilerini güncelle
    for (const category of categories) {
      if (category.parentId) {
        await prisma.googleCategory.update({
          where: { id: category.id },
          data: { parentId: category.parentId },
        });
      }
    }

    console.log("Seeding tamamlandı!");
  } catch (error) {
    console.error("Seeding hatası:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
