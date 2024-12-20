import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanDB() {
  try {
    await prisma.$executeRaw`
      DO $$ 
      DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = current_schema() AND tablename != 'User' AND tablename !== 'GoogleCategory' AND tablename !=='Category' AND tablename != '_prisma_migrations') 
        LOOP
          EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;
      END $$;
    `;
    console.log("Database cleaned successfully");
  } catch (error) {
    console.error("Error cleaning database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDB();
