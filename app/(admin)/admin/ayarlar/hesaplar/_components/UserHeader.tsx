"use client";
import SearchInput from "@/components/SearchBar";
import React from "react";

const UserHeader = () => {
  return (
    <div className="flex flex-col items-center justify-start gap-2 lg:flex-row">
      <div className="h-full w-1/4">
        <SearchInput placeholder="İsim, soyisim ya da email ile arama yapabilirsiniz." />
      </div>
    </div>
  );
};

export default UserHeader;
