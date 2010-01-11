package com.simplegameframework.engine;

import java.awt.AlphaComposite;
import java.awt.Graphics2D;
import java.awt.geom.AffineTransform;

/**
 * Represents an individual sprite that gets drawn onto the screen, and updated
 * in the game loop. Sprites contain a reference to a Spriteset, and a current
 * x and y sprite coordinate that corresponds to which sprite to use on the
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
        
        Spriteset s = __getSpriteset();
        int spriteWidth = s.jsGet_spriteWidth();
        int spriteHeight = s.jsGet_spriteHeight();
        int sx1 = __getSpriteX() * spriteWidth;
        int sy1 = __getSpriteY() * spriteHeight;
        int sx2 = sx1 + spriteWidth;
        int sy2 = sy1 + spriteHeight;

        double rotation = __getRotation();
        boolean needToRotate = rotation % 360 != 0;
        AffineTransform origTransform = null;
        
        if (needToRotate) {
            origTransform = g.getTransform();
            AffineTransform rotatedTransform = (AffineTransform)origTransform.clone();
            rotatedTransform.rotate(Math.toRadians(rotation), currentFrameX + (__getWidth() / 2), currentFrameY + (__getHeight() / 2));
            g.setTransform(rotatedTransform);
        }

        float opacity = (float)__getOpacity();
        AlphaComposite origComposite = null;
        if (opacity < 1) {
            origComposite = (AlphaComposite)g.getComposite();
            g.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_OVER, opacity));
        }

        g.drawImage(s.getImage(),
                (int)currentFrameX,
                (int)currentFrameY,
                (int)(currentFrameX + __getWidth()),
                (int)(currentFrameY + __getHeight()),
                sx1,
                sy1,
                sx2,
                sy2,
                null);

        if (opacity < 1) {
            g.setComposite(origComposite);
        }

        if (needToRotate) {
            g.setTransform(origTransform);
        }
    }

    public abstract Spriteset __getSpriteset();
    public abstract int __getSpriteX();
    public abstract int __getSpriteY();
}
