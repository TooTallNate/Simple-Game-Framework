/** section: Networking API
 * class Server
 *
 * Acts as a server to maintain connections between multiple instances of your
 * game (and possibly even different game engines!).
 *
 * Underneath the hood, the [[Server]] class is intended to implement a WebSocket
 * server that rejects anything but valid WebSocket connection requests.
 *
 * Using this class is useful for game client to game client (peer-to-peer)
 * communication. It is entirely possible, however, to write a more dedicated
 * server for your game by
 * <a href="http://github.com/TooTallNate/Java-WebSocket#readme">Writing
 * Your Own WebSocket Server</a>. You would be more likely able to hard-code
 * the server address at that point in your game, making it more seamless for
 * your users.
 **/

/**
 * new Server([options])
 * - options (Object): The optional `options` object's properties are copied
 *                     to the [[SGF.Server]] instance. Allows all the same
 *                     values as found in [[SGF.Server.DEFAULTS]].
 *
 * Instantiates a new [[Server]], using the options found in the
 * `options` parameter to configure.
 **/
function Server() {
    throw new Error("The HTML game engine is not capable of starting a `Server`.");
}

/**
 * Server#start() -> undefined
 *
 * Starts the underlying WebSocket server listening on the currently
 * configured port number.
 **/
// start:null,

/**
 * Server#stop() -> undefined
 *
 * Stops the server from listening on the specified port. If the server is
 * currently running, then [[Server#onClientClose]] will be called for
 * all current connections.
 **/
// stop:null,

/**
 * Server#connections() -> Array
 *
 * Gets an [[Client]] array of the currerntly connected clients. These
 * instances can be used to individually send messages or close a client.
 **/
 
/**
 * Server#sendToAll(message) -> undefined
 * - message (String): The message to send to all current connections.
 *
 * Sends `message` to all currently connected game clients.
 **/
// sendToAll:null,

/**
 * Server#onClientOpen(client) -> undefined
 * - client (Client): The connection instance, in case you would like to
 *                        [[Client#send]] or [[Client#close]] this
 *                        connection specifically.
 *
 * Event handler that is called every time a WebSocket client makes a
 * connection to this server. This function should be overridden in a
 * subclass to actually be any useful.
 **/
// onClientOpen:null,

/**
 * Server#onClientClose(client) -> undefined
 * - client (Client): The connection instance. Note that the connection
 *                        to the client has been closed at this point, and
 *                        calling [[Client#send]] or [[Client#close]]
 *                        will throw an exception.
 *
 * Event handler that is called every time a WebSocket client disconnects
 * from this server. This function should be overridden in a  subclass to
 * actually be any useful. Be careful not to call [[Client#send]] or
 * [[Client#close]] on the `client` instance, since it's socket
 * connection has been closed.
 **/
// onClientClose:null,

/**
 * Server#onClientMessage(client, message) -> undefined
 * - client (Client): The connection instance, in case you would like to
 *                        [[Client#send]] or [[Client#close]] this
 *                        connection specifically.
 * - message (String): The String value of the message sent from `client`.
 *
 * Event handler that is called every time a WebSocket client sends a
 * message to this server. This function should be overridden in a subclass
 * to actually be any useful.
 **/
// onClientMessage:null


/**
 * Server.canServe -> Boolean
 *
 * Use this property as a feature-check to determine whether or not the
 * current game engine has the capability to host a [[Server]]. This value,
 * for instance, is set to `false` on the HTML engine, as a web browser is not
 * capable of starting it's own WebSocket server. On the Java game engine,
 * this value is `true`, as Java has a WebSocket server written for it that
 * can be used by your game.
 *
 *     var Server = SGF.require("Server");
 *     if (Server.canServe) {
 *         var server = new Server();
 *         server.start();
 *     }
 **/
Server['canServe'] = false;

modules['server'] = Server;
