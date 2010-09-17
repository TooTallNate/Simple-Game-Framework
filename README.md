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

 * `iOS`: A game engine for Apple's line of hardware is
   high on the list of future plans. Apple allows JavaScript code to be
   executed in a native app as long as it's running through a WebKit instance.
   The plan is to render the game through Objective-C and OpenGL ES, and
   execute your game code through a WebKit instance inside a native app. This
   strategy (similar to [PhoneGap](http://www.phonegap.com/)'s model) allows
   your SGF game to be accepted to the AppStore, even with Apple's revised
   4.0 SDK License Agreement!
   
 * `Android`: Native Android apps can also contain a WebKit instance, which
   will execute game code, and render to the device screen through OpenGL ES
   and Dalvik. In principal, the Android engine would be very similar to the
   Apple engine.

 * `HTML/Canvas2D`: Using a lot of the same code as the `HTML/DOM` client, and
   rewriting the rendering code, we could create a client the renders to a
   `<canvas>` element using the 2D context. This would probably be slower than
   the `HTML/DOM` version, but I might make it at some point for demonstration
   purposes.

 * `HTML/WebGL`: For probably the best speed in the web browser, we could
   create a client that renders the game using the draft WebGL. I've never
   touched OpenGL, but might look into this one once WebGL is more standard.

 * `C or C++ Based Player`: For a pure speed solution, there could be a
   SGF game engine written in C or C++, and using V8/Nitro/SpiderMonkey to
   interpret game code. This would be the fastest version of the game
   engine. However, I (TooTallNate) have never programmed in C++, let alone
   developed games, so I probably won't be touching this one.

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
