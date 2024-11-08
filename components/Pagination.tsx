"use client";
import { Pagination } from "@mantine/core";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
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
    router.replace(`${pathname}?${params.toString()}`);
  };
  return (
    <div className="w-full flex flex-row justify-center items-center">
      <Pagination
        total={totalPages}
        value={currentPage}
        onChange={onPaginationChange}
      />
    </div>
  );
};

export default SpecialPagination;
