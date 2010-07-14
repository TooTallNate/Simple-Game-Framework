Simple Game Framework
=====================
Java Engine
-----------

The `Java Engine` is a J2SE compliant implementation of SGF. The game engine
comes packaged with a simple `JFrame` game launcher which can be used throughout
game development and to play around with the demos. For deployment, you can
invoke the game engine with your game resources via a simple Java API. A
`Canvas` subclass is provided as the game screen, for you to append to any
AWT `Container` you like.

The current implementation uses standard Java2D to render SGF games to a Java
`Canvas`, which has proven to be plenty fast for the kind of games SGF is
capable of. However, a faster [JOGL](http://en.wikipedia.org/wiki/Java_OpenGL)
mode could be added down the road if necessary.


### Deploying My Game ###

Deploying your SGF game via the `Java Engine` requires you to create a
`com.simplegameframework.engine.Player` instance with a URL to
your game resources. That instance is a `Canvas` subclass, and can be inserted
into any standard AWT `Container` that you choose.

There is a simple Java-based API for starting up and interacting with your
SGF game from Java code. See the `examples/` directory for some ideas.

Here's a minimal example, you'll no doubt require more customization:

    import com.simplegameframework.engine.Player;
    import java.net.URL;
    import javax.swing.JFrame;
    
    public class MyGame {
        public static void main(String[] args) {
            // First instantiate the SGF "Player" instance, specifying the
            // location of a game (here we use one of the public demo games)
            URL gameRoot = new URL("http://www.simplegameframework.com/demos/sprite-follow-mouse");
            Player myGame = new Player(gameRoot);

            // Create the AWT Container
            JFrame frame = new JFrame();
            frame.setSize(640, 480);
            frame.add(myGame);
            
            // Make the Frame visible, and start the game engine
            frame.setVisible(true);
            myGame.start();
        }
    }

All the JAR files found in the `dist` directory need to be in your _classpath_.
Running this example would create a very barebones JFrame that loads the
publicly hosted demo game `sprite-follow-mouse`. The URL can be any valid Java
URL, more likely being a `file://` URL relative to your current path, performing
file operations instead of over HTTP.

You will no doubt want to make more modifications to the Container, like possibly
add a menu with options. You can even pass an external menu item click event
into your game environment with `Player`'s message-passing capabilities (see
`Player#sendMessage` and `Game`'s "message" event).


### Build `SGF.jar` ###

To build the `dist/SGF.jar` file from source, you must have:

 - Node.js to interpret the `compile` script.
 - `javac` and `jar` commands from the Java SDK.

Once the dependencies are met, simply run:

    ./compile

The `dist/SGF.jar` file contains the SGF `Java Engine` in its entirety. A
general purpose SGF game launcher, meant for development and testing gets run
if the JAR is executed.
