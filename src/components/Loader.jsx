import React, { useEffect, useState } from "react";

function Loader() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  const messages = [
    "Pinging the LLM... making sure it's awake 😴",
    "Checking backend vibes... one sec ⚙️",
    "Lining up the last few wires... 🧠",
    "Almost there! Don't rage quit yet 😎",
  ];

  useEffect(() => {
    if (messageIndex < messages.length - 1) {
      const fadeOutTimer = setTimeout(() => setVisible(false), 1600);
      const nextTimer = setTimeout(() => {
        setMessageIndex((prev) => prev + 1);
        setVisible(true);
      }, 2000);
      return () => {
        clearTimeout(fadeOutTimer);
        clearTimeout(nextTimer);
      };
    }
  }, [messageIndex]);

  return (
    <div className="loader-container">
      <div className="loader-spinner"></div>
      <p className={`loader-text ${visible ? "show" : "hide"}`}>
        {messages[messageIndex]}
      </p>
    </div>
  );
}

export default Loader;
