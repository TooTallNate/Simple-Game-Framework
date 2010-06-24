/** section: Networking API
 * class SGF.Server
 *
 * Acts as a server to maintain connections between multiple instances of your
 * game (and possibly even different game clients!).
 *
 * Underneath the hood, [[SGF.Server]] is intended to implement a WebSocket
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
var Server = Class.create({
    /**
     * new SGF.Server([options])
     * - options (Object): The optional `options` object's properties are copied
     *                     to the [[SGF.Server]] instance. Allows all the same
     *                     values as found in [[SGF.Server.DEFAULTS]].
     *
     * Instantiates a new [[SGF.Server]], using the options found in the
     * `options` parameter to configure.
     **/
    initialize: function() {
        throw "The HTML/DOM client is not capable of starting a Server.";
    },
    /**
     * SGF.Server#start() -> undefined
     *
     * Starts the underlying WebSocket server listening on the currently
     * configured port number.
     **/
     start:null,
    /**
     * SGF.Server#stop() -> undefined
     *
     * Stops the server from listening on the specified port. If the server is
     * currently running, then [[SGF.Server#onClientClose]] will be called for
     * all current connections.
     **/
     stop:null,
    /**
     * SGF.Server#connections() -> Array
     *
     * Gets an [[SGF.Client]] array of the currerntly connected clients. These
     * instances can be used to individually send messages or close a client.
     **/
     
    /**
     * SGF.Server#sendToAll(message) -> undefined
     * - message (String): The message to send to all current connections.
     *
     * Sends `message` to all currently connected game clients.
     **/
     sendToAll:null,
    /**
     * SGF.Server#onClientOpen(client) -> undefined
     * - client (SGF.Client): The connection instance, in case you would like to
     *                        [[SGF.Client#send]] or [[SGF.Client#close]] this
     *                        connection specifically.
     *
     * Event handler that is called every time a WebSocket client makes a
     * connection to this server. This function should be overridden in a
     * subclass to actually be any useful.
     **/
     onClientOpen:null,
    /**
     * SGF.Server#onClientClose(client) -> undefined
     * - client (SGF.Client): The connection instance. Note that the connection
     *                        to the client has been closed at this point, and
     *                        calling [[SGF.Client#send]] or [[SGF.Client#close]]
     *                        will throw an exception.
     *
     * Event handler that is called every time a WebSocket client disconnects
     * from this server. This function should be overridden in a  subclass to
     * actually be any useful. Be careful not to call [[SGF.Client#send]] or
     * [[SGF.Client#close]] on the `client` instance, since it's socket
     * connection has been closed.
     **/
     onClientClose:null,
    /**
     * SGF.Server#onClientMessage(client, message) -> undefined
     * - client (SGF.Client): The connection instance, in case you would like to
     *                        [[SGF.Client#send]] or [[SGF.Client#close]] this
     *                        connection specifically.
     * - message (String): The String value of the message sent from `client`.
     *
     * Event handler that is called every time a WebSocket client sends a
     * message to this server. This function should be overridden in a subclass
     * to actually be any useful.
     **/
     onClientMessage:null
});

/**
 * SGF.Server.canServe -> Boolean
 *
 * Use this property to determine whether or not the current game client engine
 * has implemented [[SGF.Server]]. This value, for instance, is `false` on web
 * browser based game engines, as a web browser is not capable of starting it's
 * own WebSocket server. On the Java game engine, this value is `true`, as Java
 * has a WebSocket server written for it that can be used by your game.
 *
 *     if (SGF.Server.canServe) {
 *         var server = new SGF.Server();
 *         server.start();
 *     }
 **/
Server.canServe = false;

/**
 * SGF.Server.DEFAULTS -> Object
 *
 * The default values used when creating [[SGF.Server]]s. These values are
 * copied onto the [[SGF.Server]], if they are not found in the `options`
 * argument in the constructor.
 *
 * The [[SGF.Server.DEFAULTS]] object contains the default values:
 *
 *  - `port`: Default `8080`. The socket port number that this WebSocket server
 *  will bind to. Note that ports less than `1024` require administrator
 *  permissions to bind to by most operating systems, so if you would like to
 *  bind to one of those ports, you must always launch the implementing game
 *  client with administrator permissions.
 *  - `autostart`: Default `false`. Boolean determining whether to call
 *  [[SGF.Server#start]] at the end of construction.
 **/

modules['server'] = Server;
