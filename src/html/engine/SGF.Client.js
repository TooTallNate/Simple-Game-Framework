/**
 * == Networking API ==
 * SGF offers a low-level socket connection through the WebSocket protocol.
 * This allows for real time game networking between through your game.
 * All game clients **MUST** implement [[SGF.Client]], but only capable game
 * clients should implement [[SGF.Server]].
 **/

/** section: Networking API
 * class SGF.Client
 *
 * Connects to remote instances of [[SGF.Server]], or any other dedicated
 * WebSocket server.
 *
 * [[SGF.Client]] instances by themselves do nothing except connect to the
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
    initialize: function(wsUri, options) {
        this.__ws = new WebSocket(wsUri);
        this.__ws.onopen = this.__onOpen.bind(this);
        this.__ws.onclose = this.__onClose.bind(this);
        this.__ws.onmessage = this.__onMessage.bind(this);
    },
    onOpen: Prototype.emptyFunction,
    onClose: Prototype.emptyFunction,
    onMessage: Prototype.emptyFunction,

    send: function(message) {
        this.__ws.send(message);
    },
    __onOpen: function() {
        this.onOpen();
    },
    __onClose: function() {
        this.onClose();
    },
    __onMessage: function(event) {
        this.onMessage(event.data);
    }
});
