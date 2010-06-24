
var Label = Class.create(Component, {
    initialize: function($super, options) {
        $super(Object.extend(Object.clone(Label.DEFAULTS), options || {}));
        this.__text = "";
        this.__textNode = document.createTextNode(this.__text);
        this.element.appendChild(this.__textNode);
    },
    getElement: (function() {
        var e = document.createElement("pre");
        $H({
            "border":"none 0px #000000",
            "background-color":"transparent",
            "position":"absolute",
            "overflow":"hidden",
            "margin":"0px",
            "padding":"0px"
        })['each'](function(prop) {
            Element['setStyleI'](e, prop['key'], prop['value']);
        });
        return function() {
            var el = e.cloneNode(false);
            Element['setStyleI'](el, "color", "#"+this.color);
            this.__color = this.color;
            Element['setStyleI'](el, "font-family", this.font.__fontName);
            this.__font = this.font;
            Element['setStyleI'](el, "font-size", this.size + "px");
            Element['setStyleI'](el, "line-height", this.size + "px");
            this.__size = this.size;
            return el;
        }
    })(),
    render: function($super, renderCount) {
        $super(renderCount);
        if (this.__align !== this.align) {
            Element['setStyleI'](this.element, "text-align", this.align == 0 ? "left" : this.align == 1 ? "center" : "right");
            this.__align = this.align;
        }
        if (this.__font !== this.font) {
            Element['setStyleI'](this.element, "font-family", this.font.__fontName);
            this.__font = this.font;
        }
        if (this.__size !== this.size) {
            var val = (this.size) + "px";
            Element['setStyleI'](this.element, "font-size", val);
            Element['setStyleI'](this.element, "line-height", val);            
            this.__size = this.size;
        }
        if (this.__color !== this.color) {
            Element['setStyleI'](this.element, "color", "#"+this.color);
            this.__color = this.color;
        }
        if (this.__textNeedsUpdate === true) {
            var text = "", l = this.__text.length, i=0, pos=0, cur, numSpaces, j;
            for (; i<l; i++) {
                cur = this.__text.charAt(i);
                if (cur === '\n') {
                    pos = 0;
                    text += cur;
                } else if (cur === '\t') {
                    numSpaces = Label.TAB_WIDTH - (pos % Label.TAB_WIDTH);
                    for (j=0; j<numSpaces; j++) {
                        text += ' ';
                    }
                    pos += numSpaces;
                } else {
                    text += cur;
                    pos++;
                }
            }
            if (isIE7orLower) {
                text = text.replace(/\n/g, '\r');
            }
            this.__textNode.nodeValue = text;
            this.__textNeedsUpdate = false;
        }
    },
    getText: function() {
        return this.__text;
    },
    setText: function(textContent) {
        this.__text = textContent;
        this.__textNeedsUpdate = true;
    }
});

var isIE7orLower = (function() {
    /MSIE (\d+\.\d+);/.test(navigator.userAgent);
    return (new Number(RegExp.$1)) <= 7;
})();

Object.extend(Label, {
    'DEFAULTS': {
        'align': 0,
        'color': "FFFFFF",
        'font': new Font("monospace"),
        'size': 12
    },
    'LEFT': 0,
    'CENTER': 1,
    'RIGHT': 2,
    
    'TAB_WIDTH': 4
});

modules['label'] = Label;
