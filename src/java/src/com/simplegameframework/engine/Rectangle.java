package com.simplegameframework.engine;

import java.awt.Graphics2D;
import java.awt.geom.AffineTransform;

public abstract class Rectangle extends Shape {

    @Override
    public void doRender(Graphics2D g, double interpolation, long renderCount) {
        // Call the superclass' doRender, including the user defined render() function
        super.doRender(g, interpolation, renderCount);

        // Draw the actual component based on its JavaScript values
        double rotation = __getRotation();
        boolean needToRotate = rotation % 360 != 0;
        AffineTransform origTransform = null;

        if (needToRotate) {
            origTransform = g.getTransform();
            AffineTransform rotatedTransform = (AffineTransform)origTransform.clone();
            rotatedTransform.rotate(Math.toRadians(rotation), currentFrameX + (__getWidth() / 2), currentFrameY + (__getHeight() / 2));
            g.setTransform(rotatedTransform);
        }

        g.setColor(color);
        g.fillRect((int)currentFrameX, (int)currentFrameY, (int)__getWidth(), (int)__getHeight());

        if (needToRotate) {
            g.setTransform(origTransform);
        }
    }
}