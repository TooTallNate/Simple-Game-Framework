Simple Game Framework
=====================
HTML/DOM Engine
---------------

The `HTML/DOM` engine is an SGF implementation designed to work inside web
browsers through the use of the browsers' native JavaScript engines and
Document Object Model.

Some of the key features of using the `HTML/DOM` engine are:

* Your SGF game can be immediately deployable to users without ever needing
  to download and install other than pointing to a URL.
* Depends on newer HTML5 features like audio and WebSocket when available
  (entirely Flashless). However for best browser compatibility, support will
  fallback to a Flash implementation if the user is using an older browser.
* Your SGF game is fully ready for [Chrome OS](http://www.chromium.org/chromium-os).
* Deployment of your game on a webpage is easy, and your game can be placed
  inside a `<div>` somewhere on the page and function well with other page
  content (almost like a Flash window). Alternatively you can make a page
  dedicated to your SGF game, in which case you can place your game directly
  inside the page's `<body>` for a psuedo-"full screen" effect.


### Deploying My Game ###

Implementing your SGF game on a webpage through the `HTML/DOM` engine is as
simple as including a single `<script>` node somewhere on the page:

    <script src="engine/SimpleGameFramework.js?game=MyFirstGame&screen=sgfDiv&debug=true" type="text/javascript">

So in this example, the `HTML/DOM` engine will be loaded into the page. Notice,
however, that the `src` attribute also accepts optional query-string style
arguments. Here we've specified:

* **game**: MyFirstGame
* **screen**: sgfDiv
* **debug**: true


### Browser Compatibility ###

The `HTML/DOM` engine attempts to support the widest browser range possible,
depending on the browser's capabilities.
