K.Character = Class.create(SGF.Sprite, {
    initialize: function($super, spriteset) {
        $super(spriteset, {
            spriteX:1,
            spriteY:0,
            width: spriteset.spriteWidth,
            height: spriteset.spriteHeight,
            zIndex:10
        });
        this.mapSpeed = 2;
        this.state = null;
        this.direction = "S";
        this.__hasInput = false;
    },
    teleport: function(x, y) {
        this.currentTile = [x,y];
        this.x = this.currentTile[0] * K.TILE_SIZE;
        this.y = (this.currentTile[1] * K.TILE_SIZE) - (this.height - K.TILE_SIZE);
    },
    hasInput: function(bool) {
        if (bool === true || bool === false)
            this.__hasInput = bool;
        return this.__hasInput;
    },
    update: function($super, uc) {
        $super(uc);
        if (this.state) {
            switch (this.state) {
                case "moving":
                    switch (this.direction) {
                        case "N":
                            this.y-=this.mapSpeed;
                            this.spriteX = (Math.abs((((this.currentTile[1] * K.TILE_SIZE)-this.bottom())/K.TILE_SIZE)*3).floor()+2)%3;
                            if ((this.bottom()+1) % K.TILE_SIZE == 0) {
                                if (K.mapData[this.currentTile[1]][this.currentTile[0]].event) {
                                    K.mapData[this.currentTile[1]][this.currentTile[0]].event(this);
                                }
                                this.checkForInput();
                            }
                            break;
                        case "S":
                            this.y+=this.mapSpeed;
                            this.spriteX = (Math.abs((((this.currentTile[1] * K.TILE_SIZE)-this.bottom())/K.TILE_SIZE)*3).floor()+2)%3;
                            if ((this.bottom()+1) % K.TILE_SIZE == 0) {
                                if (K.mapData[this.currentTile[1]][this.currentTile[0]].event) {
                                    K.mapData[this.currentTile[1]][this.currentTile[0]].event(this);
                                }
                                this.checkForInput();
                            }
                            break;
                        case "W":
                            this.x-=this.mapSpeed;
                            this.spriteX = (Math.abs((((this.currentTile[0] * K.TILE_SIZE)-this.x)/K.TILE_SIZE)*3).floor()+1)%3;
                            if (this.x % K.TILE_SIZE == 0) {
                                if (K.mapData[this.currentTile[1]][this.currentTile[0]].event) {
                                    K.mapData[this.currentTile[1]][this.currentTile[0]].event(this);
                                }
                                this.checkForInput();
                            }
                            break;
                        case "E":
                            this.x+=this.mapSpeed;
                            this.spriteX = (Math.abs((((this.currentTile[0] * K.TILE_SIZE)-this.x)/K.TILE_SIZE)*3).floor()+1)%3;
                            if (this.x % K.TILE_SIZE == 0) {
                                if (K.mapData[this.currentTile[1]][this.currentTile[0]].event) {
                                    K.mapData[this.currentTile[1]][this.currentTile[0]].event(this);
                                }
                                this.checkForInput();
                            }
                            break;
                    }
                    break;
            }
        } else {
            this.checkForInput(uc);
        }
    },
    checkForInput: function() {
        this.state = null;
        if (this.__hasInput && SGF.Input.isKeyDown(SGF.Input.KEY_UP)) {
            this.spriteY = 1;
            this.direction = "N";
            var possibleTile =  $A(this.currentTile);
            possibleTile[1]--;
            if (K.isTilePassable(possibleTile)) {
                this.currentTile = possibleTile;
                this.state = "moving";
            }
        } else if (this.__hasInput && SGF.Input.isKeyDown(SGF.Input.KEY_DOWN)) {
            this.spriteY = 0;
            this.direction = "S";
            var possibleTile =  $A(this.currentTile);
            possibleTile[1]++;
            if (K.isTilePassable(possibleTile)) {
                this.currentTile = possibleTile;
                this.state = "moving";
            }
        } else if (this.__hasInput && SGF.Input.isKeyDown(SGF.Input.KEY_LEFT)) {
            this.spriteY = 2;
            this.direction = "W";
            var possibleTile =  $A(this.currentTile);
            possibleTile[0]--;
            if (K.isTilePassable(possibleTile)) {
                this.currentTile = possibleTile;
                this.state = "moving";
            }
        } else if (this.__hasInput && SGF.Input.isKeyDown(SGF.Input.KEY_RIGHT)) {
            this.spriteY = 3;
            this.direction = "E";
            var possibleTile =  $A(this.currentTile);
            possibleTile[0]++;
            if (K.isTilePassable(possibleTile)) {
                this.currentTile = possibleTile;
                this.state = "moving";
            }
        }
    }
});
