package com.simplegameframework.engine;

import java.awt.Graphics2D;
import java.awt.geom.Rectangle2D;

public abstract class Rectangle extends Shape {

    private final Rectangle2D.Double rect;

    public Rectangle() {
        this.rect = new Rectangle2D.Double();
    }

    @Override
    public void doRender(Graphics2D g, double interpolation, long renderCount) {
        // Call the superclass' doRender, including the user defined render() function
        super.doRender(g, interpolation, renderCount);

        float opacity = (float)__getOpacity();
        if (opacity <= 0.001) {
            return; // If the Component is invisible, then return without rendering anything!
        } else {
            g.setComposite(getAlphaComposite());
        }

        // Draw the actual component based on its JavaScript values
        double width = __getWidth();
        double height = __getHeight();
        if (!this.fill) {
            //width -= 2;
            //height -= 2;
            //currentFrameX += 1;
            //currentFrameY += 1;
        }

        this.currentRotationRad = __getRotation();
        boolean needToRotate = this.currentRotationRad % (Math.PI*2) != 0.0;
        if (needToRotate) {
            this.currentCenterX = currentFrameX + (width / 2d);
            this.currentCenterY = currentFrameY + (height / 2d);
            g.rotate(this.currentRotationRad, this.currentCenterX, this.currentCenterY);
        }

        g.setColor(color);
        rect.x = currentFrameX;
        rect.y = currentFrameY;
        rect.width = width;
        rect.height = height;
        if (this.fill) {
            g.fill(rect);
        } else {
            g.draw(rect);
        }

        if (needToRotate) {
            g.rotate(-this.currentRotationRad, this.currentCenterX, this.currentCenterY);
        }
    }
}