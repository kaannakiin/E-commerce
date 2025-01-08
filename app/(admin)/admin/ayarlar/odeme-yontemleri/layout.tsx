import React from "react";

const layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="mx-auto min-h-screen max-w-[1250px] space-y-6 px-4 py-10">
      {children}
    </div>
  );
};

export default layout;
