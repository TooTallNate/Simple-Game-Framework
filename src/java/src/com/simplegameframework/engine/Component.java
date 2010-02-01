package com.simplegameframework.engine;

import java.awt.AlphaComposite;
import java.awt.Graphics2D;

/**
 * Represents an individual component that gets updated/rendered in the game
 * loop. Instances of this class are made though <code>new SGF.Component();</code>,
 * and it's subclasses.
 * @author Nathan Rajlich
 */
public abstract class Component {

    public abstract void __render(double interpolation, long renderCount);
    public abstract void __update(long updateCount);

    public abstract double __getWidth();
    public abstract double __getHeight();
    public abstract double __getX();
    public abstract double __getY();
    public abstract double __getDx();
    public abstract double __getDy();
    public abstract double __getOpacity();
    public abstract double __getRotation();
    public abstract int __getZIndex();

    protected double currentFrameX, currentFrameY;
    protected double currentRotationRad, currentCenterX, currentCenterY;
    
    private AlphaComposite alpha;
    private float alphaVal;




    /**
     * Called by the game loop for each call to 'render()'.
     * @param g The Graphics2D object to draw onto.
     * @param interpolation The interpolation value, percentage in between current
     *                      update() calls this render() call is taking place.
     * @param renderCount The total number of time render() has been called by
     *                    the game loop.
     */
    public void doRender(Graphics2D g, double interpolation, long renderCount) {
        // Call the JS object's "render" function.
        __render(interpolation, renderCount);

        double dx = __getDx();
        if (dx != 0) {
            currentFrameX = __getX() + (interpolation * dx);
        } else {
            currentFrameX = __getX();
        }
        double dy = __getDy();
        if (dy != 0) {
            currentFrameY = __getY() + (interpolation * dy);
        } else {
            currentFrameY = __getY();
        }
    }

    /**
     * Called by the game loop for each call to 'update()'.
     * @param updateCount The total number of times update() has been called by
     *                    the game loop.
     */
    public void doUpdate(long updateCount) {
        // Call the JS object's "update" function.
        __update(updateCount);
    }

    protected AlphaComposite getAlphaComposite() {
        float currentAlpha = (float)__getOpacity();
        if (this.alphaVal != currentAlpha) {
            this.alpha = AlphaComposite.getInstance(AlphaComposite.SRC_OVER, Math.min(1, currentAlpha));
            this.alphaVal = currentAlpha;
        }
        return this.alpha;
    }
}
