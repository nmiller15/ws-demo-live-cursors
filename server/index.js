const http = require("http");
const { WebSocketServer } = require("ws");

const url = require("url");
const uuidv4 = require("uuid").v4;

const server = http.createServer();
const wsServer = new WebSocketServer({ server });
const port = 8000;

const connections = {};
const users = {};

const broadcastUsers = () => {
  Object.keys(connections).forEach((uuid) => {
    const connection = connections[uuid];
    const message = JSON.stringify(users);
    connection.send(message);
  });
};

const handleMessage = (bytes, uuid) => {
  // message = { "x": 0, "y": 100}
  // console.log(bytes);

  const message = JSON.parse(bytes.toString("utf-8"));
  const user = users[uuid];
  user.state = message;

  broadcastUsers();

  console.log(message);
};

const handleClose = (uuid) => {
  console.log(`${users[uuid].username} disconnected.`);
  delete connections[uuid];
  delete users[uuid];

  broadcastUsers();
};

wsServer.on("connection", (connection, request) => {
  // Example of using query parameters, this this a connection string
  // ws://localhost:8000?username=Nolan
  const { username } = url.parse(request.url, true).query;
  const uuid = uuidv4();
  console.log(username, uuid);

  connections[uuid] = connection;

  users[uuid] = {
    username,
    state: {
      x: 0,
      y: 0,
      // Add all of your states for a user in an object like this
      // Something like typing in a chat app, or onlineStatus in a team app
    },
  };

  connection.on("message", (message) => handleMessage(message, uuid));
  connection.on("close", () => handleClose(uuid));
});

server.listen(port, () => {
  console.log(`WS server is running on ${port}`);
});
