import React from "react";

function Query(props) {
  const empty = !props.value || props.value.trim() === "";
  if (empty) {
    return null;
  }
  return (
    <div className="msg-container right-align">
      <div className="outgoing-msg">
        <p>{props.value}</p>
      </div>
    </div>
  );
}

export default Query;
