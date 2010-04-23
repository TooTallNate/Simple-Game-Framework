Number.prototype.constrain = function(n1, n2) {
    var min = (n1 < n2) ? n1 : n2,
        max = (n1 < n2) ? n2 : n1,
        num = Number(this);
    if (num < min) num = min;
    if (num > max) num = max;
    return num;
}

SGF.Screen.color = "000001";

K = {};

K.TILE_SIZE = 16;

K.kefkaSpriteset = new SGF.Spriteset("kefka.gif", 16, 24);
K.cavehouse = new SGF.Spriteset("cavehouse.gif", 16, 16);

SGF.log(K.kefkaSpriteset.src + " begin loading");
K.kefkaSpriteset.observe("load", function(e) {
    SGF.log(this.src + " loaded");
});
SGF.log(K.cavehouse.src + " begin loading");
K.cavehouse.observe("load", function(e) {
    SGF.log(this.src + " loaded");
});



K.Kefka = Class.create(SGF.Sprite, {
    initialize: function($super) {
        $super(K.kefkaSpriteset, {
            spriteX:1,
            spriteY:0,
            width: K.kefkaSpriteset.spriteWidth,
            height: K.kefkaSpriteset.spriteHeight,
            zIndex:10
        });
        this.mapSpeed = 2;
        this.currentTile = [10,6];
        //this.previousTile = null;
        this.state = null;
        this.direction = "S";
        this.x = this.currentTile[0] * K.TILE_SIZE;
        this.y = (this.currentTile[1] * K.TILE_SIZE) - (this.height - K.TILE_SIZE);
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
        if (SGF.Input.isKeyDown(SGF.Input.KEY_UP)) {
            this.spriteY = 1;
            this.direction = "N";
            var possibleTile =  $A(this.currentTile);
            possibleTile[1]--;
            if (!K.isTilePassable(possibleTile)) {
                //SGF.log("block");
            } else {
                //this.previousTile = this.currentTile;
                this.currentTile = possibleTile;
                this.state = "moving";
            }
        } else if (SGF.Input.isKeyDown(SGF.Input.KEY_DOWN)) {
            this.spriteY = 0;
            this.direction = "S";
            var possibleTile =  $A(this.currentTile);
            possibleTile[1]++;
            if (!K.isTilePassable(possibleTile)) {
                //SGF.log("block");
            } else {
                //this.previousTile = this.currentTile;
                this.currentTile = possibleTile;
                this.state = "moving";
            }
        } else if (SGF.Input.isKeyDown(SGF.Input.KEY_LEFT)) {
            this.spriteY = 2;
            this.direction = "W";
            var possibleTile =  $A(this.currentTile);
            possibleTile[0]--;
            if (!K.isTilePassable(possibleTile)) {
                //SGF.log("block");
            } else {
                //this.previousTile = this.currentTile;
                this.currentTile = possibleTile;
                this.state = "moving";
            }
        } else if (SGF.Input.isKeyDown(SGF.Input.KEY_RIGHT)) {
            this.spriteY = 3;
            this.direction = "E";
            var possibleTile =  $A(this.currentTile);
            possibleTile[0]++;
            if (!K.isTilePassable(possibleTile)) {
                //SGF.log("block");
            } else {
                //this.previousTile = this.currentTile;
                this.currentTile = possibleTile;
                this.state = "moving";
            }
        }
    }
});

K.kefka = new K.Kefka();


K.mapContainer = new SGF.DumbContainer([]);
K.mapContainer.width = K.TILE_SIZE * 20;
K.mapContainer.height = K.TILE_SIZE * 15;

