// First set the background color to a solid black
SGF.Screen.color = "000001";

// We'll use the 'K' object for our namespace
K = {};

// All tiles are 16x16
K.TILE_SIZE = 16;


// Here we begin loading all required external resources.
// 'allResourcesLoaded' gets called after they've all loaded.
SGF.Game.current.loadScript("map.js", resourceLoaded);
SGF.Game.current.loadScript("character.js", resourceLoaded);

K.kefkaSpriteset = new SGF.Spriteset("kefka.gif", 16, 24);
K.cavehouse = new SGF.Spriteset("cavehouse.gif", 16, 16);
K.inside = new SGF.Spriteset("inside.gif", 16, 16);
K.dialog = new SGF.Spriteset("dialog.gif", 7, 7);

K.kefkaSpriteset.observe("load", resourceLoaded);
K.cavehouse.observe("load", resourceLoaded);
K.inside.observe("load", resourceLoaded);
K.dialog.observe("load", resourceLoaded);

K.resourcesLoaded = 0;
K.numResources = 6;
function resourceLoaded() {
    K.resourcesLoaded++;
    SGF.log(K.resourcesLoaded + " / " + K.numResources + " resources loaded!");
    K.loadingLabel.setText(K.resourcesLoaded + " / " + K.numResources + " resources loaded!");
    if (K.resourcesLoaded === K.numResources) {
        SGF.Game.current.removeComponent(K.loadingLabel);
        allResourcesLoaded();
    }
}
K.loadingLabel = new SGF.Label({
    width: 100,
    height: 50,
    align:SGF.Label.CENTER
});
K.loadingLabel.update = K.loadingLabel.update.wrap(function($super, uc) {
    $super(uc);
    var sw = SGF.Screen.width, sh = SGF.Screen.height;
    this.x = (sw/2)-(this.width/2);
    this.y = (sh/2)-(this.height/2);
});
SGF.Game.current.addComponent(K.loadingLabel);



function allResourcesLoaded() {


    // 'kefka' is our Character instance for the player
    K.kefka = new K.Character(K.kefkaSpriteset);
    K.kefka.hasInput(true);
    K.kefka.teleport(10, 6);


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

    K.fader = new SGF.Rectangle({
        width: K.mapContainer.width,
        height: K.mapContainer.height,
        zIndex: 99999,
        opacity: 0
    });
    K.fader.fadeIn = function() {
        this.opacity += .05;
        if (this.opacity > 1) {
            this.opacity = 1;
            this.done();
        }
    }
    K.fader.fadeOut = function() {
        this.opacity -= .05;
        if (this.opacity < 0) {
            this.opacity = 0;
            this.done();
        }        
    }


    K.mapData[4][6].event = function() {
        //SGF.log("entered cave");

        K.fader.update = K.fader.fadeIn;
        K.fader.done = function() {

            var cave = getCave();

            cave.addComponent(K.kefka);
            cave.addComponent(K.fader);

            K.fader.update = K.fader.fadeOut;

            K.fader.done = function() {
                SGF.log("fade complete!");
                this.parent.removeComponent(this);
            }

            SGF.Game.current.addComponent(cave);
            SGF.Game.current.removeComponent(K.gameContainer);
        }

        K.gameContainer.addComponent(K.fader);
    }

    K.isTilePassable = function(coords) {
        if (coords[1]>=0 && K.mapData.length > coords[1]) {
            if (coords[0]>=0 && K.mapData[coords[1]].length > coords[0]) {
                return K.mapData[coords[1]][coords[0]].passable;
            }
        }
        return false;
    };

    function getCave() {
        if (arguments.callee.done) return K.caveContainer;
        arguments.callee.done = true;


        K.caveData=
        [     //  0       1       2       3       4       5       6       7       8       9       10      11      12      13      14      15      16      17      18      19
        /*0 */[[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[22,01],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09]],
        /*1 */[[19,01],[19,01],[19,01],[19,01],[19,01],[19,01],[19,01],[19,01],[19,01],[20,01],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09]],
        /*2 */[[19,02],[19,02],[19,02],[19,02],[19,02],[18,04],[19,04],[20,04],[19,02],[20,02],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09]],
        /*3 */[[19,02],[19,02],[19,02],[19,02],[19,02],[18,05],[19,05],[20,05],[19,02],[20,02],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09]],
        /*4 */[[19,03],[19,03],[19,03],[19,03],[19,03],[18,06],[19,06],[20,06],[19,03],[20,03],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09]],
        /*5 */[[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09]],
        /*6 */[[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09]],
        /*7 */[[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09]],
        /*8 */[[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09]],
        /*9 */[[01,09],[11,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09]],
        /*10*/[[01,09],[11,09],[01,12],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09]],
        /*11*/[[01,09],[11,09],[01,10],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09]],
        /*12*/[[01,09],[11,09],[01,12],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09]],
        /*13*/[[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09]],
        /*14*/[[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09],[01,09]]
        ];

        K.caveTileContainer = new SGF.DumbContainer([]);
        K.caveTileContainer.width = K.TILE_SIZE * K.caveData[0].length;
        K.caveTileContainer.height = K.TILE_SIZE * K.caveData.length;

        K.caveData.each(function(row, i) {
            row.each(function(tile, j) {
                tile.passable = true;
                tile.sprite = new SGF.Sprite(K.inside, {
                    width: K.TILE_SIZE, height: K.TILE_SIZE,
                    x: j*K.TILE_SIZE,
                    y: i*K.TILE_SIZE,
                    spriteX: tile[0],
                    spriteY: tile[1]
                });
                K.caveTileContainer.addComponent(tile.sprite);
            });
        });

        K.caveContainer = new SGF.Container([K.caveTileContainer],{
            width: K.caveTileContainer.width,
            height: K.caveTileContainer.height
        });
        K.caveContainer.update = K.caveContainer.update.wrap(function($super, uc) {
            $super(uc);
            var sw = SGF.Screen.width, sh = SGF.Screen.height;
            this.x = this.width < sw ? (sw/2)-(this.width/2) : ((-K.kefka.x - (K.kefka.width/2)) + (sw/2)).constrain(sw-this.width, 0);
            this.y = this.height < sh ? (sh/2)-(this.height/2) : ((-K.kefka.y - (K.kefka.height/2)) + (sh/2)).constrain(sh-this.height, 0);
        });

        SGF.log("Created cave!");
        return K.caveContainer;
    }

    K.npc = new K.Character(K.kefkaSpriteset);
    K.npc.teleport(5, 8);


    K.gameContainer = new SGF.Container([K.npc, K.kefka, K.mapContainer],{
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
    //SGF.Screen.useNativeCursor("none");
    
}




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
