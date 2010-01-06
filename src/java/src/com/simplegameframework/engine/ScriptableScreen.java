package com.simplegameframework.engine;

import org.mozilla.javascript.ScriptableObject;

public class ScriptableScreen extends ScriptableObject {

    private Screen screen;

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

    public int jsFunction_getWidth() {
        return screen.getWidth();
    }

    public int jsFunction_getHeight() {
        return screen.getHeight();
    }

    public void jsFunction_showNativeCursor(Object o) {
        
    }
}