import { BiPackage } from "react-icons/bi";

const EmptyStateProduct = () => {
  return (
    <div className="w-full min-h-[400px] flex flex-col items-center justify-center p-8 text-center  bg-white rounded-lg shadow-sm">
      <BiPackage size={64} className="text-gray-300 mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Ürün Bulunamadı
      </h3>
      <p className="text-gray-500 max-w-md mb-6">
        Seçtiğiniz filtrelere uygun ürün bulunamamıştır. Lütfen farklı filtreler
        deneyiniz.
      </p>
    </div>
  );
};

export default EmptyStateProduct;
