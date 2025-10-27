import React, { useState, useEffect } from "react";

function Response({ resmsg, error }) {
  const [isVisible, setIsVisible] = useState(false);
  const hasResponse = resmsg && resmsg.trim() !== "";
  const hasError = Boolean(error);

  useEffect(() => {
    if (hasResponse || hasError) {
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    }
  }, [hasResponse, hasError, resmsg, error]);

  if (!hasResponse && !hasError) return null;

  return (
    <div
      className={`msg-container msg-container2 ${isVisible ? "fade-in" : ""}`}
    >
      <div className="response">
        {hasError && <p className="err">⚠️ {error}</p>}
        {hasResponse && <p>{resmsg}</p>}
      </div>
    </div>
  );
}

export default Response;
