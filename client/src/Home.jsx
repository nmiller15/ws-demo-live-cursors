import useWebSocket from "react-use-websocket";
import { useEffect, useRef } from "react";
import throttle from "lodash.throttle";

import { Cursor } from "./components/Cursor";

const renderCursors = (users) => {
  return Object.keys(users).map((uuid) => {
    const user = users[uuid];

    return <Cursor key={uuid} point={[user.state.x, user.state.y]} />;
  });
};

const renderUsersList = (users) => {
  return (
    <ul>
      {Object.keys(users).map((uuid) => {
        return <li key={uuid}>{JSON.stringify(users[uuid])}</li>;
      })}
    </ul>
  );
};

// eslint-disable-next-line react/prop-types
export function Home({ username }) {
  const WS_URL = "ws://127.0.0.1:8000";
  const { sendJsonMessage, lastJsonMessage } = useWebSocket(WS_URL, {
    share: true,
    // This will automatically add the query parameter
    queryParams: { username },
  });

  const THROTTLE = 50;
  const sendJsonMessageThrottled = useRef(throttle(sendJsonMessage, THROTTLE));

  useEffect(() => {
    sendJsonMessage({
      x: 0,
      y: 0,
    });
    window.addEventListener("mousemove", (e) => {
      // send
      // e.clientX
      // e.clientY
      sendJsonMessageThrottled.current({
        x: e.clientX,
        y: e.clientY,
      });
    });
  }, []);

  if (lastJsonMessage) {
    return (
      <>
        {renderCursors(lastJsonMessage)}
        {renderUsersList(lastJsonMessage)}
      </>
    );
  }

  return <h1>Home, hello {username}</h1>;
}
