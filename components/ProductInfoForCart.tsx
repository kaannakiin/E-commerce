import { ColorSwatch } from "@mantine/core";
import { VariantType } from "@prisma/client";

const ProductInfo = ({ item }) => {
  const truncateDescription = (text, maxLength = 120) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + "...";
  };

  // Varyant  formatla
  const getVariantLabel = () => {
    switch (item.type) {
      case VariantType.COLOR:
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Renk:</span>
            <ColorSwatch color={item.value} size={16} className="shadow-sm" />
          </div>
        );
      case VariantType.SIZE:
        return (
          <span className="px-2 py-0.5 text-sm bg-gray-50 rounded-md font-medium">
            {item.value}
          </span>
        );
      case VariantType.WEIGHT:
        return (
          <span className="px-2 py-0.5 text-sm bg-gray-50 rounded-md font-medium">
            {item.value} {item.unit}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-row items-center gap-3">
        <h3 className="text-base font-medium tracking-wide">{item.name}</h3>
        {getVariantLabel()}
      </div>

      <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
        {truncateDescription(item.description)}
      </p>

      <div className="flex flex-wrap gap-2 mt-1">
        {item.tags?.map((tag, index) => (
          <span
            key={index}
            className="text-xs px-2 py-0.5 bg-gray-50 text-gray-600 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};
export default ProductInfo;
