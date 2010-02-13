package com.simplegameframework.engine;

import java.awt.Graphics2D;
import org.mozilla.javascript.Scriptable;

public abstract class DumbContainer extends Container {
    public DumbContainer() {
        super();
        shouldUpdateComponents = false;
    }

    @Override
    public void add(Scriptable o) {
        super.add(o);
        needsRender = true;
    }

    @Override
    public void remove(Scriptable o) {
        super.remove(o);
        needsRender = true;
    }

    @Override
    void renderContainer(int w, int h, double interpolation, long renderCount) {
        super.renderContainer(w, h, interpolation, renderCount);
        needsRender = false;
    }

    @Override
    void recreateBuffer(Graphics2D g, int iWidth, int iHeight) {
        super.recreateBuffer(g, iWidth, iHeight);
        needsRender = true;
    }

}
