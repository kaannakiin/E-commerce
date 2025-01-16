import { prisma } from "./prisma";
export const getUserByEmail = async (email: string, phoneCheck?: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;

    if (phoneCheck === user.phone) {
      return null;
    }

    return user;
  } catch (error) {
    throw error; // Hata durumunda Register fonksiyonunun catch bloğuna düşsün
  }
};
export const getUserById = async (id: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    return user;
  } catch {
    return null;
  }
};
