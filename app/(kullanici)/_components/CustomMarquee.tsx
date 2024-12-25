import React from "react";

const CustomMarquee = ({
  text,
  textColor,
  textPadding,
  bgColor,
  fontSize,
  slidingSpeed,
  isActive,
  url,
}) => {
  const items = Array(5).fill(text);

  if (!isActive) return null;

  // Style objects with proper units
  const styles = {
    container: {
      backgroundColor: bgColor,
    },
    text: {
      color: textColor,
      fontSize: `${fontSize}px`, // Add px unit
      padding: `0 ${textPadding}px`, // Add px unit
    },
  };

  return (
    <div className="relative flex overflow-x-hidden" style={styles.container}>
      <style>
        {`
          @keyframes slide {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-100%); }
          }
          @keyframes slide2 {
            0% { transform: translateX(100%); }
            100% { transform: translateX(0%); }
          }
          .slide-animation {
            animation: slide ${slidingSpeed}s linear infinite;
          }
          .slide-animation2 {
            animation: slide2 ${slidingSpeed}s linear infinite;
          }
        `}
      </style>

      <div
        className="slide-animation flex whitespace-nowrap"
        style={styles.text}
      >
        {url !== "#"
          ? items.map((item, index) => (
              <a
                href={url}
                key={`first-${index}`}
                className="mx-4 inline-block transition-opacity hover:opacity-75"
                style={styles.text}
              >
                {item}
              </a>
            ))
          : items.map((item, index) => (
              <p
                key={`first-${index}`}
                className="mx-4 inline-block transition-opacity hover:opacity-75"
                style={styles.text}
              >
                {item}
              </p>
            ))}
        {url !== "#" && url !== ""
          ? items.map((item, index) => (
              <a
                href={url}
                key={`second-${index}`}
                className="mx-4 inline-block transition-opacity hover:opacity-75"
                style={styles.text}
              >
                {item}
              </a>
            ))
          : items.map((item, index) => (
              <p
                key={`second-${index}`}
                className="mx-4 inline-block transition-opacity hover:opacity-75"
                style={styles.text}
              >
                {item}
              </p>
            ))}
      </div>

      <div
        className="slide-animation2 absolute top-0 whitespace-nowrap"
        style={styles.text}
      >
        {url !== "#" ? (
          <>
            {items.map((item, index) => (
              <a
                href={url}
                key={`third-${index}`}
                className="mx-4 inline-block transition-opacity hover:opacity-75"
                style={styles.text}
              >
                {item}
              </a>
            ))}
            {items.map((item, index) => (
              <a
                href={url}
                key={`fourth-${index}`}
                className="mx-4 inline-block transition-opacity hover:opacity-75"
                style={styles.text}
              >
                {item}
              </a>
            ))}
          </>
        ) : (
          <>
            {items.map((item, index) => (
              <p
                key={`third-${index}`}
                className="mx-4 inline-block transition-opacity hover:opacity-75"
                style={styles.text}
              >
                {item}
              </p>
            ))}
            {items.map((item, index) => (
              <p
                key={`fourth-${index}`}
                className="mx-4 inline-block transition-opacity hover:opacity-75"
                style={styles.text}
              >
                {item}
              </p>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default CustomMarquee;
