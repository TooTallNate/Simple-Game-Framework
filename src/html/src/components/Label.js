
function Label(options) {
    var self = this;
    
    Component.call(self, options);
    
    self['_t'] = "";
    self['_n'] = document.createTextNode(self['_t']);
    self['element'].appendChild(self['_n']);
}

inherits(Label, Component);
makePrototypeClassCompatible(Label);

Label.prototype['getElement'] = (function() {
    var e = document.createElement("pre"), props = {
        "border":"none 0px #000000",
        "background-color":"transparent",
        "position":"absolute",
        "overflow":"hidden",
        "margin":"0px",
        "padding":"0px"
    };
    for (var key in props) {
        setStyleImportant(e, key, props[key]);
    }
    return function() {
        var el = e.cloneNode(false);
        setStyleImportant(el, "color", "#" + this['color']);
        this['_c'] = this['color'];
        setStyleImportant(el, "font-family", this['font']['__fontName']);
        this['_f'] = this['font'];
        setStyleImportant(el, "font-size", (this['size'] / devicePixelRatio) + "px");
        setStyleImportant(el, "line-height", (this['size'] / devicePixelRatio) + "px");
        this['_s'] = this['size'];
        return el;
    }
})();

Label.prototype['render'] = function(renderCount) {
    var self = this;

    Component.prototype['render'].call(self, renderCount);

    if (self['__align'] !== self['align']) {
        setStyleImportant(self['element'], "text-align", self['align'] == 0 ? "left" : self['align'] == 1 ? "center" : "right");
        self['__align'] = self['align'];
    }

    if (self['__font'] !== self['font']) {
        setStyleImportant(self['element'], "font-family", self['font']['__fontName']);
        self['__font'] = self['font'];
    }

    if (self['__size'] !== self['size']) {
        var val = (self['size'] / devicePixelRatio) + "px";
        setStyleImportant(self['element'], "font-size", val);
        setStyleImportant(self['element'], "line-height", val);            
        self['__size'] = self['size'];
    }

    if (self['_c'] !== self['color']) {
        setStyleImportant(self['element'], "color", "#" + self['color']);
        self['_c'] = self['color'];
    }

    if (self['_U']) {
        var text = "", l = self['_t'].length, i=0, pos=0, cur, numSpaces, j;
        for (; i<l; i++) {
            cur = self['_t'].charAt(i);
            if (cur === '\n') {
                pos = 0;
                text += cur;
            } else if (cur === '\t') {
                numSpaces = Label['TAB_WIDTH'] - (pos % Label['TAB_WIDTH']);
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
        self['_n']['nodeValue'] = text;
        self['_U'] = false;
    }
}
Label.prototype['getText'] = function() {
    return this['_t'];
}
Label.prototype['setText'] = function(textContent) {
    this['_t'] = textContent;
    this['_U'] = true;
}

Label.prototype['align'] = 0;
Label.prototype['color'] ="FFFFFF";
Label.prototype['font'] = new Font("monospace");
Label.prototype['size'] = 12;
Label.prototype['toString'] = functionReturnString("[object Label]");

extend(Label, {
    'LEFT': 0,
    'CENTER': 1,
    'RIGHT': 2,
    
    'TAB_WIDTH': 4
});

modules['label'] = Label;
