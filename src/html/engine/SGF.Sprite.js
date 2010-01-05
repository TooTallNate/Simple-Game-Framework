SGF.Sprite = Class.create(SGF.Component, {
    initialize: function($super, spriteset, options) {
        this.spriteset = spriteset;
        $super(Object.extend(Object.clone(SGF.Sprite.DEFAULTS), options || {}));
    },
    getElement: function() {
        // This is to overwrite the 'width' & 'height' to match the spriteset
        this.width = this.spriteset.spriteWidth;
        this.height = this.spriteset.spriteHeight;

        return new Element("div").setStyle({
            position: "absolute",
            overflow: "hidden"
        }).insert(this.spriteset);
    },
    scale: function($super, newScale) {
        $super(newScale);
        
        var scaleSpriteset = (function() {
            var spritesetImg = this.element.firstDescendant();
            spritesetImg.style.width = (this.spriteset.width * newScale) + "px";
            spritesetImg.style.height = (this.spriteset.height * newScale) + "px";
        }).bind(this);

        if (this.spriteset.loaded) {
            scaleSpriteset();
        } else {
            this.spriteset.observe("load", scaleSpriteset);
        }
    }
});

SGF.Sprite.DEFAULTS = {
    spriteX: 0,
    spriteY: 0
};