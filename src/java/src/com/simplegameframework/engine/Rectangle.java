package com.simplegameframework.engine;

import java.awt.Color;
import java.awt.Graphics2D;
import org.mozilla.javascript.Context;

public abstract class Rectangle extends Component {

    protected Color color;
    protected String colorStr;
    private String lastKnownColorStr = null;

    @Override
    public void doRender(Graphics2D g, double interpolation, long renderCount) {
        super.doRender(g, interpolation, renderCount);

        // Check if the color has changed, and create a native java.awt.Color is it has
        String colorString = Context.toString(thisInstance.get("color", thisInstance));
        if (!colorString.equals(this.colorStr)) setColor(colorString);

        // Draw the actual component based on its JavaScript values
        g.setColor(color);
        //g.drawRect((int)x, (int)y, (int)width, (int)height);
        g.fillRect((int)x, (int)y, (int)width, (int)height);
    }

    /**
     *
     * @param cssColor
     */
    private void setColor(String cssColor) {
        String r = cssColor.substring(0,2);
        String g = cssColor.substring(2,4);
        String b = cssColor.substring(4,6);
        this.color = new Color(Integer.parseInt(r, 16), Integer.parseInt(g, 16), Integer.parseInt(b, 16));
        this.lastKnownColorStr = cssColor;
    }
}