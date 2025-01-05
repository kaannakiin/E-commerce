"use client";
import { Pagination } from "@mantine/core";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
const SpecialPagination = ({
  totalPages,
  currentPage,
}: {
  totalPages: number;
  currentPage: number;
}) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const onPaginationChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };
  return (
    <div className="flex w-full flex-row items-center justify-center">
      <Pagination
        total={totalPages}
        value={currentPage}
        onChange={onPaginationChange}
        autoContrast
        size={"lg"}
      />
    </div>
  );
};

export default SpecialPagination;
