package com.simplegameframework.engine;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.ArrayList;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Function;
import org.mozilla.javascript.Scriptable;

public class ScriptLoader extends Thread {

    private final Game game;
    private final Scriptable global;
    private final URL url;
    private final Function onLoad;

    public ScriptLoader(Game game, Scriptable global, URL url, Function onLoad) {
        this.game = game;
        this.global = global;
        this.url = url;
        this.onLoad = onLoad;
        this.start();
    }

    @Override
    public void run() {
        //System.out.println(System.nanoTime() + ": Begin loading " + this.url);
        try {
            ArrayList<Integer> contents = new ArrayList<Integer>();
            InputStream openStream = this.url.openStream();
            int b;
            while ((b = openStream.read()) != -1) {
                contents.add(b);
            }

            byte[] contentsBytes = new byte[contents.size()];
            for (int i=0; i<contentsBytes.length; i++) {
                contentsBytes[i] = contents.get(i).byteValue();
            }

            //System.out.println(new String(contentsBytes));
            Context c = Context.enter();
            try {
                c.evaluateString(this.global, new String(contentsBytes), this.url.toString(), 1, null);
                this.onLoad.call(c, this.onLoad, this.game, new Object[] { this.url });
            } catch (Exception ex) {
                ex.printStackTrace();
            } finally {
                Context.exit();
            }

        } catch (IOException ex) {
            ex.printStackTrace();
        }
        //System.out.println(System.nanoTime() + ": Finished loading " + this.url);
    }
}