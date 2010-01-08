package com.simplegameframework.engine;

import java.awt.Graphics2D;

/**
 * Represents an individual sprite that gets drawn onto the screen, and updated
 * in the game loop. Sprites contain a reference to a Spriteset, and a current
 * x and y sprite coordinate that corresponds to the Spriteset.
 * @author Nathan Rajlich
 */
public abstract class Sprite extends Component {

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
    }

    public abstract Spriteset __getSpriteset();
    public abstract int __getSpriteX();
    public abstract int __getSpriteY();
}
