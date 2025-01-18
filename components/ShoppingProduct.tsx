import { formattedPrice } from "@/lib/format";
import { useStore } from "@/store/store";
import { CartVariant } from "@/store/useCartStore";
import { ActionIcon, ColorSwatch, Paper, Text, Title } from "@mantine/core";
import { usePathname } from "next/navigation";
import { FaRegTrashCan } from "react-icons/fa6";
import { FiMinus, FiPlus } from "react-icons/fi";
import CustomImage from "./CustomImage";

const ShoppingProduct = ({ item }: { item: CartVariant }) => {
  const increaseQuantity = useStore((state) => state.increaseQuantity);
  const decreaseQuantity = useStore((state) => state.decreaseQuantity);
  const removeItem = useStore((state) => state.removeItem);
  const pathname = usePathname();
  const isPaymentPage = pathname === "/odeme";

  return (
    <li className="flex py-6">
      <div className="size-24 shrink-0 overflow-hidden rounded-md border border-gray-200 lg:size-32">
        <CustomImage
          src={item.imageUrl}
          alt="denmee"
          className="size-full object-cover"
        />
      </div>
      <div className="ml-4 flex flex-1 flex-col">
        <div className="space-y-1">
          <div className="flex justify-between text-sm font-semibold text-gray-900 lg:text-xl">
            <Title order={3} tt={"capitalize"}>
              {item.name}
            </Title>
            <Text c={"dimmed"} fw={700} className="ml-4">
              {formattedPrice(item.priceCalculation.finalPrice * item.quantity)}
            </Text>
          </div>
          <div className="shrink-0">
            {item.type == "COLOR" && <ColorSwatch color={item.value} />}
            {item.type !== "COLOR" && (
              <Paper
                component={"span"}
                bg={"secondary.1"}
                c={"secondary.8"}
                className="inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-sm font-bold"
              >
                {item.type === "WEIGHT" && `${item.value} ${item.unit}`}
                {item.type === "SIZE" && `${item.value}`}
              </Paper>
            )}
          </div>
        </div>
        <div className="text-md flex flex-1 items-end justify-start gap-2">
          {!isPaymentPage && (
            <div className="flex h-8 items-center gap-3 border border-gray-200 bg-white px-3 lg:h-10 lg:gap-5">
              <button
                className="flex size-5 items-center justify-center"
                onClick={() => decreaseQuantity(item.variantId)}
              >
                <FiMinus size={18} className="text-gray-900" />
              </button>
              <p className="font-semibold text-gray-500">{item.quantity}</p>
              <button
                className="flex size-5 items-center justify-center"
                onClick={() => increaseQuantity(item.variantId)}
              >
                <FiPlus size={18} className="text-gray-900" />
              </button>
            </div>
          )}
          {!isPaymentPage && (
            <ActionIcon
              radius={0}
              variant="default"
              className="flex size-8 items-center justify-center lg:size-10"
              onClick={() => removeItem(item.variantId)}
            >
              <FaRegTrashCan size={20} className="text-red-500" />
            </ActionIcon>
          )}
        </div>
      </div>
    </li>
  );
};

export default ShoppingProduct;
