package com.simplegameframework.engine;

import java.awt.Canvas;
import java.net.URL;

public class Player extends Canvas {
    
    private final URL gameRoot;
    
    public Player(URL gameRoot) {
        this.gameRoot = gameRoot;
    }
}
