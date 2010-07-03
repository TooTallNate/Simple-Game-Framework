Simple Game Framework
=====================
HTML Engine
-----------

The `HTML Engine` is an implementation of the `Simple Game Framework` designed
to work inside web browsers through the use of the browsers' native JavaScript
engines and render to a single container element on the page.

Some of the key features of using the `HTML Engine` are:

* Your SGF game can be immediately deployable to users without ever needing
  to download and install other than pointing to a URL.
* Is built using the latest HTML5 features like Audio and WebSockets. For the
  best browser compatibility, any HTML5 feature that is unsupported has an
  equivalent Flash fallback that kicks in completely automatically and transparently.
* Multiple rendering backends: browsers that support the full HTML5 Canvas
  API will be rendered using a `<canvas>` element. If Canvas isn't supported,
  your game will be rendered using regular DOM nodes (`<img>`, `<div>`,
  `<pre>`, etc.) for the best browser compatibility.
* Deployment of your game on a webpage is easy, and your game can be placed
  inside a `<div>` somewhere on the page and function well with other page
  content (almost like a Flash window). Alternatively you can make a page
  dedicated to your SGF game, in which case you can place your game directly
  inside the page's `<body>` for a _psuedo_-"full screen" effect.
* Your SGF game is fully ready for [Chrome OS](http://www.chromium.org/chromium-os).


### Deploying My Game ###

Implementing your SGF game on a webpage with the `HTML Engine` is as
simple as including a single `<script>` node somewhere on the page:

    <script type="text/javascript"
        src="http://engine.simplegameframework.com/SGF.js"
        data-game="MyFirstGame"
        data-screen="sgfDiv" >

So in this example, the `HTML Engine` will be loaded into the page and autoload
the SGF game named **MyFirstGame**, rendering in the `<div>` with **id** `sgfDiv`.
    
The first thing to mention is that the SGF `HTML Engine` is publicly hosted at
the URL:

    http://engine.simplegameframework.com/SGF.js

However this is merely a convenience, and if you would rather host the engine
with your game on your own server, it can be found in this repository.

Second thing to mention is that the `<script>` node loading the engine also
accepts optional [HTML5 data- attributes](http://ejohn.org/blog/html-5-data-attributes/),
at load-time parameters for the `HTML Engine`.

In the example above we specified `game` and `screen` parameters:

 - `game` specifies the location on the internet of the SGF game you want to
   load. In this case **MyFirstGame** would be relative to the current page.
   Absolute URLs are also allowed, just don't hotlink other sites' games
   against their will.
 - `screen` specifies the _id_ of the DOM node which the game should be rendered
   inside of. Any valid container element (_hasLayout_) should work. Omitting a
   `screen` parameter, but still supplying a `game` will render the game directly
   inside the page's `<body>`, removing everything that is already there.


### Securing My Game ###

The `HTML Engine` was designed to be as open as possible. Never being restricted
by the `Same Origin Policy` is a primary goal throughout development. This means that
one website could theoretically hotlink to another site's SGF game(s), probably even
against their will.

So what you do? There's no built in mechanism in the `HTML Engine` to prevent hotlinking,
therefore doing server-side checks before serving the content will likely be the most
secure. One way would be to check the HTTP `Referer` header, and ensure that it is
a page that you control, otherwise reject the connection. If you're using Apache,
the `.htaccess` file can do the trick nicely.

If you don't have that kind of control over your web server, then another possible way
of securing your game could be to do a location check in JavaScript at the start of
your game and redirect if it's not what you were expecting. Try sticking something
like this at the top of your `main.js`:

    // First ensure the browser is running in the HTML Engine
    if (location && location.href) {
        var expected = "http://www.mydomain.com/sgfGamePlayer/"
        if (location.href != expected) {
            // Uh oh, somebody is apparently hotlinking!
            // Let's redirect...
            location.href = expected;
        }
    }
    
There's no _"right"_ way to secure your SGF game, as there are many different
strategies that deal with hotlinking. Above are just two _possible_ ways of
attempting to secure your game.


### Browser Compatibility ###

The `HTML Engine` attempts to support the widest range of web browsers possible,
depending on the browser's capabilities. 


