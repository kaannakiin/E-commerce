"use server";
import { getTurkeyTime } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import {
  addUserServer,
  AddUserServerType,
  idForEverything,
  IdForEverythingType,
  serverEditAddressSchema,
  ServerEditAddressType,
} from "@/zodschemas/authschema";

export async function SaveAddressUser(
  data: AddUserServerType,
): Promise<{ success: boolean; message: string }> {
  try {
    addUserServer.parse(data);
    const user = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (!user) {
      return {
        success: false,
        message: "Kullanıcı bulunamadı",
      };
    }
    await prisma.address.create({
      data: {
        city: data.city,
        district: data.district,
        name: data.name,
        surname: data.surname,
        phone: data.phone,
        addressDetail: data.addressBook,
        addressTitle: data.addressTitle,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });
    return {
      success: true,
      message: "Adres başarıyla eklendi",
    };
  } catch (error) {
    return {
      success: false,
      message: "Beklenmedik bir hata oluştu",
    };
  }
}
export const deleteAddress = async (
  id: IdForEverythingType,
): Promise<{ success: boolean; message: string }> => {
  try {
    idForEverything.parse(id);
    if (!id) {
      return {
        success: false,
        message: "Adres bulunamadı",
      };
    }
    const address = await prisma.address.findUnique({
      where: {
        id,
      },
      include: {
        Order: true,
      },
    });
    if (!address) {
      return {
        success: false,
        message: "Adres bulunamadı",
      };
    }
    if (address.Order.length > 0) {
      await prisma.address.update({
        where: {
          id,
        },
        data: {
          isDeleted: true,
          deletedAt: getTurkeyTime(),
        },
      });
      return {
        success: true,
        message: "Adres başarıyla silindi",
      };
    }
    await prisma.address.delete({
      where: {
        id,
      },
    });
    return {
      success: true,
      message: "Adres başarıyla silindi",
    };
  } catch (error) {
    return {
      success: false,
      message: "Adres silinirken bir hata oluştu",
    };
  }
};

export async function EditAddressUser(data: ServerEditAddressType): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    serverEditAddressSchema.parse(data);
    const user = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });
    if (!user) {
      return {
        success: false,
        message: "Kullanıcı bulunamadı",
      };
    }
    const address = await prisma.address.findUnique({
      where: {
        id: data.id,
        isDeleted: false,
      },
    });
    if (!address) {
      return {
        success: false,
        message: "Adres bulunamadı",
      };
    }
    await prisma.address.update({
      where: {
        id: data.id,
      },
      data: {
        city: data.city,
        district: data.district,
        name: data.name,
        surname: data.surname,
        phone: data.phone,
        addressDetail: data.addressBook,
        addressTitle: data.addressTitle,
      },
    });
    return {
      success: true,
      message: "Adres başarıyla güncellendi",
    };
  } catch (error) {
    return {
      success: true,
      message: "Beklenmedik bir hata oluştu",
    };
  }
}
