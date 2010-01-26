package com.simplegameframework.networking;

import java.io.IOException;
import org.mozilla.javascript.ScriptableObject;

public class ScriptableWebSocket extends ScriptableObject {

    private final WebSocket socket;

    public ScriptableWebSocket(WebSocket socket) {
        this.socket = socket;
        this.defineFunctionProperties(new String[] { "close", "send" }, this.getClass(), PERMANENT);
    }

    @Override
    public String getClassName() {
        return "WebSocket";
    }

    public void send(String message) throws IOException {
        this.socket.send(message);
    }

    public void close() throws IOException {
        this.socket.close();
    }
    
}