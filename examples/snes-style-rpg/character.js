var Sprite = SGF.require("sprite");
var Input = SGF.require("input");

K.Character = Class.create(Sprite, {
    initialize: function($super, spriteset) {
        $super(spriteset, {
            spriteX:1,
            spriteY:0,
            width: spriteset.spriteWidth,
            height: spriteset.spriteHeight,
            zIndex:10
        });
        this.moveQueue = [];
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
                                this.parent.characterOnTile(this);
                                this.checkForInput();
                            }
                            break;
                        case "S":
                            this.y+=this.mapSpeed;
                            this.spriteX = (Math.abs((((this.currentTile[1] * K.TILE_SIZE)-this.bottom())/K.TILE_SIZE)*3).floor()+2)%3;
                            if ((this.bottom()+1) % K.TILE_SIZE == 0) {
                                this.parent.characterOnTile(this);
                                this.checkForInput();
                            }
                            break;
                        case "W":
                            this.x-=this.mapSpeed;
                            this.spriteX = (Math.abs((((this.currentTile[0] * K.TILE_SIZE)-this.x)/K.TILE_SIZE)*3).floor()+1)%3;
                            if (this.x % K.TILE_SIZE == 0) {
                                this.parent.characterOnTile(this);
                                this.checkForInput();
                            }
                            break;
                        case "E":
                            this.x+=this.mapSpeed;
                            this.spriteX = (Math.abs((((this.currentTile[0] * K.TILE_SIZE)-this.x)/K.TILE_SIZE)*3).floor()+1)%3;
                            if (this.x % K.TILE_SIZE == 0) {
                                this.parent.characterOnTile(this);
                                this.checkForInput();
                            }
                            break;
                    }
                    break;
            }
        } else if (this.moveQueue.length > 0) {
            var action = this.moveQueue.shift();
            action.call(this);
        } else {
            this.checkForInput(uc);
        }
    },
    checkForInput: function() {
        this.state = null;
        if (this.__hasInput && K.input.isKeyDown(Input.KEY_UP)) {
            this.faceNorth();
            var possibleTile =  $A(this.currentTile);
            possibleTile[1]--;
            if (this.parent.isTilePassable(possibleTile)) {
                this.currentTile = possibleTile;
                this.state = "moving";
            }
        } else if (this.__hasInput && K.input.isKeyDown(Input.KEY_DOWN)) {
            this.faceSouth();
            var possibleTile =  $A(this.currentTile);
            possibleTile[1]++;
            if (this.parent.isTilePassable(possibleTile)) {
                this.currentTile = possibleTile;
                this.state = "moving";
            }
        } else if (this.__hasInput && K.input.isKeyDown(Input.KEY_LEFT)) {
            this.faceWest();
            var possibleTile =  $A(this.currentTile);
            possibleTile[0]--;
            if (this.parent.isTilePassable(possibleTile)) {
                this.currentTile = possibleTile;
                this.state = "moving";
            }
        } else if (this.__hasInput && K.input.isKeyDown(Input.KEY_RIGHT)) {
            this.faceEast();
            var possibleTile =  $A(this.currentTile);
            possibleTile[0]++;
            if (this.parent.isTilePassable(possibleTile)) {
                this.currentTile = possibleTile;
                this.state = "moving";
            }
        }
    },
    
    faceNorth: function() {
        this.spriteY = 1;
        this.direction = "N";
    },
    faceSouth: function() {
        this.spriteY = 0;
        this.direction = "S";
    },
    faceEast: function() {
        this.spriteY = 3;
        this.direction = "E";
    },
    faceWest: function() {
        this.spriteY = 2;
        this.direction = "W";
    },
    
    stepNorth: function() {
        this.moveQueue.push(function() {
            this.faceNorth();
            var possibleTile =  $A(this.currentTile);
            possibleTile[1]--;
            if (this.parent.isTilePassable(possibleTile)) {
                this.currentTile = possibleTile;
                this.state = "moving";
            }
        });
    },
    stepSouth: function() {
        this.moveQueue.push(function() {
            this.faceSouth();
            var possibleTile =  $A(this.currentTile);
            possibleTile[1]++;
            if (this.parent.isTilePassable(possibleTile)) {
                this.currentTile = possibleTile;
                this.state = "moving";
            }
        });
    },
    stepEast: function() {
        this.moveQueue.push(function() {
            this.faceEast();
            var possibleTile =  $A(this.currentTile);
            possibleTile[0]++;
            if (this.parent.isTilePassable(possibleTile)) {
                this.currentTile = possibleTile;
                this.state = "moving";
            }
        });
    },
    stepWest: function() {
        this.moveQueue.push(function() {
            this.faceWest();
            var possibleTile =  $A(this.currentTile);
            possibleTile[0]--;
            if (this.parent.isTilePassable(possibleTile)) {
                this.currentTile = possibleTile;
                this.state = "moving";
            }
        });        
    }
});
