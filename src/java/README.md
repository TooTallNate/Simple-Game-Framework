Simple Game Framework
=====================
Java Engine
-----------

The `Java` engine is a J2SE compliant implementation of SGF. Currently the
game engine can be loaded through a `JFrame`, and SGF games can be played on
the desktop. In the future, a `JApplet` version is planned, for web deployment
(if for some reason the HTML client isn't good enough).

The current implementation uses standard Java2D to render SGF games to a Java
`Canvas`, which has proven to be plenty fast for the kind of games SGF is
capable of. However, a faster [JOGL](http://en.wikipedia.org/wiki/Java_OpenGL)
version could be created.


### Deploying My Game ###

Deploying your SGF game requires requires [Apache Ant](http://ant.apache.org/)
to be installed on your computer. Once installed, you can build a custom
`Java` engine JAR file bundled with your game source code via:

    ant -Dpath=%path% deploy

Where *%path%* is the path to your root game folder. Your game code and
resources will then be included inside the resulting JAR, and will be
automatically loaded when the engine is initialized.


### Generic Build ###

Building the source requires [Apache Ant](http://ant.apache.org/) to be
installed. All you need to do is type:

    ant

in this directory to build a generic executable `JFrame` JAR file named
`SGF.jar`, which can be used to launch SGF sample games, or used throughout
development of your game before deployment.
