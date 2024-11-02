"use client";

import { Burger } from "@mantine/core";
import { useState } from "react";

const BurgerMenu = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="lg:hidden block">
      <Burger
        lineSize={2}
        opened={open}
        onClick={() => setOpen((prev) => !prev)}
        transitionDuration={400}
      />
    </div>
  );
};

export default BurgerMenu;
