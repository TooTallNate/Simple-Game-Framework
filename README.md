Simple Game Framework
=====================

#### An object-oriented JavaScript framework to develop simple, shape and sprite based games ####

`Simple Game Framework`, or `SGF` for short, is an abstract JavaScript
based API to develop retro 2D shape and sprite based games. The idea is that
the game developer writes games using one code base, written in JavaScript,
and incorporating the SGF API. That code base can then be deployed to any
number of SGF game engine clients.

Game Engine Clients
-------------------

### Currently Being Developed ###

 * `HTML/DOM`: An engine that uses web browsers' native JavaScript engine
   to execute the game code, and the API manipulates DOM nodes to "render"
   your game. The HTML/DOM game engine can be found in `src/html/engine`.

 * `Java`: In conjunction with [Rhino](http://www.mozilla.org/rhino/), Java
   interprets your JavaScript game code, and uses Java2D or JOGL to render the
   game. The current version found in `src/java/src` uses Java2D to render
   SGF games.


### Future Thoughts ###

 * `iPhone/iPad/iPod Touch`: A game engine for Apple's line of hardware is
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

 * `Any other language that has a JavaScript Interpreter`: In theory,
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

You can view the full [Simple Game Framework API Docs](http://tootallnate.github.com/Simple-Game-Framework/doc/)
to learn it all!

Additional Links
----------------

 * ["Simple Game Framework" Google Group](http://groups.google.com/group/simple-game-framework) - A Google Group dedicated to discussion of SGF game (or engine) development.
 * [GitHub SGF Wiki](http://wiki.github.com/TooTallNate/Simple-Game-Framework) - The official Wiki for SGF, with community written guides/tutorials and good-to-know SGF info.


License
-------

SGF itself isn't really a code base, more like a concept or abstraction.
If you know Java, then SGF itself is an abstract class, and all the game
engine clients are the concrete implementations. As such, it doesn't really
make sense to license SGF itself, but rather each game engine client should
specify a license for its own code.

Furthermore, every game that is written with the SGF API and released to
the masses should specify its own license. This is more related to software
development in general, and not specifically SGF.
