SGF.Spriteset = Class.create({
    initialize: function(imgPath, spriteWidth, spriteHeight) {
        this.loaded = false;
        this.spriteWidth = spriteWidth;
        this.spriteHeight = spriteHeight;
        this.width = this.height = -1; // Not loaded yet.

        this.loadListeners = [];

        this.image = new Image();
        this.image.onload = this.imageLoaded.bind(this);
        this.image.src = SGF.Game.current.root + imgPath;
        this.image.style.position = "absolute";
    },
    imageLoaded: function(loadEvent) {
        this.width = this.image.width;
        this.height = this.image.height;
        this.loaded = true;
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