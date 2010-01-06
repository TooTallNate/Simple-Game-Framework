package com.simplegameframework.engine;

import java.awt.Color;
import java.awt.Graphics2D;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.Vector;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Function;
import org.mozilla.javascript.NativeJavaObject;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;

/**
 * Represents a single loaded game.
 * @author Nathan Rajlich
 */
public class Game extends ScriptableObject implements Runnable {



    // Instance ////////////////////////////////////////////////////////////////
    /**
     * The screen the draw this game to in the game loop.
     */
    private Screen screen;
    /**
     * A <tt>File</tt> object that represenets the folder where this game's
     * 'main.js' file (and rest of project) reside.
     */
    private File root;
    /**
     * A <tt>Vector</tt> containing all the {@link Component}s that this game
     * should update/render in the game loop.
     */
    private Vector<Component> componentsArray;
    private Scriptable globalScope;

    private double gameSpeed; // Or Updates Per Second
    private double period;
    private int maxFrameSkips;

    private long startTime;
    private long updateCount;
    private long renderCount;


    private boolean running;
    private boolean loaded;

    private Thread runner;

    // Constructors ////////////////////////////////////////////////////////////
    public Game(File root, Scriptable globalScope, Screen screen) {

        // Set the scope, and place 'this' as SGF.Game.current
        this.globalScope = globalScope;
        Scriptable sgf = (Scriptable)globalScope.get("SGF", globalScope);
        Scriptable game = (Scriptable)sgf.get("Game", sgf);
        game.put("current", game, this);


        this.defineFunctionProperties(new String[] {"addComponent", "removeComponent", "setGameSpeed"}, this.getClass(), PERMANENT);

        this.setScreen(screen);
        this.componentsArray = new Vector<Component>();
        this.setGameSpeed(30);
        this.maxFrameSkips = 5;
        this.running = this.loaded = false;
        this.root = root;
        
        try {
            this.jsFunction_loadScript("main.js", null);
        } catch (IOException ex) {
            ex.printStackTrace();
        }
    }

    // Scriptable Methods //////////////////////////////////////////////////////
    @Override
    public String getClassName() {
        return "Game";
    }

    public double jsGet_renderCount() {
        return this.renderCount;
    }

    public double jsGet_updateCount() {
        return this.updateCount;
    }

    public Object jsGet_components() {
        return this.componentsArray;
    }

    public String jsGet_root() {
        return this.root.toString();
    }

    public void addComponent(Scriptable o) {
        Object javaComponent = o.get("__component", o);
        if (javaComponent instanceof NativeJavaObject) {
            javaComponent = ((NativeJavaObject)javaComponent).unwrap();
            if (javaComponent instanceof Component) {
                this.componentsArray.add((Component)javaComponent);
                return;
            }
        }
        throw Context.reportRuntimeError("Object is not an instance of SGF.Component!");
    }

    public void removeComponent(Scriptable o) {
        Object javaComponent = o.get("__component", o);
        if (javaComponent instanceof NativeJavaObject) {
            javaComponent = ((NativeJavaObject)javaComponent).unwrap();
            if (javaComponent instanceof Component) {
                this.componentsArray.remove((Component)javaComponent);
                return;
            }
        }
        throw Context.reportRuntimeError("Object is not an instance of SGF.Component!");
    }

    public void jsFunction_loadScript(String name, Function loadedHandler) throws IOException {
        File fileToLoad = new File(this.root + File.separator + name);
        Context c = Context.getCurrentContext();
        //System.out.println(fileToLoad.toURI().toURL());
        InputStreamReader r = new InputStreamReader(fileToLoad.toURI().toURL().openStream());
        if (c == null) {
            c = Context.enter();
            try {
                c.evaluateReader(this.globalScope, r, fileToLoad.toString(), 1, null);
            } catch (Exception ex) {
                ex.printStackTrace();
            } finally {
                Context.exit();
            }
        } else {
            c.evaluateReader(this.globalScope, r, fileToLoad.toString(), 1, null);
        }
    }

    public void jsFunction_start() {
        if (!this.running) {
            this.runner = new Thread(this);
            this.runner.start();
        }
    }

    public void setGameSpeed(double newGameSpeed) {
        this.gameSpeed = newGameSpeed;
        this.period = 1000000000d / newGameSpeed; // 1000000000 -> Nanoseconds Per Second
    }

    public Game jsFunction_stop() {
        this.running = false;
        this.runner = null;
        //System.out.println(this + " stopped");
        return this;
    }


    // java.lang.Runnable Implementation ///////////////////////////////////////
    /**
     * The main game loop.
     */
    public void run() {
        this.running = true;
        this.startTime = System.nanoTime();
        long nextGamePeriod = this.startTime;
        double interpolation;
        int loops;

        while (this.running) {

            // The first order of buisiness every time around the game loop is
            // to check if we need to execute any calls to 'update()'
            loops = 0;
            while (System.nanoTime() > nextGamePeriod && loops < this.maxFrameSkips) {
                update();
                nextGamePeriod += this.period;
                loops++;
            }

            // Get the Graphics2D object we're going to draw onto
            Graphics2D g = (Graphics2D) screen.strategy.getDrawGraphics();
            g.setColor(Color.black);
            g.fillRect(0,0,this.screen.getWidth(), this.screen.getHeight());

            // Render all Components. Taking the interpolation value into account
            interpolation = (System.nanoTime() + this.period - nextGamePeriod) / this.period;
            render(g, interpolation);

            // DEBUG
            g.setColor(Color.white);
            double duration =  (double)System.nanoTime() - (double)this.startTime;
            g.drawString(String.valueOf((double)this.renderCount/duration * 1000000000), 0, 20);
            g.drawString(String.valueOf((double)this.updateCount/duration * 1000000000), 0, 50);
            g.drawString(String.valueOf((System.nanoTime() - this.startTime) / 1000000000), 0, 80);
            
            // Now that all rendering is done for this frame, dispose our
            // reference and show what was drawn on the 'screen'.
            g.dispose();
            screen.strategy.show();

            // Allow any other Threads awaiting execution to execute before continuing...
            Thread.yield();
        }
    }

    /**
     * Updates the state of the game once.
     */
    private void update() {
        for (Component c : this.componentsArray) {
            c.doUpdate(this.updateCount);
        }
        this.updateCount++;
    }

    /**
     * Renders the current state of the game onto the Graphics2D object passed.
     * @param g The Graphics2D object the draw onto.
     * @param interpolation The percentage in between the last frame and the
     *                      next frame that we are attempting to draw.
     */
    private void render(Graphics2D g, double interpolation) {
        for (Component c : this.componentsArray) {
            c.doRender(g, interpolation, this.renderCount);
        }
        this.renderCount++;
    }

    public void setScreen(Screen screen){
        this.screen = screen;
    }

    @Override
    public String toString() {
        return this.root.toString();
    }
}