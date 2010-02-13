package com.simplegameframework.engine;

import java.awt.Graphics2D;
import java.io.InputStreamReader;
import java.net.URL;
import java.util.Arrays;
import java.util.Comparator;
import java.util.concurrent.CopyOnWriteArrayList;
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

    public static final Comparator<Component> Z_INDEX_COMPARATOR = new Comparator<Component>() {
        public int compare(Component o1, Component o2) {
            return o1.__getZIndex() - o2.__getZIndex();
        }
    };


    private static final int DEFAULT_GAME_SPEED = 30;
    private static final int DEFAULT_MAX_FRAME_SKIPS = 5;

    // Instance ////////////////////////////////////////////////////////////////
    /**
     * The screen the draw this game to in the game loop.
     */
    private Screen screen;
    /**
     * A <tt>URL</tt> object that represenets the folder where this game's
     * 'main.js' file (and rest of project) reside.
     */
    private final URL root;
    /**
     * A <tt>CopyOnWriteArrayList</tt> containing all the {@link Component}s
     * that this game should update/render in the game loop.
     */
    private final CopyOnWriteArrayList<Component> componentsArray;
    /**
     * The 'global' scope. Or "executing environment" that this <tt>Game</tt>
     * is running in.
     */
    private Scriptable globalScope;

    /**
     * The number of times "update()" will be attempted to be called per second
     * while the game is running.
     */
    private double gameSpeed; // Or Updates Per Second
    /**
     * The number of nanoseconds in between each call to "update()" this should
     * be equal to '1000000000 / this.gameSpeed'
     */
    private double period;
    /**
     * The maximum number of frames the engine is allowed to skip, or number
     * of times "update()" is allowed to be called without a call to "render()".
     */
    private int maxFrameSkips;
    /**
     * The value returned from System.nanoTime() when the game was first launched.
     */
    private long startTime;
    /**
     * The total number of times "update()" has been called in this game.
     */
    private long updateCount;
    /**
     * The total number of times "render()" has been called in this game.
     */
    private long renderCount;
    /**
     * Value that the game loop checks for before continuing it's execution.
     */
    private boolean running;
    /**
     * True if the "main.js" file and it's immediate dependencies have finished
     * loading, false otherwise.
     */
    private boolean loaded;
    /**
     * The <tt>Thread</tt> currently executing the game, or null if it isn't
     * running.
     */
    private Thread runner;

    // Constructors ////////////////////////////////////////////////////////////
    public Game(URL root, Scriptable globalScope, Screen screen) {

        // Set the scope, and place 'this' as SGF.Game.current
        this.globalScope = globalScope;
        Scriptable sgf = (Scriptable)globalScope.get("SGF", globalScope);
        Scriptable game = (Scriptable)sgf.get("Game", sgf);
        game.put("current", game, this);

        // Define the visible functions and properties on the "SGF.Game" object in JS
        Class<?> thisClass = this.getClass();
        this.defineFunctionProperties(new String[] {"addComponent", "removeComponent", "setGameSpeed", "loadScript"}, thisClass, PERMANENT);
        this.defineProperty("updateCount", thisClass, READONLY);
        this.defineProperty("renderCount", thisClass, READONLY);

        this.setScreen(screen);
        this.componentsArray = new CopyOnWriteArrayList<Component>();
        this.setGameSpeed(DEFAULT_GAME_SPEED);
        this.maxFrameSkips = DEFAULT_MAX_FRAME_SKIPS;
        this.running = this.loaded = false;
        this.root = root;
        
        try {
            this.loadMainScript();
        } catch (Exception ex) {
            ex.printStackTrace();
        }

        this.loaded = true;
    }

    // Scriptable Methods //////////////////////////////////////////////////////
    @Override
    public String getClassName() {
        return "Game";
    }

    /**
     * Adds the specified SGF.Component into the game loop.
     * @param o Expected to be an instance of SGF.Component.
     */
    public void addComponent(Scriptable o) {
        Object javaComponent = o.get("__component", o);
        if (javaComponent instanceof NativeJavaObject) {
            javaComponent = ((NativeJavaObject)javaComponent).unwrap();
            if (javaComponent instanceof Component) {
                this.componentsArray.add((Component)javaComponent);
                return;
            }
        }
        throw Context.reportRuntimeError(Context.toString(o) + " is not an instance of SGF.Component!");
    }

    /**
     * Removes the specified SGF.Component from the game loop.
     * @param o Expected to be an instance of SGF.Component.
     */
    public void removeComponent(Scriptable o) {
        Object javaComponent = o.get("__component", o);
        if (javaComponent instanceof NativeJavaObject) {
            javaComponent = ((NativeJavaObject)javaComponent).unwrap();
            if (javaComponent instanceof Component) {
                this.componentsArray.remove((Component)javaComponent);
                return;
            }
        }
        throw Context.reportRuntimeError(Context.toString(o) + " is not an instance of SGF.Component!");
    }

    public long getUpdateCount() {
        return this.updateCount;
    }

    public long getRenderCount() {
        return this.renderCount;
    }

    public void loadMainScript() throws Exception {
        Context c = Context.enter();
        try {
            URL scriptToLoad = new URL(this.root, "main.js");
            InputStreamReader r = new InputStreamReader(scriptToLoad.openStream());
            c.evaluateReader(this.globalScope, r, scriptToLoad.toString(), 1, null);
        } finally {
            Context.exit();
        }
    }

    public void loadScript(String name, Function onLoad) throws Exception {
        URL scriptToLoad = new URL(this.root, name);
        new ScriptLoader(this, this.globalScope, scriptToLoad, onLoad);
    }

    public void start() {
        if (!this.running) {
            this.runner = new Thread(this);
            this.runner.start();
        }
    }

    public URL getRoot() {
        return this.root;
    }

    public void setGameSpeed(double newGameSpeed) {
        this.gameSpeed = newGameSpeed;
        this.period = 1000000000d / newGameSpeed; // 1000000000 -> Nanoseconds Per Second
    }

    public void stop() {
        this.running = false;
        this.runner = null;
    }


    // java.lang.Runnable Implementation ///////////////////////////////////////
    /**
     * The main game loop.
     */
    public void run() {
        this.running = true;
        this.startTime = System.nanoTime();
        
        long nextGamePeriod = this.startTime;
        int loops;

        while (this.running) {

            // The first order of buisiness every time around the game loop is
            // to check if we need to execute any calls to 'update()'
            loops = 0;
            while (System.nanoTime() > nextGamePeriod && loops++ < this.maxFrameSkips) {
                update();
                nextGamePeriod += this.period;
            }
            //if (loops>1) System.out.println("Skipped " + loops + " frames");

            try {
                // Get the Graphics2D object we're going to draw onto
                Graphics2D g = (Graphics2D) screen.strategy.getDrawGraphics();
                //g.setRenderingHint(java.awt.RenderingHints.KEY_ANTIALIASING, java.awt.RenderingHints.VALUE_ANTIALIAS_ON);

                g.setColor(screen.getBackgroundColor());
                g.fillRect(0, 0, screen.getWidth(), screen.getHeight());

                // Render all Components. Taking the interpolation value into account
                render(g, (System.nanoTime() + this.period - nextGamePeriod) / this.period);

                // DEBUG
                /*
                g.setColor(java.awt.Color.white);
                g.setComposite(java.awt.AlphaComposite.getInstance(java.awt.AlphaComposite.SRC_OVER, 1f));
                double duration =  (double)System.nanoTime() - (double)this.startTime;
                g.drawString("FPS: " + (int)((double)this.renderCount/duration * 1000000000), 2, 15);
                g.drawString("UPS: " + (int)((double)this.updateCount/duration * 1000000000), 2, 30);
                g.drawString("Running Time: " + ((System.nanoTime() - this.startTime) / 1000000000), 2, 45);
                g.drawString("Frames Rendered: " + this.renderCount, 2, 60);
                g.drawString("Updates Processed: " + this.updateCount, 2, 75);
                g.drawString("# of Components: " + this.componentsArray.size(), 2, 90);
                */

                // Now that all rendering is done for this frame, dispose our
                // reference and show what was drawn on the 'screen'.
                g.dispose();
                screen.strategy.show();
            } catch (Exception ex) {
                ex.printStackTrace();
            }

            // Allow any starving Threads get some CPU time before continuing...
            Thread.yield();
        }
    }

    /**
     * Updates the state of the game once.
     */
    private void update() {
        for (Component c : componentsArray) {
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
        Component[] topLevelComponents = componentsArray.toArray(new Component[0]);
        Arrays.sort(topLevelComponents, Z_INDEX_COMPARATOR);

        for (Component c : topLevelComponents) {
            c.doRender(g, interpolation, this.renderCount);
        }
        this.renderCount++;
    }

    public void setScreen(Screen screen){
        this.screen = screen;
    }

    @Override
    public String toString() {
        return "[ SGF.Game " + this.root.toString() + " ]";
    }
}