K.mapData=
[   //  0       1       2       3       4       5       6       7       8       9       10      11      12      13      14      15      16      17      18      19
/*0 */[[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[22,01],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09]],
/*1 */[[19,01],[19,01],[19,01],[19,01],[19,01],[19,01],[19,01],[19,01],[19,01],[20,01],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09]],
/*2 */[[19,02],[19,02],[19,02],[19,02],[19,02],[18,04],[19,04],[20,04],[19,02],[20,02],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09]],
/*3 */[[19,02],[19,02],[19,02],[19,02],[19,02],[18,05],[19,05],[20,05],[19,02],[20,02],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09]],
/*4 */[[19,03],[19,03],[19,03],[19,03],[19,03],[18,06],[19,06],[20,06],[19,03],[20,03],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09]],
/*5 */[[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09]],
/*6 */[[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09]],
/*7 */[[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09]],
/*8 */[[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09]],
/*9 */[[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09]],
/*10*/[[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09]],
/*11*/[[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09]],
/*12*/[[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09]],
/*13*/[[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09]],
/*14*/[[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09]]
];
K.mapData.each(function(row, i) {
    row.each(function(tile, j) {
        tile.passable = true;
        tile.sprite = new SGF.Sprite(K.cavehouse, {
            width: 16, height: 16,
            x: j*K.TILE_SIZE,
            y: i*K.TILE_SIZE,
            spriteX: tile[0],
            spriteY: tile[1]
        });
        //t.update = null;
        K.mapContainer.addComponent(tile.sprite);
    });
});

// Mark certain tiles as non-passable by coordinate
[[0,4],[1,4],[2,4],[3,4],[4,4],[5,4],[7,4],[8,4],[9,4],[9,0],[9,1],[9,2],[9,3]].each(function(coord){
    K.mapData[coord[1]][coord[0]].passable = false;
});

K.mapData[4][6].event = function() {
    //SGF.log("entered cave");
    var black = new SGF.Rectangle({
        width: K.mapContainer.width,
        height: K.mapContainer.height,
        zIndex:99999,
        opacity:0
    });
    black.update = function() {
        this.opacity += .05;
        if (this.opacity > 1) {
            this.opacity = 1;
            this.update = Prototype.emptyFunction;
        }
    }
    K.gameContainer.addComponent(black);
}

K.isTilePassable = function(coords) {
    if (coords[1]>=0 && K.mapData.length > coords[1]) {
        if (coords[0]>=0 && K.mapData[coords[1]].length > coords[0]) {
            return K.mapData[coords[1]][coords[0]].passable;
        }
    }
    return false;
};

K.gameContainer = new SGF.Container([K.kefka, K.mapContainer],{
    width: K.mapContainer.width,
    height: K.mapContainer.height
});
K.gameContainer.update = K.gameContainer.update.wrap(function($super, uc) {
    $super(uc);
    var sw = SGF.Screen.width, sh = SGF.Screen.height;
    this.x = this.width < sw ? (sw/2)-(this.width/2) : ((-K.kefka.x - (K.kefka.width/2)) + (sw/2)).constrain(sw-this.width, 0);
    this.y = this.height < sh ? (sh/2)-(this.height/2) : ((-K.kefka.y - (K.kefka.height/2)) + (sh/2)).constrain(sh-this.height, 0);
});


SGF.Game.current.addComponent(K.gameContainer);
SGF.Screen.useNativeCursor("none");



// STATS PRINTOUT
K.label = new SGF.Label({
    width: 400,
    height: 150,
    size:10,
    //align:SGF.Label.CENTER,
    font: new SGF.Font("Comic Sans MS"),
    update: function() {
        //this.width = SGF.Screen.width;
        var g = SGF.Game.current;
        if (g.updateCount%2===0)
            this.setText(
                "Updates Processed:\t" + g.updateCount + "\n"+
                "Frames Rendered:\t" + g.renderCount + "\n" +
                "Frames / Second:\t" + ((g.renderCount/((new Date).getTime() - g.startTime))*1000).toFixed(2) + "\n" +
                "Updates / Second:\t" + ((g.updateCount/((new Date).getTime() - g.startTime))*1000).toFixed(2));
    }
});
SGF.Game.current.addComponent(K.label);
