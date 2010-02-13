package com.simplegameframework.engine;

import java.io.ByteArrayInputStream;
import java.net.MalformedURLException;
import java.net.URL;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Function;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;

public class Font extends ScriptableObject {

    private java.awt.Font font;

    public Font() {
    }
    
    public static Scriptable jsConstructor(Context cx, Object[] args,
                                       Function ctorObj,
                                       boolean inNewExpr) {
        Font f = new Font();
        String font = cx.toString(args[0]);
        if (font.startsWith("data:font")) {
            byte[] fontBytes = org.apache.commons.codec.binary.Base64.decodeBase64(font.substring(font.indexOf(',')+1));
            try {
                f.setFont(java.awt.Font.createFont(java.awt.Font.TRUETYPE_FONT, new ByteArrayInputStream(fontBytes)));
            } catch (Exception ex) {
                ex.printStackTrace();
            }
        } else if (font.endsWith(".ttf")) {
            // First, we need to get the currenly loaded game, so we can figure
            // out where the path of this font is.
            Scriptable global = ScriptableObject.getTopLevelScope(ctorObj);
            Scriptable sgf = (Scriptable)global.get("SGF", global);
            Scriptable game = (Scriptable)sgf.get("Game", sgf);
            Game curGame = (Game)game.get("current", game);
            URL fontPath = null;
            try {
                fontPath = new URL(curGame.getRoot(), font);
            } catch (MalformedURLException ex) {
                ex.printStackTrace();
            }

            if (fontPath != null)
                try {
                f.setFont(java.awt.Font.createFont(java.awt.Font.TRUETYPE_FONT, fontPath.openStream()));
            } catch (Exception ex) {
                ex.printStackTrace();
            }
        } else {
            f.setFont(new java.awt.Font(font, java.awt.Font.PLAIN, 1));
        }
        return f;
    }

    private void setFont(java.awt.Font font) {
        this.font = font;
    }

    public java.awt.Font getFont() {
        return this.font;
    }

    public String getClassName() {
        return "Font";
    }
}
