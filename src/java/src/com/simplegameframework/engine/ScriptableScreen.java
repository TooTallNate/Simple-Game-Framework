package com.simplegameframework.engine;

import java.awt.Color;
import java.awt.Cursor;
import java.awt.Image;
import java.awt.Point;
import java.awt.Toolkit;
import java.awt.image.MemoryImageSource;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.ScriptableObject;

public class ScriptableScreen extends ScriptableObject {

    private Screen screen;
    private String colorStr = "000000";

    public ScriptableScreen() {
        this.screen = null;
    }

    public void setScreen(Screen screen) {
        this.screen = screen;
    }

    @Override
    public String getClassName() {
        return "ScriptableScreen";
    }

    public int jsGet_width() {
        return screen.getWidth();
    }

    public int jsGet_height() {
        return screen.getHeight();
    }

    public String jsGet_color() {
        return colorStr;
    }

    public void jsSet_color(String cssColor) {
        if (!cssColor.equals(colorStr)) {
            String r = cssColor.substring(0,2);
            String g = cssColor.substring(2,4);
            String b = cssColor.substring(4,6);
            screen.setBackgroundColor(new Color(Integer.parseInt(r, 16), Integer.parseInt(g, 16), Integer.parseInt(b, 16)));
            this.colorStr = cssColor;
        }
    }

    /**
     * Sets the "Screen" to use one of the specified native cursors, or
     * none at all (if your game doesn't use a cursor, or you're implementing
     * a custom one via a Component).
     * @param o The String value of the cursor, or false for none. Allowed
     *          String values are:
     *              - default
     *              - crosshair
     *              - hand
     *              - move
     *              - text
     *              - wait
     *              - none (same as 'false')
     *              - ?-resize (where ? = n, ne, e, se, s, sw, w, or nw)
     */
    public void jsFunction_useNativeCursor(Object o) {
        Cursor c = Cursor.getDefaultCursor();

        if (Boolean.FALSE.equals(Context.toBoolean(o))) {
            c = createEmptyCursor();
        }

        if (o != null) {
            String cursorStr = Context.toString(o).toLowerCase();
            if ("default".equals(cursorStr)) {
                c = new Cursor(Cursor.DEFAULT_CURSOR);
            } else if ("crosshair".equals(cursorStr)) {
                c = new Cursor(Cursor.CROSSHAIR_CURSOR);
            } else if ("hand".equals(cursorStr)) {
                c = new Cursor(Cursor.HAND_CURSOR);
            } else if ("move".equals(cursorStr)) {
                c = new Cursor(Cursor.MOVE_CURSOR);
            } else if ("text".equals(cursorStr)) {
                c = new Cursor(Cursor.TEXT_CURSOR);
            } else if ("wait".equals(cursorStr)) {
                c = new Cursor(Cursor.WAIT_CURSOR);
            } else if ("none".equals(cursorStr)) {
                c = createEmptyCursor();
            }
        }

        this.screen.setCursor(c);
    }

    private static Cursor createEmptyCursor() {
        int[] pixels = new int[16 * 16];
        Image image = Toolkit.getDefaultToolkit().createImage(new MemoryImageSource(16, 16, pixels, 0, 16));
        return Toolkit.getDefaultToolkit().createCustomCursor(image, new Point(0, 0), "emptyCursor");
    }
}
