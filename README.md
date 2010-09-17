Simple Game Framework
=====================

#### An object-oriented JavaScript framework to develop simple, shape and sprite based games

`Simple Game Framework`, or `SGF` for short, is an abstract JavaScript
based API to develop, well, _simple_ 2D shape and sprite based games. It's
a "specification", if you will... The idea is that the game developer (you)
writes games using one code base, written in JavaScript, and incorporating
the `SGF` API. That code base can then be deployed to any number of SGF game
engine implementations.

This repository contains the "specification" itself, not any implementation:

 * Contains the Markdown files that define the SGF "specification".
 * Contains helper scripts to generate the spec into "html" and
   "roff" (man) formats.
 * Contains the [www.simplegameframework.com](http://www.simplegameframework.com)
   HTML files.
 * Contains `example` games written using the SGF API, that can be used to
   try out SGF itself, or when creating an SGF engine implementation, etc.


Game Engines
------------

### Official Implementations:

 * [`SGF-HTML-Engine`: Uses the browsers' native JavaScript engine to execute
   your game code, and manipulates DOM nodes to "render" your
   game.](http://github.com/TooTallNate/SGF-HTML-Engine)

 * [`SGF-Java-Engine`: Java interprets your JavaScript game code, and uses Java2D
   to render your SGF games.](http://github.com/TooTallNate/SGF-Java-Engine)


### Possibilities:

 * `C or C++ Based Engine`: For a pure speed solution, there could be a
   SGF game engine written in C++. It could use V8 to interpret game code,
   SDL to implement the SGF APIs, and GTK+ to use as a GUI. This would be the
   fastest version of an SGF game engine, by far.

 * `iOS Engine`: Apple allows JavaScript code to be downloaded and executed in
   a native app as long as it's running through a WebKit instance.
   The plan would be to render the game through Objective-C and OpenGL ES, and
   execute your game code through a WebKit instance inside a native app.
   
 * `Android Engine`: Native Android apps can also contain a WebKit instance,
   which would execute game code, and render to the device screen through OpenGL
   ES and Dalvik. In principal, the Android engine would be very similar to the
   iOS engine.

 * `Any other platform with a JavaScript Interpreter`: In theory,
   your game written using the SGF API is reusable anywhere that JavaScript
   can be implemented! That's the beauty of developing your game in an
   interpreted language.


Game Development
----------------

A good supply of example games ranging from really simple, to show the basics
of the API, to more complex, to show off the power of JavaScript and the SGF
API itself can be found in the `examples` folder.

An SGF game starts with a folder with a `main.js` file inside. `main.js` is
the first file loaded when your game starts. That is the only requirement to
create an SGF game.

Additional game resources like additional `*.js` files, images and sound files
can be placed inside that same folder, or any number of folders inside your
root game folder (the folder where `main.js` is located).

You can view the full [Simple Game Framework API Docs](http://api.simplegameframework.com)
to learn it all!


Additional Links
----------------

 * ["Simple Game Framework" Google Group](http://groups.google.com/group/simple-game-framework) - The official mailing list  dedicated to discussion of SGF game and engine development.
 * [GitHub SGF Wiki](http://wiki.github.com/TooTallNate/Simple-Game-Framework) - The official Wiki for SGF, with community written guides/tutorials/examples and good-to-know SGF info.
