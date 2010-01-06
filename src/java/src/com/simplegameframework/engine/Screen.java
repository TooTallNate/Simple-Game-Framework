package com.simplegameframework.engine;

import java.awt.Canvas;
import java.awt.Container;
import java.awt.image.BufferStrategy;

/**
 * 
 * @author Nathan Rajlich
 */
public class Screen extends Canvas {
    protected BufferStrategy strategy;

    public Screen(Container c) {
        c.add(this);

        this.setIgnoreRepaint(true);
        this.createBufferStrategy(2);
        this.strategy = this.getBufferStrategy();
    }

    public void setInput(Input input) {
        this.addKeyListener(input);
        this.addMouseListener(input);
        this.addMouseMotionListener(input);
    }
}