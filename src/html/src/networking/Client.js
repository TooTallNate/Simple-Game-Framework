/** section: Networking API
 * class Client
 *
 * Connects to remote instances of [[Server]], or any other compliant
 * WebSocket server.
 *
 * An [[Client]] instance by itself does nothing except connect to the
 * specified server. You must implement an `onOpen`, `onClose`, and `onMessage`
 * function in either a subclass:
 *
 *     Class.create(Client, {
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
 * or by directly setting the functions on a standard [[Client]] instance:
 *
 *     var conn = new Client("ws://somegameserver");
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


/**
 * new Client(url[, options])
 * - url (String): The WebSocket URL to the server to connect to. This should
 *                 use the `ws` protocol, port 80 by default. Ex: `ws://mygame.com:8080`
 * - options (Object): The optional `options` object's properties are copied
 *                     to the [[Client]] instance. Allows all the same
 *                     values as found in [[Client.DEFAULTS]].
 *
 * Instantiates a new [[Client]], using the options found in the
 * `options` parameter to configure. Clients do not make a socket connection
 * during construction (unlike the WebSocket API in HTML 5). To connect to
 * the server, the [[Client#connect]] method must be called first.
 **/
function Client(url, options) {
    var self = this;
    
    EventEmitter.call(self);

    extend(self, options || {});

    self['URL'] = url;
    
    self['_O'] = functionBind(onClientOpen, self);
    self['_C'] = functionBind(onClientClose, self);
    self['_M'] = functionBind(onClientMessage, self);

    if (self['autoconnect']) self['connect']();
}

inherits(Client, EventEmitter);
makePrototypeClassCompatible(Client);

/**
 * Client#onOpen() -> undefined
 *
 * Event handler that is called after an invokation to [[Client#connect]]
 * has been successful, and a proper WebSocket connection has been established.
 * You must implement this function in a subclass to be useful.
 **/
//onOpen: Prototype['emptyFunction'],

/**
 * Client#onClose() -> undefined
 *
 * Event handler that is called after an invokation to [[Client#close]]
 * has been called, resulting in a socket being closed. That is, if you call
 * [[Client#close]] on an instance that is already closed, then this
 * event will not be called.
 * Perhaps more importantly, this event will be called if the server closes
 * the connection (either directly through code or otherwise).
 * You must implement this function in a subclass to be useful.
 **/
//onClose: Prototype['emptyFunction'],

/**
 * Client#onMessage(message) -> undefined
 * - message (String): The String value of the message sent from the server.
 *
 * Event handler that is called after the server sends a message to this
 * instance through the network. You must implement this function in a
 * subclass to be useful with the `message` value in your game.
 **/
//onMessage: Prototype['emptyFunction'],

/**
 * Client#connect() -> undefined
 *
 * Makes this [[Client]] instance attempt to connect to the currently
 * set WebSocket server. This function will connect the underlying socket
 * connection on a network level, and call the [[Client#onOpen]] event
 * when the connection is properly established, and the WebSocket handshake
 * is successful.
 **/
Client.prototype['connect'] = function() {
    var webSocket = new WebSocket(this['URL']);
    webSocket['onopen'] = this['_O'];
    webSocket['onclose'] = this['_C'];
    webSocket['onmessage'] = this['_M'];
    this['_w'] = webSocket;
}

/**
 * Client#close() -> undefined
 *
 * Closes the underlying socket connection from the server, if there is a
 * connection, and calls the [[Client#onClose]] event when complete.
 * If the connection is already closed, then this function does nothing, and
 * the `onClose` event is not fired.
 **/
Client.prototype['close'] = function() {
    if (this['_w']) {
        this['_w']['close']();
    }
}

/**
 * Client#send(message) -> undefined
 * - message (String): The String that you will be sending to the server.
 *
 * Sends `message` to the currently connected server if it is connected.
 * If this [[Client]] instance is not connected when this is called,
 * then an exception is thrown. As such, it's a good idea to place calls
 * to [[Client#send]] inside of a try catch block:
 *
 *     try {
 *         client.send("hello server!");
 *     } catch(ex) {
 *         SGF.log(ex);
 *     }
 *
 * A use case when an exception is thrown would be to add `message` to some
 * sort of queue that gets sent during the [[Client#onOpen]] event.
 **/
Client.prototype['send'] = function(message) {
    this['_w']['send'](message);
}

function onClientOpen() {
    this['emit']("open");
}

function onClientClose() {
    this['emit']("close");
    this['_w'] = null;
}

function onClientMessage(event) {
    this['emit']("message", event['data']);
}


Client.prototype['autoconnect'] = false;
Client.prototype['toString'] = functionReturnString("[object Client]");

extend(Client, {
    'CONNECTING': 0,
    'OPEN':       1,
    'CLOSED':     2
});

modules['client'] = Client;