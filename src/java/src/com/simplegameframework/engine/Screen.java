package com.simplegameframework.engine;

import java.awt.Canvas;
import java.awt.Color;
import java.awt.Container;
import java.awt.image.BufferStrategy;

/**
 * 
 * @author Nathan Rajlich
 */
public class Screen extends Canvas {
    protected BufferStrategy strategy;
    private Color backgroundColor;

    public Screen(Container c) {
        // Container c is expected to be visible, otherwise createBufferStrategy will fail
        c.add(this);

        this.setIgnoreRepaint(true);
        this.createBufferStrategy(2);
        this.strategy = this.getBufferStrategy();

    }

    public void setBackgroundColor(Color color) {
        this.backgroundColor = color;
    }

    public Color getBackgroundColor() {
        return this.backgroundColor;
    }

    public void setInput(Input input) {
        this.addKeyListener(input);
        this.addMouseListener(input);
        this.addMouseMotionListener(input);
    }
}