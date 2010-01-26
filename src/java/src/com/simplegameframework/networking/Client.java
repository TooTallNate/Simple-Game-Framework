package com.simplegameframework.networking;

import java.net.URI;
import java.net.URISyntaxException;

/**
 * A light wrapper around a WebSocket client. Can be used by games through the
 * SGF.Client class.
 * @author nrajlich
 */
public abstract class Client {

    public WebSocketClient wsc;

    public void __setURI(String uri) throws URISyntaxException {
        this.wsc = new WebSocketClient(new URI(uri)) {
            public void onOpen() {
                __onOpen();
            }

            public void onClose() {
                __onClose();
            }

            public void onMessage(String message) {
                __onMessage(message);
            }
        };
    }

    // These get implemented by JavaScript SGF.Client objects //////////////////
    public abstract void __onOpen();
    public abstract void __onClose();
    public abstract void __onMessage(String message);

}
