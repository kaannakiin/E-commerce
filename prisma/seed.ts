// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.passwordReset.deleteMany();
    await prisma.user.deleteMany();

    const adminExists = await prisma.user.findUnique({
      where: {
        email: "akinkaan49@gmail.com",
      },
    });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("2401Kaan.!", 10);
      await prisma.user.create({
        data: {
          email: "admin@example.com",
          name: "Admin User",
          password: hashedPassword,
          role: "ADMIN",
          emailVerified: new Date(),
        },
      });
    }
    await prisma.googleCategory.deleteMany();
    const filePath = path.join(process.cwd(), "public", "google-taxonomy.txt");

    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    const categories = [];
    const processedPaths = new Set<string>();
    for await (const line of rl) {
      if (line.startsWith("#") || !line.trim()) continue;
      const match = line.match(/^(\d+) - (.+)$/);
      if (!match) continue;
      const [_, categoryId, fullPath] = match;
      const pathParts = fullPath.split(" > ");
      const parentPath = pathParts.slice(0, -1).join(" > ");
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
      if (!processedPaths.has(fullPath)) {
        categories.push(categoryData);
        processedPaths.add(fullPath);
      }
    }
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

    const batchSize = 100;
    for (let i = 0; i < categories.length; i += batchSize) {
      const batch = categories.slice(i, i + batchSize);
      await prisma.googleCategory.createMany({
        data: batch,
        skipDuplicates: true,
      });
    }
    for (const category of categories) {
      if (category.parentId) {
        await prisma.googleCategory.update({
          where: { id: category.id },
          data: { parentId: category.parentId },
        });
      }
    }
  } catch (error) {
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
