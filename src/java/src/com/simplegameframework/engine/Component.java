package com.simplegameframework.engine;

import java.awt.Graphics2D;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;

/**
 * Represents an individual component that gets updated/rendered in the game
 * loop. Instances of this class are made though <code>new SGF.Component();</code>,
 * and it's subclasses.
 * @author Nathan Rajlich
 */
public abstract class Component {

    /**
     * The <tt>Scriptable</tt> object that represents this <tt>Component</tt>.
     */
    protected Scriptable thisInstance;

    protected double width, height, x, y, dx, dy, opacity;
    protected int zIndex;

    public abstract void render();
    public abstract void render(double interpolation, long renderCount);
    
    public abstract void update();
    public abstract void update(long updateCount);


    /**
     * Called by the game loop for each call to 'render()'.
     * @param interpolation The interpolation value, percentage in between current
     *                      update() calls this render() call is taking place.
     * @param renderCount The total number of time render() has been called by
     *                    the game loop.
     */
    public void doRender(Graphics2D g, double interpolation, long renderCount) {
        render(interpolation, renderCount);

        width = Context.toNumber(thisInstance.get("width", thisInstance));
        height = Context.toNumber(thisInstance.get("height", thisInstance));
        x = Context.toNumber(thisInstance.get("x", thisInstance));
        y = Context.toNumber(thisInstance.get("y", thisInstance));
        dx = Context.toNumber(thisInstance.get("dx", thisInstance));
        dy = Context.toNumber(thisInstance.get("dy", thisInstance));
        opacity = Context.toNumber(thisInstance.get("opacity", thisInstance));
        zIndex = (int)Context.toNumber(thisInstance.get("zIndex", thisInstance));
    }

    /**
     * Called by the game loop for each call to 'update()'.
     * @param updateCount The total number of times update() has been called by
     *                    the game loop.
     */
    public void doUpdate(long updateCount) {
        update(updateCount);
    }

    /**
     * Binds the JavaScript <tt>Scriptable</tt> and this <tt>Component</tt>.
     * @param obj
     */
    public void setJsObj(Scriptable obj) {
        this.thisInstance = obj;
    }
}
