package com.simplegameframework.engine;

import java.awt.GraphicsConfiguration;
import java.awt.GraphicsEnvironment;
import java.awt.Image;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import javax.imageio.ImageIO;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Function;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;

public class Spriteset extends ScriptableObject {

    /**
     * The image data for this <tt>Spriteset</tt>.
     */
    private Image image;
    private int spriteWidth;
    private int spriteHeight;


    public Spriteset() {}
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
        s.loadImage(curGame.getRoot(), Context.toString(args[0]));
        s.jsSet_spriteWidth((int)Context.toNumber(args[1]));
        s.jsSet_spriteHeight((int)Context.toNumber(args[2]));
        return s;
    }


    private void loadImage(File parentFolder, String fileName) {
        BufferedImage sourceImage = null;
        try {
            File img = new File(parentFolder + File.separator + fileName);

            // use ImageIO to read the image in
            sourceImage = ImageIO.read(img);
        } catch (IOException ex) {
            ex.printStackTrace();
        }

        // create an accelerated image of the right size to store our sprite in
        GraphicsConfiguration gc = GraphicsEnvironment.getLocalGraphicsEnvironment().getDefaultScreenDevice().getDefaultConfiguration();
        this.image = gc.createCompatibleImage(sourceImage.getWidth(), sourceImage.getHeight(), sourceImage.getTransparency());

        // draw our source image into the accelerated image
        this.image.getGraphics().drawImage(sourceImage,0,0,null);

    }

    protected Image getImage() {
        return this.image;
    }

    @Override
    public String getClassName() {
        return "Spriteset";
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

}
