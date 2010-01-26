SGF.Client = Class.create({
    initialize: function(wsUri, options) {
        Object.extend(this, Object.extend(Object.clone(SGF.Server.DEFAULTS), options || {}));
        this.URL = wsUri;
        this.__this = this;
        this.__client = new Packages.com.simplegameframework.networking.Client(this);
        this.__client.__setURI(wsUri);
        this.state = SGF.Client.CLOSED;

        if (this.autoconnect === true) this.connect();
    },

    connect: function() {
        this.state = SGF.Client.CONNECTING;
        this.__client.wsc.connect();
    },

    close: function() {
        this.__client.wsc.close();
    },
    
    send: function(message) {
        this.__client.wsc.send(message);
    },

    onOpen: Prototype.emptyFunction,
    onClose: Prototype.emptyFunction,
    onMessage: Prototype.emptyFunction,

    __onOpen: function() {
        this.state = SGF.Client.OPEN;
        this.__this.onOpen();
    },
    __onClose: function() {
        this.state = SGF.Client.CLOSED;
        this.__this.onClose();
    },
    __onMessage: function(message) {
        this.__this.onMessage(message);
    }
});

Object.extend(SGF.Client, {
    DEFAULTS: {
        autoconnect: false
    },
    CONNECTING: 0,
    OPEN:       1,
    CLOSED:     2
});
