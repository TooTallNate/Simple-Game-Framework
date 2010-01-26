SGF.Server = Class.create({
    initialize: function(options) {
        Object.extend(this, Object.extend(Object.clone(SGF.Server.DEFAULTS), options || {}));
        this.__this = this;
        this.__server = new Packages.com.simplegameframework.networking.Server(this);
        this.__server.wss.setPort(this.port);

        if (this.autostart === true) this.start();
    },
    start: function() {
        this.__server.wss.start();
    },
    stop: function() {
        this.__server.wss.stop();
    },
    connections: function() {
        return $A(this.__server.__connections());
    },
    sendToAll: function(message) {
        this.__server.wss.sendToAll(message);
    },

    onClientOpen: Prototype.emptyFunction,
    onClientClose: Prototype.emptyFunction,
    onClientMessage: Prototype.emptyFunction,

    __onClientOpen: function(conn) {
        this.__this.onClientOpen(conn);
    },
    __onClientClose: function(conn) {
        this.__this.onClientClose(conn);
    },
    __onClientMessage: function(conn, message) {
        this.__this.onClientMessage(conn, message);
    }
});

Object.extend(SGF.Server, {
    DEFAULTS: {
        port: 8080,
        autostart: false
    },
    canServe: true
});
