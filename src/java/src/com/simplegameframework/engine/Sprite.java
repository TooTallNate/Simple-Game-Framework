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
        System.out.println("W: " + this.width + ", H: " + this.height);
    }
}