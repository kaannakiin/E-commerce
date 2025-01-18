"use client";
import { ActionIcon, Affix, Transition } from "@mantine/core";
import { useWindowScroll } from "@mantine/hooks";
import { FaArrowUp } from "react-icons/fa";

const AffixToTop = () => {
  const [scroll, scrollTo] = useWindowScroll();

  return (
    <Affix position={{ bottom: 20, left: 20 }}>
      <Transition transition="slide-up" mounted={scroll.y > 100}>
        {(transitionStyles) => (
          <ActionIcon
            style={transitionStyles}
            onClick={() => scrollTo({ y: 0 })}
          >
            <FaArrowUp size={16} />{" "}
          </ActionIcon>
        )}
      </Transition>
    </Affix>
  );
};

export default AffixToTop;
