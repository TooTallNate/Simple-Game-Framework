package com.simplegameframework.engine;

import java.awt.GraphicsEnvironment;
import java.awt.Image;
import java.awt.Toolkit;
import java.awt.Transparency;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.image.BufferedImage;
import java.awt.image.ImageObserver;
import java.io.IOException;
import java.net.URL;
import java.util.ArrayList;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Function;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;

/**
 * Implementation of the SGF.Spriteset class. 
 * @author Nathan Rajlich
 */
public class Spriteset extends ScriptableObject implements ImageObserver, ActionListener {

    /**
     * The image data for this <tt>Spriteset</tt>.
     */
    private Image image;
    /**
     * The URL to the Image.
     */
    private URL url;
    /**
     * Boolean indicating whether or not the Spriteset is fully loaded into memory.
     */
    private boolean loaded;
    /**
     * The pixel width of each sprite on the Spriteset.
     */
    private int spriteWidth;
    /**
     * The pixel height of each sprite on the Spriteset.
     */
    private int spriteHeight;
    /**
     * ArrayList that contains the load listeners for this spriteset. In the game
     * engine, the only ActionListener will be the Spriteset instance itself, which
     * in turn calls all the 'loadObserver' functions in the game environment.
     *
     * But Spritesets are also used in the editors, and we can have any number
     * of ActionListeners waiting for the load event in that case.
     */
    private ArrayList<ActionListener> loadListeners;
    /**
     * During gameplay, this ArrayList will be filled with the JavaScript
     * functions that should be called when the Spriteset finished loading.
     */
    private ArrayList<Function> loadObservers;

    public Spriteset() {
        this.loaded = false;
        this.loadListeners = new ArrayList<ActionListener>();
        this.loadObservers = new ArrayList<Function>();
    }
    public static Scriptable jsConstructor(Context cx, Object[] args,
                                       Function ctorObj,
                                       boolean inNewExpr) {

        // First, we need to get the currenly loaded game, so we can figure
        // out where the path of this image is.
        Scriptable global = ScriptableObject.getTopLevelScope(ctorObj);
        Scriptable sgf = (Scriptable)global.get("SGF", global);
        Scriptable game = (Scriptable)sgf.get("Game", sgf);
        Game curGame = (Game)game.get("current", game);

        // Create the 'Spriteset' object, load the image, set width & height
        Spriteset s = new Spriteset();
        s.addActionListener(s);
        s.loadImage(curGame.getRoot(), Context.toString(args[0]));
        s.jsSet_spriteWidth((int)Context.toNumber(args[1]));
        s.jsSet_spriteHeight((int)Context.toNumber(args[2]));
        return s;
    }


    public void loadImage(URL gameRoot, String relativePath) {
        try {
            this.url = new URL(gameRoot, relativePath);
        } catch (IOException ex) {
            ex.printStackTrace();
        }

        // Create the 'Image' object. This doesn't begin loading from the source.
        this.image = Toolkit.getDefaultToolkit().createImage(url);
        // A call to 'getWidth' begins non-blocking loading of URL.
        this.image.getWidth(this);
    }

    public Image getImage() {
        return this.image;
    }

    public URL getURL() {
        return this.url;
    }

    public boolean isLoaded() {
        return this.loaded;
    }

    public boolean imageUpdate(Image img, int infoflags, int x, int y, int width, int height) {
        if (infoflags != ALLBITS) {
            // 'true' to continue loading image in the background
            return true;
        } else {
            // Image has finished loading, call 'imageLoaded' and return 'false'
            imageLoaded();
            return false;
        }
    }

    private void imageLoaded() {
        int width = this.image.getWidth(null);
        int height = this.image.getHeight(null);

        BufferedImage compatImage = GraphicsEnvironment.getLocalGraphicsEnvironment().getDefaultScreenDevice().getDefaultConfiguration().createCompatibleImage(width, height, Transparency.TRANSLUCENT);
        compatImage.createGraphics().drawImage(image, 0, 0, null);
        this.image.flush();
        this.image = compatImage;
        this.loaded = true;

        for (ActionListener listener : this.loadListeners) {
            listener.actionPerformed(new ActionEvent(this, 0, "loaded"));
        }
    }

    public void addActionListener(ActionListener al) {
        this.loadListeners.add(al);
    }

    public void removeActionListener(ActionListener al) {
        this.loadListeners.remove(al);
    }

    // <editor-fold defaultstate="collapsed" desc="ScriptableObject Methods">
    @Override
    public String getClassName() {
        return "Spriteset";
    }

    public Spriteset jsFunction_observe(String eventName, Function function) {
        if ("load".equals(eventName)) {
            this.loadObservers.add(function);
        } else {
            throw Context.reportRuntimeError(eventName + " is not a valid event name.");
        }
        return this;
    }

    public void jsSet_spriteWidth(int w) {
        this.spriteWidth = w;
    }

    public void jsSet_spriteHeight(int h) {
        this.spriteHeight = h;
    }

    public int jsGet_spriteWidth() {
        return this.spriteWidth;
    }

    public int jsGet_spriteHeight() {
        return this.spriteHeight;
    }

    public int jsGet_width() {
        return this.image.getWidth(null);
    }

    public int jsGet_height() {
        return this.image.getHeight(null);
    }

    public String jsGet_src() {
        return getURL().toString();
    }

    public boolean jsGet_loaded() {
        return isLoaded();
    }// </editor-fold>

    /**
     * When a SGF.Spriteset in created in game code, then the 'jsConstructor'
     * method adds the Spriteset instance itself as an ActionListener. This
     * method gets called when the Spriteset loads completely into memory.
     * It is responsible for calling all the functions that have been added
     * via `SGF.Spriteset#observe`.
     * @param e The ActionEvent instance
     */
    public void actionPerformed(ActionEvent e) {
        Context c = Context.enter();
        try {
            for (Function o : this.loadObservers) {
                o.call(c, o, this, new Object[] { this });
            }
        } catch (Exception ex) {
            ex.printStackTrace();
        } finally {
            Context.exit();
        }
    }

    /**
     * String representation of the Spriteset, for game debugging purposes.
     * @return A String representation of the Spriteset.
     */
    @Override
    public String toString() {
        return "[ SGF.Spriteset: src=" + jsGet_src() + ", loaded=" + jsGet_loaded() +
                ", width=" + jsGet_width() + ", height=" + jsGet_height() +
                ", spriteWidth=" + jsGet_spriteWidth() + ", spriteHeight=" +
                jsGet_spriteHeight() + " ]";
    }
}
