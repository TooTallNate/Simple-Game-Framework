package com.simplegameframework.networking;

/**
 * <tt>Server</tt> is the Java implementation of the SGF.Server class in the
 * Networking API. It creates a standalone HTTP WebSocket server that only
 * accepts WebSocket connections. Standard HTTP requests are rejected. The
 * server instance can be used to create peer-to-peer networked games, in the
 * case where you want the game itself to be the hosting server (rather than
 * a permenant dedicated server for your game).
 */
public abstract class Server {

    public WebSocketServer wss;

    public Server() {
        this.wss = new WebSocketServer() {

            public void onClientOpen(WebSocket conn) {
                __onClientOpen(new ScriptableWebSocket(conn));
            }

            public void onClientClose(WebSocket conn) {
                __onClientClose(new ScriptableWebSocket(conn));
            }

            public void onClientMessage(WebSocket conn, String message) {
                __onClientMessage(new ScriptableWebSocket(conn), message);
            }

        };
    }

    public ScriptableWebSocket[] __connections() {
        WebSocket[] conns = this.wss.connections();
        ScriptableWebSocket[] rtn = new ScriptableWebSocket[conns.length];
        for (int i=0; i<conns.length; i++) {
            rtn[i] = new ScriptableWebSocket(conns[i]);
        }
        return rtn;
    }

    // These get implemented by the JavaScript SGF.Server.
    public abstract void __onClientOpen(Object conn);
    public abstract void __onClientClose(Object conn);
    public abstract void __onClientMessage(Object conn, String message);
}
