SGF.Label = Class.create(SGF.Component, {
    initialize: function($super, options) {
        $super(Object.extend(Object.clone(SGF.Label.DEFAULTS), options || {}));
        this.__text = "";
        this.__textNode = document.createTextNode(this.__text);
        this.element.appendChild(this.__textNode);
    },
    getElement: function() {
        this.__color = this.color;
        this.__font = this.font;
        this.__size = this.size;
        var e = new Element("pre"), size = (this.size * SGF.Screen.getScale()) + "px";
        $H({
            "border":"0",
            "background-color":"transparent",
            "position":"absolute",
            "overflow":"hidden",
            "color":"#"+this.color,
            "font-family":this.font.__fontName,
            "font-size":size,
            "line-height":size,
            "margin":"0",
            "padding":"0"
        }).each(function(prop) {
            e.setStyleI(prop.key, prop.value);
        });
        return e;
    },
    render: function($super, renderCount) {
        $super(renderCount);
        if (this.__align !== this.align) {
            this.element.setStyleI("text-align", this.align == 0 ? "left" : this.align == 1 ? "center" : "right");
            this.__align = this.align;
        }
        if (this.__font !== this.font) {
            this.element.setStyleI("font-family", this.font.__fontName);
            this.__font = this.font;
        }
        if (this.__size !== this.size) {
            var val = (this.size * SGF.Screen.getScale()) + "px";
            this.element.setStyleI("font-size", val);
            this.element.setStyleI("line-height", val);            
            this.__size = this.size;
        }
        if (this.__color !== this.color) {
            this.element.setStyleI("color", "#"+this.color);
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
                    numSpaces = SGF.Label.TAB_WIDTH-(pos%SGF.Label.TAB_WIDTH);
                    for (j=0; j<numSpaces; j++) {
                        text += ' ';
                    }
                    pos += numSpaces;
                } else {
                    text += cur;
                    pos++;
                }
            }
            if (SGF.Label.isIE7orLower) {
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

Object.extend(SGF.Label, {
    DEFAULTS: {
        align: 0,
        color: "FFFFFF",
        font: new SGF.Font("monospace"),
        size: 12
    },
    LEFT: 0,
    CENTER: 1,
    RIGHT: 2,
    
    TAB_WIDTH: 4
});

SGF.Label.isIE7orLower = (function() {
    /MSIE (\d+\.\d+);/.test(navigator.userAgent);
    return (new Number(RegExp.$1)) <= 7;
})();
