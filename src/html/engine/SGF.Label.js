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
        return new Element("pre").setStyle({
        //return new Element("div").setStyle({
            position: "absolute",
            overflow: "hidden",
            color: "#" + this.color,
            fontFamily: this.font.__fontName,
            fontSize: (this.size * SGF.Screen.getScale()) + "px",
            lineHeight: (this.size * SGF.Screen.getScale()) + "px",
            margin: 0,
            padding:0
        });
    },
    render: function($super, renderCount) {
        $super(renderCount);
        if (this.__align != this.align) {
            this.element.style.textAlign = this.align == 0 ? "left" : this.align == 1 ? "center" : "right";
            this.__align = this.align;
        }
        if (this.__font != this.font) {
            this.element.style.fontFamily = this.font.__fontName;
            this.__font = this.font;
        }
        if (this.__size != this.size) {
            this.element.style.fontSize = this.element.style.lineHeight = (this.size * SGF.Screen.getScale()) + "px";
            this.__size = this.size;
        }
        if (this.__color != this.color) {
            this.element.style.color = "#" + this.color;
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
                while (text.indexOf('\n') > -1) {
                    text = text.replace('\n', '\r');
                }
            }
            this.__textNode.nodeValue = text;
            this.__textNeedsUpdate = false;
        }
    },
    getText: function() {
        return this.__text;
    },
    setText: function(textContent) {
        this.__textNeedsUpdate = true;
        this.__text = textContent;
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