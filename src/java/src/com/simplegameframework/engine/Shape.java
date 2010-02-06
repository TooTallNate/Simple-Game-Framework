package com.simplegameframework.engine;

import java.awt.Color;
import java.awt.Graphics2D;

/**
 * Shape is an abstract class that won't get instantiated directly. Instead,
 * Shape provides Color and a Fill property to its subclasses.
 * @author Nathan Rajlich
 */
public abstract class Shape extends Component {
    protected boolean fill;
    protected Color color = Color.BLACK;
    protected String colorStr = null;

    @Override
    public void doRender(Graphics2D g, double interpolation, long renderCount) {
        super.doRender(g, interpolation, renderCount);

        // Set the boolean if we should fill the shape or just render the outline.
        this.fill = __getFill();

        // Check if the color has changed, and create a native java.awt.Color if it has
        String colorString = __getColor();
        if (!colorString.equals(this.colorStr) && !colorString.equals("undefined"))
            setColor(colorString);
        
    }

    /**
     * Expects a full, 6 characted rgb CSS color string.
     * @param cssColor
     */
    private void setColor(String cssColor) {
        String r = cssColor.substring(0,2);
        String g = cssColor.substring(2,4);
        String b = cssColor.substring(4,6);
        this.color = new Color(Integer.parseInt(r, 16), Integer.parseInt(g, 16), Integer.parseInt(b, 16));
        this.colorStr = cssColor;
    }

    public abstract String __getColor();
    public abstract boolean __getFill();
}