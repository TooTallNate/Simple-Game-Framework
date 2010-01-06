package com.simplegameframework.engine;

import java.awt.event.KeyEvent;
import java.awt.event.KeyListener;
import java.awt.event.MouseEvent;
import java.awt.event.MouseListener;
import java.awt.event.MouseMotionListener;
import java.util.HashMap;
import java.util.Vector;
import org.mozilla.javascript.Function;
import org.mozilla.javascript.ScriptableObject;

public class Input extends ScriptableObject implements KeyListener, MouseListener, MouseMotionListener {


    private HashMap<Integer, Boolean> keysDown;
    private HashMap<String, Vector<Function>> observers;
    private int pointerX;
    private int pointerY;

    public Input() {
        this.keysDown = new HashMap<Integer, Boolean>();
        this.observers = new HashMap<String, Vector<Function>>();
        for (String s : new String[] { "mousemove", "mouseup", "mousedown",
                            "keydown", "keyup" }) {
            this.observers.put(s, new Vector<Function>());
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

    public int jsGet_pointerX() { return this.pointerX; }
    public int jsGet_pointerY() { return this.pointerY; }

    public boolean jsFunction_isKeyDown(int keyCode) {
        return this.keysDown.get(keyCode) == Boolean.TRUE;
    }

    /**
     * Attaches a Function to one of the specified "events" that Input fires.
     * The same handler can be added multiple times to an event.
     * @param eventName
     * @param handler
     */
    public void jsFunction_observe(String eventName, Function handler) {
        if (!this.observers.containsKey(eventName)) return;

        Vector<Function> handlers = this.observers.get(eventName);
        handlers.add(handler);
    }

    // KeyListener Implementation //////////////////////////////////////////////
    public void keyPressed(KeyEvent e) {
        // Java fires the keyPressed event multiple times if the key is held.
        // This if statement ensures that the event is only passed once to SGF
        if (Boolean.TRUE.equals(this.keysDown.get(e.getKeyCode()))) return;

        this.keysDown.put(e.getKeyCode(), Boolean.TRUE);
    }

    public void keyReleased(KeyEvent e) {
        this.keysDown.put(e.getKeyCode(), Boolean.FALSE);
    }

    // MouseListener Implementation ////////////////////////////////////////////
    public void mousePressed(MouseEvent e) {
        //System.out.println(e.getButton() + ": Pressed");
    }

    public void mouseReleased(MouseEvent e) {
        //System.out.println(e.getButton() + ": Released");
    }

    // MouseMotionListener /////////////////////////////////////////////////////
    public void mouseMoved(MouseEvent e) {
        mouseMove(e);
    }
    public void mouseDragged(MouseEvent e) {
        mouseMove(e);
    }

    private void mouseMove(MouseEvent e) {
        this.pointerX = e.getX();
        this.pointerY = e.getY();

    }

    // Unused //////////////////////////////////////////////////////////////////
    public void keyTyped(KeyEvent e) {}
    public void mouseClicked(MouseEvent e) {}
    public void mouseEntered(MouseEvent e) {}
    public void mouseExited(MouseEvent e) {}
}