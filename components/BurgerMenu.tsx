"use client";
import {
  Burger,
  Drawer,
  Text,
  UnstyledButton,
  useDrawersStack,
} from "@mantine/core";
import { signIn } from "next-auth/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AiOutlineRight, AiOutlineShop } from "react-icons/ai";
import { FaHome } from "react-icons/fa";
const BurgerMenu = ({ isUser, categories }) => {
  const stack = useDrawersStack(["routes", "other-routes"]);
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const handleAuth = (tab: "giris" | "kayit") => {
    const currentQuery = params.toString();
    const fullPath = `${pathname}${currentQuery ? `?${currentQuery}` : ""}`;
    const encodedCallbackUrl = encodeURIComponent(fullPath);
    router.push(`/giris?tab=${tab}&callbackUrl=${encodedCallbackUrl}`);
  };

  return (
    <div className="block lg:hidden">
      <Drawer.Stack>
        <Drawer.Root {...stack.register("routes")}>
          <Drawer.Overlay />
          <Drawer.Content>
            <Drawer.Header>
              <Drawer.Title>
                {!isUser && (
                  <div className="flex flex-row gap-3">
                    <UnstyledButton
                      onClick={() => {
                        if (pathname !== "/giris") {
                          handleAuth("kayit");
                        }
                        stack.closeAll();
                      }}
                      c={"primary.7"}
                      className="py-2 text-lg font-medium underline"
                    >
                      Kayıt ol
                    </UnstyledButton>
                    <UnstyledButton
                      onClick={() => {
                        if (pathname !== "/giris") {
                          handleAuth("giris");
                        }
                        stack.closeAll();
                      }}
                      c={"primary.7"}
                      className="py-2 text-lg font-medium underline"
                    >
                      Giriş Yap
                    </UnstyledButton>
                  </div>
                )}
                {isUser && (
                  <Text c={"primary.7"} className="text-2xl font-bold">
                    Menü
                  </Text>
                )}
              </Drawer.Title>
              <Drawer.CloseButton size={40} c={"primary.7"} />
            </Drawer.Header>
            <Drawer.Body>
              <div className="flex flex-col space-y-2">
                <UnstyledButton
                  onClick={() => {
                    router.push("/");
                    stack.closeAll();
                  }}
                  className="flex items-center justify-between rounded-lg p-4"
                >
                  <div className="flex items-center space-x-3">
                    <FaHome size={24} />
                    <span className="text-lg font-medium">Anasayfa</span>
                  </div>
                </UnstyledButton>
                <UnstyledButton
                  onClick={() => stack.open("other-routes")}
                  className="flex items-center justify-between rounded-lg p-4"
                >
                  <div className="flex items-center space-x-3">
                    <AiOutlineShop size={24} />
                    <span className="text-lg font-medium">Kategoriler</span>
                  </div>
                  <AiOutlineRight className="text-gray-400" size={20} />
                </UnstyledButton>
              </div>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Root>
      </Drawer.Stack>

      <Drawer.Stack>
        <Drawer.Root {...stack.register("other-routes")}>
          <Drawer.Overlay />
          <Drawer.Content>
            <Drawer.Header>
              <Drawer.Title>
                <div className="flex items-center space-x-2">
                  <AiOutlineShop size={24} />
                  <Text c={"primary.7"} className="text-2xl font-bold">
                    Kategoriler
                  </Text>
                </div>
              </Drawer.Title>
              <Drawer.CloseButton size={40} c={"primary.7"} />
            </Drawer.Header>
            <Drawer.Body>
              <div className="space-y-4">
                {categories.map((category) => (
                  <UnstyledButton
                    key={category.slug}
                    onClick={() => {
                      router.push(`/categories/${category.slug}`);
                      stack.closeAll();
                    }}
                    className="flex items-center justify-between rounded-lg p-4"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg font-medium">
                        {category.name}
                      </span>
                    </div>
                  </UnstyledButton>
                ))}
              </div>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Root>
      </Drawer.Stack>

      <Burger
        lineSize={2}
        onClick={() => stack.open("routes")}
        transitionDuration={400}
      />
    </div>
  );
};

export default BurgerMenu;
