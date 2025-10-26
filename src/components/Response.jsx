import React, { useState, useEffect } from "react";

function Response(props) {
  const [isVisible, setIsVisible] = useState(false);
  const empty = !props.resmsg || props.resmsg.trim() === "";

  useEffect(() => {
    if (!empty) {
      // Trigger fade-in animation
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    }
  }, [empty, props.resmsg]);

  if (empty && !props.error) {
    return null;
  }

  return (
    <div
      className={`msg-container msg-container2 ${isVisible ? "fade-in" : ""}`}
    >
      <div className="response">
        {props.error && <p className="err">{props.error}</p>}
        {props.resmsg && <p>{props.resmsg}</p>}
      </div>
    </div>
  );
}

export default Response;
