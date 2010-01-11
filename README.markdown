Simple Game Framework
=====================

#### An object-oriented JavaScript framework to develop simple, shape and sprite based games ####

`Simple Game Framework`, or SGF for short, aims to be an abstract JavaScript
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


SGF itself is licensed under an MIT license.

