package com.simplegameframework.engine;

import java.awt.Graphics2D;

/**
 * Represents an individual sprite that gets drawn onto the screen, and updated
 * in the game loop. Sprites contain a reference to a Spriteset, and a current
 * x and y sprite coordinate that corresponds to which sprite to use from the
 * Spriteset.
 * @author Nathan Rajlich
 */
public abstract class Sprite extends Component {

    /**
     * Calls the JavaScript SGF.Sprite's 'render()' function, then draws the
     * sprite image onto the Graphics object <var>g</var>.
     * @param g The Graphics2D object to draw onto.
     * @param interpolation
     * @param renderCount The total number of times 'render()' has been called
     *                    for the lifetime of the Game (not the Sprite). This
     *                    value isn't used to draw the image onto the screen,
     *                    but may be used in overidden 'render' functions in
     *                    SGF.Sprite subclasses.
     */
    @Override
    public void doRender(Graphics2D g, double interpolation, long renderCount) {
        super.doRender(g, interpolation, renderCount);

        float opacity = (float)__getOpacity();
        if (opacity <= 0) {
            return; // If the Component is invisible, then return without rendering anything!
        } else {
            g.setComposite(getAlphaComposite());
        }

        double width = __getWidth();
        double height = __getHeight();

        Spriteset s = __getSpriteset();
        int spriteWidth = s.jsGet_spriteWidth();
        int spriteHeight = s.jsGet_spriteHeight();
        int sx1 = __getSpriteX() * spriteWidth;
        int sy1 = __getSpriteY() * spriteHeight;
        int sx2 = sx1 + spriteWidth;
        int sy2 = sy1 + spriteHeight;

        this.currentRotationRad = __getRotation();
        boolean needToRotate = this.currentRotationRad % (Math.PI*2) != 0.0;
        if (needToRotate) {
            this.currentCenterX = currentFrameX + (width / 2d);
            this.currentCenterY = currentFrameY + (height / 2d);
            g.rotate(this.currentRotationRad, this.currentCenterX, this.currentCenterY);
        }

        g.drawImage(s.getImage(),
                (int)currentFrameX,
                (int)currentFrameY,
                (int)(currentFrameX + width),
                (int)(currentFrameY + height),
                sx1,
                sy1,
                sx2,
                sy2,
                null);

        if (needToRotate) {
            g.rotate(-this.currentRotationRad, this.currentCenterX, this.currentCenterY);
        }
    }

    public abstract Spriteset __getSpriteset();
    public abstract int __getSpriteX();
    public abstract int __getSpriteY();
}
