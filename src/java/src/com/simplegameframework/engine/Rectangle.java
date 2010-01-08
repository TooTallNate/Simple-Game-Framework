package com.simplegameframework.engine;

import java.awt.Graphics2D;

public abstract class Rectangle extends Shape {

    @Override
    public void doRender(Graphics2D g, double interpolation, long renderCount) {
        // Call the superclass' doRender, including the user defined render() function
        super.doRender(g, interpolation, renderCount);

        // Draw the actual component based on its JavaScript values
        g.setColor(color);
        g.fillRect((int)currentFrameX, (int)currentFrameY, (int)__getWidth(), (int)__getHeight());
    }
}