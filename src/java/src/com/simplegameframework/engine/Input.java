package com.simplegameframework.engine;

import java.awt.event.KeyEvent;
import java.awt.event.KeyListener;
import java.awt.event.MouseEvent;
import java.awt.event.MouseListener;
import java.awt.event.MouseMotionListener;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Function;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;

public class Input extends ScriptableObject implements KeyListener, MouseListener, MouseMotionListener {


    private ConcurrentHashMap<Integer, Boolean> keysDown;
    private ConcurrentHashMap<String, CopyOnWriteArrayList<Function>> observers;
    private int pointerX;
    private int pointerY;

    public Input() {
        this.keysDown = new ConcurrentHashMap<Integer, Boolean>();
        this.observers = new ConcurrentHashMap<String, CopyOnWriteArrayList<Function>>();
        for (String s : new String[] { "mousemove", "mouseup", "mousedown",
                            "keydown", "keyup" }) {
            this.observers.put(s, new CopyOnWriteArrayList<Function>());
        }
        this.pointerX = this.pointerY = 0;
    }

    public void jsConstructor() {
    }

    @Override
    public String getClassName() {
        return "Input";
    }

    // JS Constants /////////
    public int jsGet_MOUSE_PRIMARY() { return MouseEvent.BUTTON1; }
    public int jsGet_MOUSE_MIDDLE() { return MouseEvent.BUTTON2; }
    public int jsGet_MOUSE_SECONDARY() { return MouseEvent.BUTTON3; }

    public int jsGet_KEY_DOWN() { return KeyEvent.VK_DOWN; }
    public int jsGet_KEY_LEFT() { return KeyEvent.VK_LEFT; }
    public int jsGet_KEY_RIGHT() { return KeyEvent.VK_RIGHT; }
    public int jsGet_KEY_UP() { return KeyEvent.VK_UP; }
    public int jsGet_KEY_1() { return KeyEvent.VK_SPACE; }

    public int jsGet_pointerX() { return this.pointerX; }
    public int jsGet_pointerY() { return this.pointerY; }

    public boolean jsFunction_isKeyDown(int keyCode) {
        return Boolean.TRUE.equals(this.keysDown.get(keyCode));
    }

    /**
     * Attaches a Function to one of the specified "events" that Input fires.
     * The same handler can be added multiple times to an event.
     * @param eventName
     * @param handler
     * @return
     */
    public Input jsFunction_observe(String eventName, Function handler) {
        if (!this.observers.containsKey(eventName))
            return this;

        CopyOnWriteArrayList<Function> handlers = this.observers.get(eventName);
        handlers.add(handler);
        return this;
    }

    /**
     * Removes the Function from the <var>eventName</var> as a handler.
     * @param eventName
     * @param handler
     * @return
     */
    public Input jsFunction_stopObserving(String eventName, Function handler) {
        if (!this.observers.containsKey(eventName))
            return this;

        CopyOnWriteArrayList<Function> handlers = this.observers.get(eventName);
        handlers.remove(handler);
        return this;
    }

    // KeyListener Implementation //////////////////////////////////////////////
    public void keyPressed(KeyEvent e) {
        // Java fires the keyPressed event multiple times if the key is held.
        // This if statement ensures that the event is only passed once to SGF
        if (Boolean.TRUE.equals(this.keysDown.get(e.getKeyCode()))) return;

        this.keysDown.put(e.getKeyCode(), Boolean.TRUE);

        Context cx = Context.enter();
        try {
            Scriptable arg = cx.newObject(this);
            arg.put("keyCode", arg, e.getKeyCode());
            for (Function func : this.observers.get("keydown")) {
                func.call(cx, func, func, new Object[] { arg });
            }
        } finally {
            Context.exit();
        }
    }

    public void keyReleased(KeyEvent e) {
        this.keysDown.put(e.getKeyCode(), Boolean.FALSE);
        Context cx = Context.enter();
        try {
            Scriptable arg = cx.newObject(this);
            arg.put("keyCode", arg, e.getKeyCode());
            for (Function func : this.observers.get("keyup")) {
                func.call(cx, func, func, new Object[] { arg });
            }
        } finally {
            Context.exit();
        }
    }

    // MouseListener Implementation ////////////////////////////////////////////
    public void mousePressed(MouseEvent e) {
        this.pointerX = e.getX();
        this.pointerY = e.getY();
        Context cx = Context.enter();
        try {
            Scriptable arg = cx.newObject(this);
            arg.put("x", arg, this.pointerX);
            arg.put("y", arg, this.pointerY);
            for (Function func : this.observers.get("mousedown")) {
                func.call(cx, func, func, new Object[] { arg });
            }
        } finally {
            Context.exit();
        }
    }

    public void mouseReleased(MouseEvent e) {
        //System.out.println(e.getButton() + ": Released");
    }

    // MouseMotionListener /////////////////////////////////////////////////////
    public void mouseMoved(MouseEvent e) {
        this.pointerX = e.getX();
        this.pointerY = e.getY();
        Context cx = Context.enter();
        try {
            Scriptable arg = cx.newObject(this);
            arg.put("x", arg, this.pointerX);
            arg.put("y", arg, this.pointerY);
            for (Function func : this.observers.get("mousemove")) {
                func.call(cx, func, func, new Object[] { arg });
            }
        } finally {
            Context.exit();
        }
    }
    public void mouseDragged(MouseEvent e) {
        mouseMoved(e);
    }

    // Unused //////////////////////////////////////////////////////////////////
    public void keyTyped(KeyEvent e) {}
    public void mouseClicked(MouseEvent e) {}
    public void mouseEntered(MouseEvent e) {}
    public void mouseExited(MouseEvent e) {}
}
