package com.simplegameframework.engine;

import java.awt.AlphaComposite;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.Image;
import java.awt.image.VolatileImage;
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

    private double currentRotationRad;
    private double currentCenterX;
    private double currentCenterY;

    /**
     * The Image to draw this Container onto, as an intermediary buffer. The
     * buffer is reused each render, and only recreated when the size of the
     * Container is changed.
     */
    private VolatileImage buffer;
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

        // We need to ensure that Components are rendered according to their zIndex
        Component[] sortedComponents = components.toArray(new Component[0]);
        Arrays.sort(sortedComponents, Game.Z_INDEX_COMPARATOR);

        double width = __getWidth();
        double height = __getHeight();
        int iWidth = (int)width;
        int iHeight = (int)height;

        if (this.buffer == null ||
                this.bufferWidth != iWidth ||
                this.bufferHeight != iHeight ||
                this.buffer.contentsLost()) {

            //System.out.println("Recreating Container Buffer");

            if (this.buffer != null)
                this.buffer.flush();
            
            this.bufferHeight = iHeight;
            this.bufferWidth = iWidth;
            this.buffer = g.getDeviceConfiguration().createCompatibleVolatileImage(iWidth, iHeight, Color.TRANSLUCENT);
        }
        Graphics2D containerGraphics = (Graphics2D)this.buffer.getGraphics();//.createGraphics();
        containerGraphics.clearRect(0, 0, iWidth, iHeight);

        // Render each individual component onto the intermediary Graphics object
        for (Component c : sortedComponents) {
            c.doRender(containerGraphics, interpolation, renderCount);
        }







        double rotation = __getRotation();
        boolean needToRotate = rotation % 360 != 0;

        if (needToRotate) {
            this.currentRotationRad = Math.toRadians(rotation);
            this.currentCenterX = currentFrameX + (width / 2d);
            this.currentCenterY = currentFrameY + (height / 2d);
            g.rotate(this.currentRotationRad, this.currentCenterX, this.currentCenterY);
        }

        float opacity = (float)__getOpacity();
        AlphaComposite origComposite = null;
        if (opacity < 1.0f) {
            origComposite = (AlphaComposite)g.getComposite();
            g.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_OVER, opacity));
        }

        containerGraphics.dispose();
        g.drawImage(this.buffer, (int)currentFrameX, (int)currentFrameY, iWidth, iHeight, null);


        if (opacity < 1.0f) {
            g.setComposite(origComposite);
        }

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