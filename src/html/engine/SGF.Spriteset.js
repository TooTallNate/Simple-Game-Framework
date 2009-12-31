SGF.Spriteset = Class.create({
    initialize: function(imgPath, spriteWidth, spriteHeight) {
        this.loaded = false;
        this.spriteWidth = spriteWidth;
        this.spriteHeight = spriteHeight;
        this.width = this.height = -1; // Not loaded yet.

        this.image = new Image();
        this.image.onload = this.imageLoaded.bind(this);
        this.image.src = SGF.Game.current.root + imgPath;
        this.image.style.position = "absolute";

        this.loadListeners = [];
    },
    imageLoaded: function(loadEvent) {
        this.loaded = true;
        this.width = this.image.naturalWidth;
        this.height = this.image.naturalHeight;
        for (var i=0; i < this.loadListeners.length; i++) {
            this.loadListeners[i](this);
        }
    },
    observe: function(eventName, handler) {
        this.loadListeners.push(handler);
    },
    toElement: function() {
        return this.image.clone(false);
    }
})