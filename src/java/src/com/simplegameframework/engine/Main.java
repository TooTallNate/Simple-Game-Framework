package com.simplegameframework.engine;

import com.simplegameframework.networking.*;
import java.awt.Dimension;
import java.awt.Toolkit;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.KeyEvent;
import java.awt.event.WindowEvent;
import java.awt.event.WindowListener;
import java.io.File;
import java.io.InputStreamReader;
import java.net.URL;
import javax.swing.JFileChooser;
import javax.swing.JFrame;
import javax.swing.JMenu;
import javax.swing.JMenuBar;
import javax.swing.JMenuItem;
import javax.swing.KeyStroke;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.FunctionObject;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;

/**
 * <tt>Main</tt> is just a <tt>javax.swing.JFrame</tt> subclass that holds
 * a {@link Screen}, as well as some common controls in the menu bar.
 * @author Nathan Rajlich
 */
public class Main extends JFrame implements ActionListener, WindowListener {

    /**
     * The global, shared JavaScript scope. It's a singleton, just like the
     * scope of a single web page would be.
     */
    private Scriptable globalScope;
    private Scriptable sgfObj;

    private Game currentGame;
    private Screen screen;
    private ScriptableScreen scriptableScreen;
    private Input input;

    private JMenuBar menu;
    private JMenu fileMenu;
    private JMenuItem loadGameMenuItem;
    private JMenuItem closeMenuItem;

    /**
     *
     * @param args
     */
    public Main(String[] args) {
        this.input = new Input();

        this.addWindowListener(this);

        this.menu = new JMenuBar();
        this.fileMenu = new JMenu("File");
        this.menu.add(this.fileMenu);

        this.loadGameMenuItem = new JMenuItem("Load Game...");
        this.loadGameMenuItem.setAccelerator(KeyStroke.getKeyStroke(KeyEvent.VK_O, Toolkit.getDefaultToolkit().getMenuShortcutKeyMask()));
        this.loadGameMenuItem.addActionListener(this);
        this.fileMenu.add(this.loadGameMenuItem);

        this.closeMenuItem = new JMenuItem("Close");
        this.closeMenuItem.setAccelerator(KeyStroke.getKeyStroke(KeyEvent.VK_Q, Toolkit.getDefaultToolkit().getMenuShortcutKeyMask()));
        this.closeMenuItem.addActionListener(this);
        this.fileMenu.add(this.closeMenuItem);

        this.setJMenuBar(this.menu);

        this.setVisible(true);
        this.screen = new Screen(this.getContentPane());
        this.screen.setPreferredSize(new Dimension(400,300));
        this.pack();
        this.screen.requestFocus();

        initJavaScriptEngine();
    }

