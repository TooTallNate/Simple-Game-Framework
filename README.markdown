Simple Game Framework
=====================

#### An object-oriented JavaScript framework to develop simple, shape and sprite based games ####

`Simple Game Framework`, or `SGF` for short, aims to be an abstract JavaScript
based API to develop 2D shape and/or sprite based games. The idea is that
the game developer writes games using one code base, written in JavaScript,
and incorporating the SGF API. That code base can then be deployed to any
number of SGF game engine clients.

Game Engine Clients
-------------------

### Currently Being Developed ###

 * `HTML/DOM`: An engine that uses web browsers' native JavaScript engine
   to execute the game code, and the API manipulates DOM nodes and to
   "render" your game. The HTML/DOM game engine can be found in `src/html/engine`.

 * `Java`: In conjunction with Rhino (<http://www.mozilla.org/rhino/>), Java
   can interprit your SGF game code, and use Java2D or JOGL to render the
   game. The current version found in `src/java/src` uses Java2D to render
   SGF games.


### Future Thoughts ###

 * `C or C++ Based Player`: For a pure speed solution, there could be a
   SGF game engine written in C or C++, and using V8/Nitro/SpiderMonkey to
   interprit game code. This would be the fastest version of the game
   engine. However, I (TooTallNate) have never programmed in C++, let alone
   developed games, so I probably won't be touching this one.

 * `HTML/Canvas2D`: Using a lot of the same code as the `HTML/DOM` client, and
   rewriting the rendering code, we could create a client the renders to a
   `<canvas>` element using the 2D context. This would probably be slower than
   the `HTML/DOM` version, but I might make it at some point for demonstration
   purposes.

 * `HTML/WebGL`: For probably the best speed in the web browser, we could create
   a client that renders the game using the draft WebGL. I've never touched
   OpenGL, but might look into this one once WebGL is more standard.

 * `Flash`: A Flash engine could be written that (theoretically) uses
   ExternalInterface to communicate your game code with the Flash based
   rendering engine. This is only an idea though, and the lag between
   JavaScript and ExternalInterface might make this impossible. Either way,
   I (TooTallNate), know nothing about Flash development, and will never be
   making a Flash version of the game engine. It's just a theory. Somebody
   else is welcome to take a stab at it though!

 * `Any other language that has a JavaScript Interpreter`: In theory,
   your game written using the SGF API is reusable anywhere that JavaScript
   can be implemented! That's the beauty of developing your game in an
   interpreted language. (I'm thinking PSP, Android, iPhone, who knows!)

Game Development
----------------

A good supply of example games ranging from really simple, to show the basics
of the API, to more complex, to show off the power of JavaScript and the SGF
API itself. The example games can be found in the `examples/` folder.

An SGF game starts with a folder with a `main.js` file inside. `main.js` is
the first file loaded when your game starts. That is the only requirement to
create an SGF game.

Additional game resources like more `*.js` files, image and sound files can
be placed inside that same folder, or any number of folders inside your root
game folder (the folder where `main.js` is located).

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
