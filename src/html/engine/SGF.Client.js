/**
 * == Networking API ==
 * SGF offers a low-level socket connection through the WebSocket protocol.
 * This allows for real time networking inside your game.
 * All game clients **MUST** implement [[SGF.Client]], but only capable game
 * clients should implement [[SGF.Server]].
 **/

/** section: Networking API
 * class SGF.Client
 *
 * Connects to remote instances of [[SGF.Server]], or any other compliant
 * WebSocket server.
 *
 * An [[SGF.Client]] instance by itself does nothing except connect to the
 * specified server. You must implement an `onOpen`, `onClose`, and `onMessage`
 * function in either a subclass:
 *
 *     Class.create(SGF.Client, {
 *         onOpen: function() {
 *             // Connection to WebSocket has been established.
 *         },
 *         onClose: function() {
 *             // WebSocket connection has been closed.
 *         },
 *         onMessage: function(message) {
 *             // A message has been recieved from the server.
 *             SGF.log(message);
 *         }
 *     });
 *
 * or by directly setting the functions on a standard [[SGF.Client]] instance:
 *
 *     var conn = new SGF.Client("ws://somegameserver");
 *     conn.onOpen = function() {
 *         // Connection to WebSocket has been established.
 *     };
 *     conn.onClose = function() {
 *         // WebSocket connection has been closed.
 *     };
 *     conn.onMessage = function(message) {
 *         // A message has been recieved from the server.
 *         SGF.log(message);
 *     };
 **/
SGF.Client = Class.create({
    /**
     * new SGF.Client(url[, options])
     * - url (String): The WebSocket URL to the server to connect to. This should
     *                 use the `ws` protocol, port 80 by default. Ex: `ws://mygame.com:8080`
     * - options (Object): The optional `options` object's properties are copied
     *                     to the [[SGF.Client]] instance. Allows all the same
     *                     values as found in [[SGF.Client.DEFAULTS]].
     *
     * Instantiates a new [[SGF.Client]], using the options found in the
     * `options` parameter to configure. Clients do not make a socket connection
     * during construction (unlike the WebSocket API in HTML 5). To connect to
     * the server, the [[SGF.Client#connect]] method must be called first.
     **/
    initialize: function(url, options) {
        Object.extend(this, Object.extend(Object.clone(SGF.Client.DEFAULTS), options || {}));
        this.URL = url;
        this.__bindedOnOpen = this.__onOpen.bind(this);
        this.__bindedOnClose = this.__onClose.bind(this);
        this.__bindedOnMessage = this.__onMessage.bind(this);

        if (this.autoconnect === true) this.connect();
    },
    /**
     * SGF.Client#onOpen() -> undefined
     *
     * Event handler that is called after an invokation to [[SGF.Client#connect]]
     * has been successful, and a proper WebSocket connection has been established.
     * You must implement this function in a subclass to be useful.
     **/
    onOpen: Prototype.emptyFunction,
    /**
     * SGF.Client#onClose() -> undefined
     *
     * Event handler that is called after an invokation to [[SGF.Client#close]]
     * has been called, resulting in a socket being closed. That is, if you call
     * [[SGF.Client#close]] on an instance that is already closed, then this
     * event will not be called.
     * Perhaps more importantly, this event will be called if the server closes
     * the connection (either directly through code or otherwise).
     * You must implement this function in a subclass to be useful.
     **/
    onClose: Prototype.emptyFunction,
    /**
     * SGF.Client#onMessage(message) -> undefined
     * - message (String): The String value of the message sent from the server.
     *
     * Event handler that is called after the server sends a message to this
     * instance through the network. You must implement this function in a
     * subclass to be useful with the `message` value in your game.
     **/
    onMessage: Prototype.emptyFunction,
    /**
     * SGF.Client#connect() -> undefined
     *
     * Makes this [[SGF.Client]] instance attempt to connect to the currently
     * set WebSocket server. This function will connect the underlying socket
     * connection on a network level, and call the [[SGF.Client#onOpen]] event
     * when the connection is properly established, and the WebSocket handshake
     * is successful.
     **/
    connect: function() {
        this.__ws = new WebSocket(this.URL);
        this.__ws.onopen = this.__bindedOnOpen;
        this.__ws.onclose = this.__bindedOnClose;
        this.__ws.onmessage = this.__bindedOnMessage;
    },
    /**
     * SGF.Client#close() -> undefined
     *
     * Closes the underlying socket connection from the server, if there is a
     * connection, and calls the [[SGF.Client#onClose]] event when complete.
     * If the connection is already closed, then this function does nothing, and
     * the `onClose` event is not fired.
     **/
    close: function() {
        if (this.__ws) {
            this.__ws.close();
        }
    },
    /**
     * SGF.Client#send(message) -> undefined
     * - message (String): The String that you will be sent to the server.
     *
     * Sends `message` to the currently connected server if it is connected.
     * If this [[SGF.Client]] instance is not connected when this is called,
     * then an exception is thrown. As such, it's a good idea to place calls
     * to [[SGF.Client#send]] inside of a try catch block:
     *
     *     try {
     *         client.send("hello server!");
     *     } catch(ex) {
     *         SGF.log(ex);
     *     }
     *
     * A use case when an exception is thrown would be to add `message` to some
     * sort of queue that gets sent during the [[SGF.Client#onOpen]] event.
     **/
    send: function(message) {
        this.__ws.send(message);
    },
    __onOpen: function() {
        this.onOpen();
    },
    __onClose: function() {
        this.onClose();
        this.__ws = null;
    },
    __onMessage: function(event) {
        this.onMessage(event.data);
    }
});

Object.extend(SGF.Client, {
    /**
     * SGF.Client.DEFAULTS -> Object
     *
     * The default values used when creating [[SGF.Client]]s. These values are
     * copied onto the [[SGF.Client]] instance, if they are not found in the
     * `options` parameter in the constructor.
     *
     * The [[SGF.Client.DEFAULTS]] object contains the default values:
     *
     *  - `autoconnect`: Default `false`. Boolean determining whether to call
     *  [[SGF.Client#connect]] at the end of construction.
     **/
    DEFAULTS: {
        autoconnect: false
    },
    CONNECTING: 0,
    OPEN:       1,
    CLOSED:     2
});
