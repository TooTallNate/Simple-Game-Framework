(function(l, n) {
  function e(a) {
    if(a !== true) {
      T(this, a || {});
      this.element = this.getElement()
    }
  }
  function o(a, b) {
    if(a !== true) {
      this.components = [];
      e.call(this, b || {});
      Object.isArray(a) && a.each(this.addComponent, this);
      this.__shouldUpdateComponents = this.__needsRender = true
    }
  }
  function v(a, b) {
    o.call(this, a, b);
    this.__shouldUpdateComponents = this.__needsRender = false
  }
  function q(a) {
    e.call(this, a);
    this._t = "";
    this._n = n.createTextNode(this._t);
    this.element.appendChild(this._n)
  }
  function w(a, b) {
    this.spriteset = a;
    this.spritesetImg = a.image.cloneNode(false);
    e.call(this, b)
  }
  function z(a) {
    e.call(this, a)
  }
  function D(a) {
    e.call(this, a)
  }
  function h(a) {
    if(!a) {
      this._l = {};
      if(!(this instanceof h)) {
        for(var b in h.prototype) {
          this[b] = h.prototype[b]
        }
      }
    }
  }
  function k(a) {
    h.call(this);
    this.game = a;
    this._k = {}
  }
  function F(a) {
    var b = f.game.screen.element.cumulativeOffset();
    return{x:a.pointerX() - b.left, y:a.pointerY() - b.top}
  }
  function U(a) {
    if(f) {
      var b = F(a), d = f.game.screen;
      b.x >= 0 && b.y >= 0 && b.x <= d.width && b.y <= d.height && a.stop()
    }
  }
  function V(a) {
    a.ctrlKey || a.metaKey || a.altKey || f && a.stop()
  }
  function W(a) {
    if(!(a.ctrlKey || a.metaKey || a.altKey)) {
      if(f) {
        a.stop();
        if(f._k[a.keyCode] !== true) {
          var b = {keyCode:a.keyCode, shiftKey:a.shiftKey};
          f._k[a.keyCode] = true;
          f.fireEvent("keydown", [b])
        }
      }
    }
  }
  function X(a) {
    if(!(a.ctrlKey || a.metaKey || a.altKey)) {
      if(f) {
        a.stop();
        if(f._k[a.keyCode] !== false) {
          var b = {keyCode:a.keyCode, shiftKey:a.shiftKey};
          f._k[a.keyCode] = false;
          f.fireEvent("keydown", [b])
        }
      }
    }
  }
  function G(a) {
    if(f) {
      var b = F(a), d = f.game.screen;
      b.button = a.button;
      if(b.x >= 0 && b.y >= 0 && b.x <= d.width && b.y <= d.height) {
        f = f;
        a.stop();
        l.focus();
        f.pointerX = b.x;
        f.pointerY = b.y;
        f.fireEvent("mousedown", [b])
      }else {
        f = null;
        G(a)
      }
    }else {
      b = H.length;
      for(var c = d = null, g = a.pointerX(), p = a.pointerY();b--;) {
        c = H[b].screen.element;
        d = c.cumulativeOffset();
        if(g >= d.left && g <= d.left + c.clientWidth && p >= d.top && p <= d.top + c.clientHeight) {
          f = H[b].input;
          G(a)
        }
      }
    }
  }
  function Y(a) {
    if(f) {
      var b = F(a), d = f.game.screen;
      b.button = a.button;
      if(b.x >= 0 && b.y >= 0 && b.x <= d.width && b.y <= d.height) {
        a.stop();
        f.pointerX = b.x;
        f.pointerY = b.y;
        f.fireEvent("mouseup", [b])
      }
    }
  }
  function Z(a) {
    if(f) {
      var b = F(a), d = f.game.screen;
      if(b.x >= 0 && b.y >= 0 && b.x <= d.width && b.y <= d.height && (f.pointerX !== b.x || f.pointerY !== b.y)) {
        a.stop();
        f.pointerX = b.x;
        f.pointerY = b.y;
        f.fireEvent("mousemove", [b])
      }
    }
  }
  function m(a, b, d) {
    var c = this;
    h.call(c);
    o.call(c, d);
    c.input = new k(c);
    c.screen = new A(c);
    c.screen._bind(b);
    if(a.endsWith("main.js")) {
      a = a.substring(0, a.lastIndexOf("main.js"))
    }
    c.root = a.endsWith("/") ? a : a + "/";
    c.setGameSpeed(c.gameSpeed);
    c.loaded = c.running = false;
    c.startTime = NaN;
    I = c;
    c._s = function() {
      c.step()
    };
    new t(c, "main.js", function() {
      c.loaded = true;
      c.fireEvent("load");
      c.start()
    })
  }
  function E(a, b) {
    h.call(this);
    if(a instanceof m) {
      b = a.root + b;
      this.__fontName = "SGF_font" + (Math.random() * 1E4).round();
      var d = '@font-face {  font-family: "' + this.__fontName + '";  src: url("' + b + '");}', c = n.createElement("style");
      c.type = "text/css";
      if(c.styleSheet) {
        c.styleSheet.cssText = d
      }else {
        c.appendChild(n.createTextNode(d))
      }
      n.getElementsByTagName("head")[0].appendChild(c);
      this.__styleNode = c
    }else {
      this.__fontName = b = a
    }
  }
  function t(a, b, d) {
    if(a instanceof m) {
      b = a.root + b
    }else {
      d = b;
      b = a
    }
    var c = n.createElement("script"), g = this;
    h.call(g);
    c.type = "text/javascript";
    c.setAttribute("async", "true");
    c.onload = c.onreadystatechange = function() {
      if(!c.readyState || c.readyState == "loaded" || c.readyState == "complete") {
        typeof d == "function" && d.apply(g, arguments)
      }
    };
    c.src = b;
    n.getElementsByTagName("head")[0].appendChild(c)
  }
  function u(a, b, d, c, g) {
    var p = this;
    h.call(p);
    p.spriteWidth = d;
    p.spriteHeight = c;
    g && p.addListener("load", g);
    var x = new Image;
    x.style.position = "absolute";
    x.onload = function() {
      p.width = x.width;
      p.height = x.height;
      p.loaded = true;
      p.fireEvent("load")
    };
    p.image = x;
    p.src = x.src = a.root + b
  }
  function aa(a, b) {
    if(typeof a === "function") {
      try {
        0()
      }catch(d) {
        aa(d, a)
      }
    }else {
      var c = a.stack;
      if(a.sourceURL) {
        b(a.sourceURL)
      }else {
        if(a.arguments) {
          c = c.split("\n")[2];
          c = c.substring(c.lastIndexOf(" ") + 1);
          c = c.substring(0, c.lastIndexOf(":"));
          if(c.indexOf("(") === 0) {
            c = c.substring(1)
          }
          b(c.substring(0, c.lastIndexOf(":")))
        }else {
          if(c) {
            c = c.split("\n")[0];
            c = c.substring(c.indexOf("@") + 1);
            b(c.substring(0, c.lastIndexOf(":")))
          }else {
            var g = l.onerror;
            l.onerror = function(p, x) {
              l.onerror = g;
              b(x);
              return true
            };
            throw a;
          }
        }
      }
    }
  }
  function J() {
    ba() && ca() && da() && "WebSocket" in l && ma()
  }
  function ba() {
    var a = false;
    if("Prototype" in l) {
      var b = parseFloat(l.Prototype.Version.substring(0, 3));
      if(b > 1.6 || b == 1.6 && parseInt(l.Prototype.Version.charAt(4)) >= 1) {
        a = true
      }
    }
    return a
  }
  function na() {
    J()
  }
  function da() {
    return"Sound" in l && "SoundChannel" in l
  }
  function ea() {
    l.Sound.swfPath = B(s["soundjs-swf"]);
    J()
  }
  function ca() {
    return"swfobject" in l && "embedSWF" in l.swfobject
  }
  function fa() {
    if(da()) {
      ea()
    }else {
      new t(B(s.soundjs), ea)
    }
    "WebSocket" in l || new t(B(s.fabridge), function() {
      new t(B(s.websocket), oa)
    })
  }
  function oa() {
    l.WebSocket.__swfLocation = B(s["websocket-swf"]);
    l.WebSocket.__initialize();
    J()
  }
  function T(a, b) {
    for(var d in b) {
      a[d] = b[d]
    }
    return a
  }
  function ga(a, b, d) {
    d = a.slice((d || b) + 1 || a.length);
    a.length = b < 0 ? a.length + b : b;
    return a.push.apply(a, d)
  }
  function B(a) {
    return a.substring(0, 7) == "http://" || a.substring(0, 8) == "https://" || a.substring(0, 7) == "file://" ? a : O + a
  }
  function y(a) {
    a.prototype.initialize = a;
    a.subclasses = []
  }
  function r(a) {
    return function() {
      return a
    }
  }
  function P(a) {
    return function() {
      return this[a]
    }
  }
  function ma() {
    var a = Class.create({l:function(b, d) {
      Object.extend(this, d || {});
      this.URL = b;
      this.f = this.j.c(this);
      this.d = this.h.c(this);
      this.e = this.i.c(this);
      this.autoconnect && this.connect()
    }, o:Prototype.emptyFunction, m:Prototype.emptyFunction, n:Prototype.emptyFunction, q:function() {
      this.a = new WebSocket(this.URL);
      this.a.onopen = this.f;
      this.a.onclose = this.d;
      this.a.onmessage = this.e
    }, close:function() {
      this.a && this.a.close()
    }, send:function(b) {
      this.a.send(b)
    }, j:function() {
      this.o()
    }, h:function() {
      this.m();
      this.a = null
    }, i:function(b) {
      this.n(b.data)
    }});
    a.prototype.autoconnect = false;
    a.prototype.toString = r("[object Client]");
    Object.extend(a, {CONNECTING:0, OPEN:1, CLOSED:2});
    i.client = a;
    a = Class.create({l:function() {
      throw"The HTML/DOM client is not capable of starting a Server.";
    }, start:null, stop:null, u:null, t:null, r:null, s:null});
    a.p = false;
    i.server = a;
    l.SGF = C;
    k.grab();
    K("Load Time: " + ((new Date).getTime() - pa.getTime()) + " ms");
    if(s.game) {
      s.screen ? Q(s.game, s.screen) : ha(s.game)
    }
  }
  function K() {
    var a = arguments;
    l.console && console.log && console.log.apply(console, a);
    C.fireEvent("log", a)
  }
  function Q(a, b) {
    return new i.game(a, $(b))
  }
  function ha(a) {
    return Q(a, n.body)
  }
  var L = null, R = null, O = null, s = {prototype:"lib/prototype.js", swfobject:"lib/swfobject.js", fabridge:"lib/FABridge.js", soundjs:"lib/Sound.min.js", "soundjs-swf":"lib/Sound.swf", websocket:"lib/web_socket.js", "websocket-swf":"lib/WebSocketMain.swf"}, pa = new Date, i = {}, M = navigator.userAgent, qa = Object.prototype.toString.call(l.opera) == "[object Opera]", S = !!l.attachEvent && !qa, ra = S && parseFloat(navigator.userAgent.split("MSIE")[1]) <= 7;
  M = M.indexOf("Gecko") > -1 && M.indexOf("KHTML") === -1;
  var j = function() {
    return n.documentElement.style.setProperty ? function(a, b, d) {
      a.style.setProperty(b, d, "important")
    } : function(a, b, d) {
      a.style.cssText += ";" + b + ":" + d + " !important;"
    }
  }(), ia;
  ia = l.CSSMatrix ? function(a, b) {
    a.style.transform = "rotate(" + (b || 0) + "rad)";
    return a
  } : l.WebKitCSSMatrix ? function(a, b) {
    a.style.webkitTransform = "rotate(" + (b || 0) + "rad)";
    return a
  } : M ? function(a, b) {
    a.style.MozTransform = "rotate(" + (b || 0) + "rad)";
    return a
  } : S ? function(a, b) {
    if(!a.b) {
      a.b = [a.offsetWidth, a.offsetHeight]
    }
    var d = Math.cos(b || 0) * 1, c = Math.sin(b || 0) * 1;
    try {
      var g = a.filters("DXImageTransform.Microsoft.Matrix");
      g.M11 = d;
      g.M21 = -c;
      g.M12 = c;
      g.M22 = d
    }catch(p) {
      a.style.filter += " progid:DXImageTransform.Microsoft.Matrix(sizingMethod='auto expand',M11=" + d + ",M12=" + -c + ",M21=" + c + ",M22=" + d + ")"
    }
    a.style.marginLeft = (a.b[0] - a.offsetWidth) / 2 + "px";
    a.style.marginTop = (a.b[1] - a.offsetHeight) / 2 + "px";
    return a
  } : function(a) {
    return a
  };
  e.prototype.getElement = function() {
    var a = n.createElement("div");
    j(a, "position", "absolute");
    j(a, "overflow", "hidden");
    return function() {
      return a.cloneNode(false)
    }
  }();
  e.prototype.toElement = P("element");
  e.prototype.left = P("x");
  e.prototype.top = P("y");
  e.prototype.right = function() {
    return this.x + this.width - 1
  };
  e.prototype.bottom = function() {
    return this.y + this.height - 1
  };
  e.prototype.render = function() {
    if(this.__rotation != this.rotation) {
      ia(this.element, this.rotation);
      this.__rotation = this.rotation
    }
    if(this.__opacity != this.opacity) {
      Element.setOpacity(this.element, this.opacity);
      this.__opacity = this.opacity
    }
    if(this.__zIndex != this.zIndex) {
      this.__fixZIndex();
      this.__zIndex = this.zIndex
    }
    if(this.__width != this.width) {
      j(this.element, "width", this.width + "px");
      this.__width = this.width
    }
    if(this.__height != this.height) {
      j(this.element, "height", this.height + "px");
      this.__height = this.height
    }
    if(this.__x != this.x) {
      j(this.element, "left", this.x + "px");
      this.__x = this.x
    }
    if(this.__y != this.y) {
      this.__y = this.y;
      j(this.element, "top", this.y + "px")
    }
  };
  e.prototype.update = function() {
  };
  e.prototype.__fixZIndex = function() {
    var a = this.parent && this.parent.g ? this.parent.g(this.zIndex) : this.zIndex;
    j(this.element, "z-index", a)
  };
  e.prototype.width = 10;
  e.prototype.height = 10;
  e.prototype.x = 0;
  e.prototype.y = 0;
  e.prototype.opacity = 1;
  e.prototype.rotation = 0;
  e.prototype.zIndex = 0;
  e.prototype.parent = null;
  e.prototype.element = null;
  e.prototype.toString = r("[object Component]");
  y(e);
  i.component = e;
  o.prototype = new e(true);
  o.prototype.update = function(a) {
    if(this.__shouldUpdateComponents) {
      for(var b = 0;b < this.components.length;b++) {
        this.components[b].update && this.components[b].update(a)
      }
    }
  };
  o.prototype.render = function(a) {
    e.prototype.render.call(this, a);
    this.__needsRender && this.__renderComponents(a)
  };
  o.prototype.__renderComponents = function(a) {
    for(var b = 0;b < this.components.length;b++) {
      this.components[b].render && this.components[b].render(a)
    }
  };
  o.prototype.addComponent = function(a) {
    if(a.parent !== this) {
      a.parent && a.parent.removeComponent(a);
      this.components.push(a);
      this.element.appendChild(a.element);
      a.parent = this;
      a.__fixZIndex()
    }
    return this
  };
  o.prototype.removeComponent = function(a) {
    var b = this.components.indexOf(a);
    if(b > -1) {
      ga(this.components, b);
      this.element.removeChild(a.element);
      a.parent = null
    }
    return this
  };
  o.prototype.__computeChildZIndex = function(a) {
    return(parseInt(this.element.style.zIndex) || 0) + (parseInt(a) || 0)
  };
  o.prototype.__fixZIndex = function() {
    e.prototype.__fixZIndex.call(this);
    for(var a = 0;a < this.components.length;a++) {
      this.components[a].__fixZIndex()
    }
  };
  o.prototype.toString = r("[object Container]");
  y(o);
  i.container = o;
  v.prototype = new o(true);
  v.prototype.addComponent = function(a) {
    o.prototype.addComponent.call(this, a);
    this.__needsRender = true;
    return this
  };
  v.prototype.removeComponent = function(a) {
    o.prototype.removeComponent.call(this, a);
    this.__needsRender = true;
    return this
  };
  v.prototype.render = function(a) {
    if(this.width != this.__width || this.height != this.__height) {
      this.__needsRender = true
    }
    o.prototype.render.call(this, a)
  };
  v.prototype.__renderComponents = function(a) {
    o.prototype.__renderComponents.call(this, a);
    this.__needsRender = false
  };
  v.prototype.renderComponents = function() {
    this.__needsRender = true
  };
  v.prototype.toString = r("[object DumbContainer]");
  y(v);
  i.dumbcontainer = v;
  q.prototype = new e(true);
  q.prototype.getElement = function() {
    var a = n.createElement("pre"), b = {border:"none 0px #000000", "background-color":"transparent", position:"absolute", overflow:"hidden", margin:"0px", padding:"0px"};
    for(var d in b) {
      j(a, d, b[d])
    }
    return function() {
      var c = a.cloneNode(false);
      j(c, "color", "#" + this.color);
      this._c = this.color;
      j(c, "font-family", this.font.__fontName);
      this._f = this.font;
      j(c, "font-size", this.size + "px");
      j(c, "line-height", this.size + "px");
      this._s = this.size;
      return c
    }
  }();
  q.prototype.render = function(a) {
    e.prototype.render.call(this, a);
    if(this.__align !== this.align) {
      j(this.element, "text-align", this.align == 0 ? "left" : this.align == 1 ? "center" : "right");
      this.__align = this.align
    }
    if(this.__font !== this.font) {
      j(this.element, "font-family", this.font.__fontName);
      this.__font = this.font
    }
    if(this.__size !== this.size) {
      a = this.size + "px";
      j(this.element, "font-size", a);
      j(this.element, "line-height", a);
      this.__size = this.size
    }
    if(this._c !== this.color) {
      j(this.element, "color", "#" + this.color);
      this._c = this.color
    }
    if(this._U) {
      a = "";
      for(var b = this._t.length, d = 0, c = 0, g, p;d < b;d++) {
        g = this._t.charAt(d);
        if(g === "\n") {
          c = 0;
          a += g
        }else {
          if(g === "\t") {
            g = q.TAB_WIDTH - c % q.TAB_WIDTH;
            for(p = 0;p < g;p++) {
              a += " "
            }
            c += g
          }else {
            a += g;
            c++
          }
        }
      }
      if(ra) {
        a = a.replace(/\n/g, "\r")
      }
      this._n.nodeValue = a;
      this._U = false
    }
  };
  q.prototype.getText = function() {
    return this._t
  };
  q.prototype.setText = function(a) {
    this._t = a;
    this._U = true
  };
  q.prototype.align = 0;
  q.prototype.color = "FFFFFF";
  q.prototype.font = new E("monospace");
  q.prototype.size = 12;
  q.prototype.toString = r("[object Label]");
  T(q, {LEFT:0, CENTER:1, RIGHT:2, TAB_WIDTH:4});
  y(q);
  i.label = q;
  w.prototype = new e(true);
  w.prototype.getElement = function() {
    var a = e.prototype.getElement.call(this);
    a.appendChild(this.spritesetImg);
    return a
  };
  w.prototype.render = function(a) {
    if(this.__spriteX != this.spriteX || this.__spriteY != this.spriteY || this.__width != this.width || this.__height != this.height) {
      if(this.spriteset.loaded) {
        this.resetSpriteset()
      }else {
        if(!this.__resetOnLoad) {
          this.spriteset.addListener("load", this.resetSpriteset.c(this));
          this.__resetOnLoad = true
        }
      }
    }
    e.prototype.render.call(this, a)
  };
  w.prototype.resetSpriteset = function() {
    var a = this.spritesetImg;
    j(a, "width", this.spriteset.width * (this.width / this.spriteset.spriteWidth) + "px");
    j(a, "height", this.spriteset.height * (this.height / this.spriteset.spriteHeight) + "px");
    j(a, "top", -(this.height * this.spriteY) + "px");
    j(a, "left", -(this.width * this.spriteX) + "px");
    this.__spriteX = this.spriteX;
    this.__spriteY = this.spriteY
  };
  w.prototype.spriteX = 0;
  w.prototype.spriteY = 0;
  w.prototype.toString = r("[object Sprite]");
  y(w);
  i.sprite = w;
  z.prototype = new e(true);
  z.prototype.render = function(a) {
    if(this.__color !== this.color) {
      j(this.element, "background-color", "#" + this.color);
      this.__color = this.color
    }
    e.prototype.render.call(this, a)
  };
  z.prototype.color = "000000";
  z.prototype.toString = r("[object Shape]");
  y(z);
  i.shape = z;
  D.prototype = new z(true);
  D.prototype.getElement = function() {
    this.__color = this.color;
    var a = new Element("div");
    j(a, "position", "absolute");
    j(a, "background-color", "#" + this.color);
    return a
  };
  D.prototype.toString = r("[object Rectangle]");
  y(D);
  i.rectangle = D;
  h.prototype.addListener = function(a, b) {
    var d = this._l;
    a in d || (d[a] = []);
    d[a].push(b);
    return this
  };
  h.prototype.removeListener = function(a, b) {
    var d = this._l[a];
    if(d) {
      var c = d.indexOf(b);
      c >= 0 && ga(d, c)
    }
    return this
  };
  h.prototype.removeAllListeners = function(a) {
    delete this._l[a];
    return this
  };
  h.prototype.fireEvent = function(a, b) {
    var d = this._l[a], c = 0;
    if(d) {
      for(var g = d.length;c < g;c++) {
        d[c].apply(this, b)
      }
    }
    return this
  };
  var ja = false;
  h.prototype.observe = function() {
    if(!ja) {
      K("DEPRECATED: 'EventEmitter#observe' is deprecated, please use 'EventEmitter#addListener' instead.");
      ja = true
    }
    return this.addListener.apply(this, arguments)
  };
  var ka = false;
  h.prototype.stopObserving = function() {
    if(!ka) {
      K("DEPRECATED: 'EventEmitter#stopObserving' is deprecated, please use 'EventEmitter#removeListener' instead.");
      ka = true
    }
    return this.removeListener.apply(this, arguments)
  };
  i.eventemitter = h;
  function A(a) {
    var b = this;
    h.call(b);
    b._bind = function(d) {
      var c = d.style;
      c.padding = 0;
      c.overflow = "hidden";
      if(c.MozUserSelect !== undefined) {
        c.MozUserSelect = "moz-none"
      }else {
        if(c.webkitUserSelect !== undefined) {
          c.webkitUserSelect = "none"
        }
      }
      Element.makePositioned(d);
      Element.immediateDescendants(d).without($("webSocketContainer")).invoke("remove");
      b.element !== null && Object.isElement(b.element) && Element.immediateDescendants(b.element).invoke("remove").each(d.insert, d);
      b.element = d;
      a.element = d;
      b.isFullScreen = d === n.body
    };
    b.useNativeCursor = function(d) {
      var c = null;
      if(Boolean(d) == false) {
        d = "none"
      }
      if(Object.isString(d)) {
        d = d.toLowerCase();
        if("default" == d) {
          c = "default"
        }else {
          if("crosshair" == d) {
            c = "crosshair"
          }else {
            if("hand" == d) {
              c = "pointer"
            }else {
              if("move" == d) {
                c = "move"
              }else {
                if("text" == d) {
                  c = "text"
                }else {
                  if("wait" == d) {
                    c = "wait"
                  }else {
                    if("none" == d) {
                      c = "url(" + O + "blank." + (S ? "cur" : "gif") + "), none"
                    }
                  }
                }
              }
            }
          }
        }
      }
      b.element.style.cursor = c
    }
  }
  A.prototype = new h(true);
  A.prototype._r = function() {
    color = this.color;
    element = this.element;
    this.width = this.isFullScreen && n.documentElement.clientWidth !== 0 ? n.documentElement.clientWidth : this.element.clientWidth;
    this.height = this.isFullScreen && n.documentElement.clientHeight !== 0 ? n.documentElement.clientHeight : this.element.clientHeight;
    if(color != this._c) {
      element.style.backgroundColor = "#" + color;
      this._c = color
    }
  };
  A.prototype.color = "000000";
  A.prototype.isFullScreen = false;
  A.prototype.toString = r("[object Screen]");
  i.screen = A;
  var f = null;
  k.prototype = new h(true);
  k.prototype.pointerX = 0;
  k.prototype.pointerY = 0;
  k.prototype.isKeyDown = function(a) {
    return this._k[a] === true
  };
  k.prototype.toString = r("[object Input]");
  k.MOUSE_PRIMARY = 0;
  k.MOUSE_MIDDLE = 1;
  k.MOUSE_SECONDARY = 2;
  k.KEY_DOWN = 40;
  k.KEY_UP = 38;
  k.KEY_LEFT = 37;
  k.KEY_RIGHT = 39;
  k.KEY_1 = 32;
  k.KEY_2 = 33;
  k.KEY_3 = 34;
  k.KEY_4 = 35;
  k.grab = function() {
    n.observe("keydown", W).observe("keypress", V).observe("keyup", X).observe("mousemove", Z).observe("mousedown", G).observe("mouseup", Y).observe("contextmenu", U);
    k.k = true
  };
  k.release = function() {
    n.stopObserving("keydown", W).stopObserving("keypress", V).stopObserving("keyup", X).stopObserving("mousemove", Z).stopObserving("mousedown", G).stopObserving("mouseup", Y).stopObserving("contextmenu", U);
    k.k = false
  };
  i.input = k;
  var la = function() {
    return"now" in Date ? Date.now : function() {
      return(new Date).getTime()
    }
  }(), I = null, H = [];
  m.prototype = new o(true);
  m.prototype.gameSpeed = 30;
  m.prototype.maxFrameSkips = 5;
  m.prototype.setGameSpeed = function(a) {
    this.gameSpeed = a;
    this.period = 1E3 / a;
    return this
  };
  m.prototype.start = function() {
    this.running = true;
    H.push(this);
    this.startTime = this.nextGamePeriod = la();
    this.updateCount = this.renderCount = 0;
    setTimeout(this._s, 0);
    this.fireEvent("start")
  };
  m.prototype.getFont = function(a, b) {
    return new i.font(this, a, b)
  };
  m.prototype.getScript = function(a, b) {
    return new i.script(this, a, b)
  };
  m.prototype.getSound = function(a, b) {
    return new i.sound(this, a, b)
  };
  m.prototype.getSpriteset = function(a, b, d, c) {
    return new i.spriteset(this, a, b, d, c)
  };
  m.prototype.render = function() {
    for(var a = 0, b = null;a < this.components.length;a++) {
      b = this.components[a];
      b.render && b.render(this.renderCount)
    }
    this.renderCount++
  };
  m.prototype.step = function() {
    if(!this.running) {
      return this.stopped()
    }
    I = this;
    for(var a = 0;la() > this.nextGamePeriod && a < this.maxFrameSkips;) {
      this.update();
      this.nextGamePeriod += this.period;
      a++
    }
    this.screen._r();
    this.render();
    setTimeout(this._s, 0)
  };
  m.prototype.stop = function() {
    this.fireEvent("stopping");
    this.running = false;
    return this
  };
  m.prototype.stopped = function() {
    this.screen.useNativeCursor(true);
    I = null;
    this.fireEvent("stopped")
  };
  m.prototype.update = function() {
    for(var a = 0, b = null;a < this.components.length;a++) {
      b = this.components[a];
      b.update && b.update(this.updateCount)
    }
    this.updateCount++
  };
  m.prototype.__computeChildZIndex = function(a) {
    return((parseInt(a) || 0) + 1) * 1E3
  };
  m.prototype.toString = r("[object Game]");
  m.getInstance = function() {
    return I
  };
  y(m);
  i.game = m;
  E.prototype = new h(true);
  E.prototype.toString = r("[object Font]");
  E.subclasses = [];
  i.font = E;
  t.subclasses = [];
  t.prototype = new h(true);
  t.prototype.loaded = false;
  t.prototype.toString = r("[object Script]");
  t.destroyScript = function(a) {
    a.parentNode && a.parentNode.removeChild(a);
    for(var b in a) {
      delete a[b]
    }
    return a
  };
  i.script = t;
  function N() {
    h.call(this)
  }
  N.subclasses = [];
  N.prototype = new h(true);
  N.prototype.toString = r("[object Sound]");
  i.sound = N;
  u.subclasses = [];
  u.prototype = new h(true);
  u.prototype.loaded = false;
  u.prototype.width = -1;
  u.prototype.height = -1;
  u.prototype.spriteWidth = -1;
  u.prototype.spriteHeight = -1;
  u.prototype.src = null;
  u.prototype.toElement = function() {
    return this.image.cloneNode(true)
  };
  u.prototype.toString = r("[object Spriteset]");
  i.spriteset = u;
  var C = new h;
  C.toString = function() {
    return"[object SGF]"
  };
  C.log = K;
  C.require = function(a) {
    if(typeof a == "string") {
      a = String(a).toLowerCase();
      if(a in i) {
        return i[a]
      }
      throw Error("SGF.require: module name '" + a + "' does not exist");
    }
    throw Error("SGF.require: expected argument typeof 'string', got '" + typeof a + "'");
  };
  C.startWithDiv = Q;
  C.startFullScreen = ha;
  aa(function(a) {
    L = a;
    O = L.substring(0, L.lastIndexOf("/") + 1);
    a: {
      a = L;
      var b = n.getElementsByTagName("script"), d = b.length, c = n.getElementById("SGF-script");
      if(c) {
        R = c
      }else {
        for(;d--;) {
          c = b[d];
          if(c.src === a) {
            R = c;
            break a
          }
        }
        throw Error('FATAL: Could not find <script> node with "src" === "' + a + '"\nPlease report this to the SGF issue tracker. You can work around this error by explicitly setting the "id" of the <script> node to "SGF-script".');
      }
    }
    a = R;
    for(b = a.attributes.length;b--;) {
      d = a.attributes[b].nodeName;
      if(d.indexOf("data-") === 0) {
        s[d.substring(5)] = a.getAttribute(d)
      }
    }
    if(ba()) {
      J()
    }else {
      new t(B(s.prototype), na)
    }
    if(ca()) {
      fa()
    }else {
      new t(B(s.swfobject), fa)
    }
  })
})(this, document);