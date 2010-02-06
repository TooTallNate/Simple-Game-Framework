package com.simplegameframework.engine;

import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
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
     * The Image to draw this Container onto, as an intermediary buffer. The
     * buffer is reused each render, and only recreated when the size of the
     * Container is changed.
     */
    private BufferedImage buffer;
    /**
     * The width of the buffer, as to avoid calling buffer.getWidth(null), for
     * speed.
     */
    private int bufferWidth;
    /**
     * The width of the buffer, as to avoid calling buffer.getWidth(null), for
     * speed.
     */
    private int bufferHeight;

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

    /**
     * Rendering a Container is a two step process. First, create a Image
     * representing the Container. Then render all Components onto the Image,
     * finally draw the final image back onto the Graphics context.
     * @param g
     * @param interpolation
     * @param renderCount
     */
    public void doRender(Graphics2D g, double interpolation, long renderCount) {
        // Call the superclass' doRender, including the user defined render() function
        super.doRender(g, interpolation, renderCount);

        float opacity = (float)__getOpacity();
        if (opacity <= 0.001) {
            return; // If the Component is invisible, then return without rendering anything!
        } else {
            g.setComposite(getAlphaComposite());
        }

        // We need to ensure that Components are rendered according to their zIndex
        Component[] sortedComponents = components.toArray(new Component[0]);
        Arrays.sort(sortedComponents, Game.Z_INDEX_COMPARATOR);

        double width = __getWidth();
        double height = __getHeight();
        int iWidth = (int)width;
        int iHeight = (int)height;

        if (this.buffer == null ||
                this.bufferWidth != iWidth ||
                this.bufferHeight != iHeight) {

            //System.out.println("Recreating Container Buffer");

            if (this.buffer != null)
                this.buffer.flush();
            
            this.bufferHeight = iHeight;
            this.bufferWidth = iWidth;
            this.buffer = g.getDeviceConfiguration().createCompatibleImage(iWidth, iHeight, Color.TRANSLUCENT);
        }
        Graphics2D containerGraphics = this.buffer.createGraphics();
        //containerGraphics.setRenderingHint(java.awt.RenderingHints.KEY_ANTIALIASING, java.awt.RenderingHints.VALUE_ANTIALIAS_ON);
        containerGraphics.clearRect(0, 0, iWidth, iHeight);

        // Render each individual component onto the intermediary Graphics object
        for (Component c : sortedComponents) {
            c.doRender(containerGraphics, interpolation, renderCount);
        }






        this.currentRotationRad = __getRotation();
        boolean needToRotate = this.currentRotationRad % (Math.PI*2) != 0.0;
        if (needToRotate) {
            this.currentCenterX = currentFrameX + (width / 2d);
            this.currentCenterY = currentFrameY + (height / 2d);
            g.rotate(this.currentRotationRad, this.currentCenterX, this.currentCenterY);
        }



        containerGraphics.dispose();
        g.drawImage(this.buffer, (int)currentFrameX, (int)currentFrameY, iWidth, iHeight, null);


        if (needToRotate) {
            g.rotate(-this.currentRotationRad, this.currentCenterX, this.currentCenterY);
        }
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