    private void initJavaScriptEngine() {
        Context cx = Context.enter();
        try {
            cx.setOptimizationLevel(9);
            this.globalScope = cx.initStandardObjects();

            // Load the Prototype lang extensions
            URL resource = this.getClass().getResource("js/prototype_lang.js");
            cx.evaluateReader(this.globalScope, new InputStreamReader(resource.openStream()), resource.getFile(), 1, null);

            // Create an empty "SGF" JavaScript Object, add it to the global scope
            this.sgfObj = cx.newObject(this.globalScope);
            this.globalScope.put("SGF", this.globalScope, this.sgfObj);

            try {
                FunctionObject log = new FunctionObject("log", Log.class.getMethod("logFunction", new Class[]{Object.class}), this.sgfObj);
                this.sgfObj.put("log", this.sgfObj, log);
            } catch (Exception ex) {
                ex.printStackTrace();
            }


            // Add SGF.Input
            String inputStr = "Input";
            ScriptableObject.defineClass(this.globalScope, Input.class);
            this.input = (Input)cx.newObject(this.globalScope, inputStr);
            this.globalScope.put(inputStr, this.sgfObj, this.input);
            this.screen.setInput(this.input);
            this.globalScope.delete(inputStr);

            // Add SGF.Game
            //ScriptableObject.defineClass(this.sgfObj, Game.class);
            Scriptable game = cx.newObject(this.globalScope);
            this.sgfObj.put("Game", this.sgfObj, game);

            // Add SGF.Screen
            inputStr = "ScriptableScreen";
            ScriptableObject.defineClass(this.globalScope, ScriptableScreen.class);
            this.scriptableScreen = (ScriptableScreen)cx.newObject(this.globalScope, inputStr);
            this.globalScope.put("Screen", this.sgfObj, this.scriptableScreen);
            this.scriptableScreen.setScreen(this.screen);
            this.globalScope.delete(inputStr);



            // Add SGF.Component
            resource = this.getClass().getResource("js/SGF.Component.js");
            cx.evaluateReader(this.globalScope, new InputStreamReader(resource.openStream()), resource.getFile(), 1, null);

            // Add SGF.Container
            resource = this.getClass().getResource("js/SGF.Container.js");
            cx.evaluateReader(this.globalScope, new InputStreamReader(resource.openStream()), resource.getFile(), 1, null);

            // Add SGF.Shape
            resource = this.getClass().getResource("js/SGF.Shape.js");
            cx.evaluateReader(this.globalScope, new InputStreamReader(resource.openStream()), resource.getFile(), 1, null);

            // Add SGF.Rectangle
            resource = this.getClass().getResource("js/SGF.Rectangle.js");
            cx.evaluateReader(this.globalScope, new InputStreamReader(resource.openStream()), resource.getFile(), 1, null);

            // Add SGF.Sprite
            resource = this.getClass().getResource("js/SGF.Sprite.js");
            cx.evaluateReader(this.globalScope, new InputStreamReader(resource.openStream()), resource.getFile(), 1, null);

            // Add SGF.Server
            resource = this.getClass().getResource("js/SGF.Server.js");
            cx.evaluateReader(this.globalScope, new InputStreamReader(resource.openStream()), resource.getFile(), 1, null);

            // Add SGF.Client
            resource = this.getClass().getResource("js/SGF.Client.js");
            cx.evaluateReader(this.globalScope, new InputStreamReader(resource.openStream()), resource.getFile(), 1, null);

            // Add SGF.Spriteset
            ScriptableObject.defineClass(this.sgfObj, Spriteset.class);

        } catch(Exception ex) {
            ex.printStackTrace();
        } finally {
            Context.exit();
        }
    }

    private void loadGame(File root) {
        if (this.currentGame != null) {
            this.currentGame.stop();
        }

        this.currentGame = new Game(root, this.globalScope, this.screen);
        this.currentGame.start();
    }

    public void actionPerformed(ActionEvent e) {
        Object source = e.getSource();
        if (source == this.loadGameMenuItem) {
            JFileChooser fc = new JFileChooser();
            fc.setAcceptAllFileFilterUsed(true);
            fc.setFileSelectionMode(JFileChooser.DIRECTORIES_ONLY);
            if (JFileChooser.APPROVE_OPTION == fc.showOpenDialog(this)) {
                loadGame(fc.getSelectedFile());
            }
        } else if (source == this.closeMenuItem) {
            this.getToolkit().getSystemEventQueue().postEvent(
                new java.awt.event.WindowEvent(
                    this,
                    java.awt.event.WindowEvent.WINDOW_CLOSING
                )
            );
        }
    }

    public void windowOpened(WindowEvent e) {
    }

    public void windowClosing(WindowEvent e) {
        if (this.currentGame != null) {
            this.currentGame.stop();
        }
        this.dispose();
    }

    public void windowClosed(WindowEvent e) {
    }

    public void windowIconified(WindowEvent e) {
    }

    public void windowDeiconified(WindowEvent e) {
    }

    public void windowActivated(WindowEvent e) {
    }

    public void windowDeactivated(WindowEvent e) {
    }

    /**
     * Main driver.
     * @param args Arguments.
     */
    public static void main(final String[] args) {
        java.awt.EventQueue.invokeLater(new Runnable() {
            public void run() {
                Main m = new Main(args);
                if (args.length >= 1) {
                    File loadGame = new File(args[0]);
                    if (loadGame.exists())
                        m.loadGame(loadGame);
                }
            }
        });
    }
}