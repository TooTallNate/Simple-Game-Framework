package com.simplegameframework.engine;

import java.awt.Graphics2D;
import java.util.Arrays;
import java.util.concurrent.CopyOnWriteArrayList;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.NativeJavaObject;
import org.mozilla.javascript.Scriptable;

public abstract class Container extends Component {
    /**
     * Internal array of the <tt>Component</tt>s currently placed inside
     * this Container.
     */
    private final CopyOnWriteArrayList<Component> components;

    /**
     * Called when the Container is instantiated (through JS code).
     */
    public Container() {
        this.components = new CopyOnWriteArrayList<Component>();
    }

    /**
     * Adds a SGF.Component to the array of components in this Container.
     * @param o The SGF.Component to add.
     */
    public void add(Scriptable o) {
        Object javaComponent = o.get("__component", o);
        if (javaComponent instanceof NativeJavaObject) {
            javaComponent = ((NativeJavaObject)javaComponent).unwrap();
            if (javaComponent instanceof Component) {
                this.components.add((Component)javaComponent);
                return;
            }
        }
        throw Context.reportRuntimeError(Context.toString(o) + " is not an instance of SGF.Component!");
    }

    /**
     * Removes a SGF.Component from the array of components in this Container.
     * @param o The SGF.Component to remove.
     */
    public void remove(Scriptable o) {
        Object javaComponent = o.get("__component", o);
        if (javaComponent instanceof NativeJavaObject) {
            javaComponent = ((NativeJavaObject)javaComponent).unwrap();
            if (javaComponent instanceof Component) {
                this.components.remove((Component)javaComponent);
                return;
            }
        }
        throw Context.reportRuntimeError(Context.toString(o) + " is not an instance of SGF.Component!");
    }

    public void doRender(Graphics2D g, double interpolation, long renderCount) {
        // Call the superclass' doRender, including the user defined render() function
        super.doRender(g, interpolation, renderCount);

        Component[] sortedComponents = components.toArray(new Component[0]);
        Arrays.sort(sortedComponents, Game.Z_INDEX_COMPARATOR);

        g.translate((int)currentFrameX, (int)currentFrameY);
        for (Component c : sortedComponents) {
            c.doRender(g, interpolation, renderCount);
        }
        g.translate(0, 0);
    }

    public void doUpdate(long updateCount) {
        // Call the SGF.Container#update function always.
        super.doUpdate(updateCount);

        // Check if the SGF.Container#updateChildren flag is true, and then
        // call SGF.Component#update on all components if it is.
        if (Boolean.TRUE.equals(__shouldUpdateChildren())) {
            for (Component c : components) {
                c.doUpdate(updateCount);
            }
        }
    }

    /**
     * Return value is used by doUpdate to determine whether or not to call
     * SGF.Component#update on all components inside this Container.
     * @return True or false
     */
    public abstract Boolean __shouldUpdateChildren();
}