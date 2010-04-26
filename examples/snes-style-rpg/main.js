// First set the background color to a solid black
SGF.Screen.color = "000001";

// We'll use the 'K' object for our namespace
K = {};

// All tiles are 16x16
K.TILE_SIZE = 16;

// The mouse isn't used in this game, so we'll hide it
SGF.Screen.useNativeCursor("none");


// Here we begin loading all required external resources.
// 'allResourcesLoaded' gets called after they've all loaded.

// The 'loadingLabel' prints out the loading progress to the screen
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

// These two properties and function are responsible for screen notification
// of the loading progress to the user
K.resourcesLoaded = 0;
K.numResources = 6;
function resourceLoaded(e) {
    //SGF.log(e);
    K.resourcesLoaded++;
    SGF.log(K.resourcesLoaded + " / " + K.numResources + " resources loaded!");
    K.loadingLabel.setText(K.resourcesLoaded + " / " + K.numResources + " resources loaded!");
    if (K.resourcesLoaded === K.numResources) {
        SGF.Game.current.removeComponent(K.loadingLabel);
        allResourcesLoaded.defer();
    }
}

// Start actually loading resources, calling 'resourceLoaded' after each one loads
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




function allResourcesLoaded() {
    var map = getOutside();

    // 'kefka' is our Character instance for the player
    K.kefka = new K.Character(K.kefkaSpriteset);
    K.kefka.hasInput(true);
    K.kefka.teleport(10, 6);
    K.map.addComponent(K.kefka);


    // 'fader' is a black rectangle that is used to fade the screen in and out
    K.fader = new SGF.Rectangle({
        width: K.map.width,
        height: K.map.height,
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



    K.isTilePassable = function(coords) {
        if (coords[1]>=0 && K.currentMap.layers[0].length > coords[1]) {
            if (coords[0]>=0 && K.currentMap.layers[0][coords[1]].length > coords[0]) {
                for (var i=0; i < K.currentMap.layers.length; i++) {
                    if (!K.currentMap.layers[i][coords[1]][coords[0]].passable)
                        return false;
                }
                return true;
            }
        }
        return false;
    };
    
    K.characterOnTile = function(character) {
        for (var i=0; i < K.currentMap.layers.length; i++) {
            if (K.currentMap.layers[i][character.currentTile[1]][character.currentTile[0]].event) {
                K.currentMap.layers[i][character.currentTile[1]][character.currentTile[0]].event(character);
            }
        }
    }

    // Create a simple NPC to talk to and perform random movement
    K.npc = new K.Character(K.kefkaSpriteset);
    K.npc.update = K.npc.update.wrap(function($super, uc) {
        $super(uc);
        if (uc % 30 === 0)
            switch((Math.random()*8).floor()) {
                case 0:
                    this.faceNorth();
                    break;
                case 1:
                    this.faceSouth();
                    break;
                case 2:
                    this.faceEast();
                    break;
                case 3:
                    this.faceWest();
                    break;
                case 4:
                    this.stepNorth();
                    break;
                case 5:
                    this.stepSouth();
                    break;
                case 6:
                    this.stepEast();
                    break;
                case 7:
                    this.stepWest();
                    break;
            }
    });
    K.npc.teleport(5, 8);
    map.addComponent(K.npc);



    K.currentMap = map;
    SGF.Game.current.addComponent(map);
    
}




// Gets the K.Map instance for the outside world. Function aviods recreating
// the instance unnecessarily
function getOutside() {
    if (arguments.callee.done) return K.map;
    arguments.callee.done = true;
    
    K.map= new K.Map(K.cavehouse,
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
    ]);
    
    // Mark certain tiles as non-passable by coordinate
    [[0,4],[1,4],[2,4],[3,4],[4,4],[5,4],[7,4],[8,4],[9,4],[9,0],[9,1],[9,2],[9,3]].each(function(coord){
        K.map.layers[0][coord[1]][coord[0]].passable = false;
    });
    
    K.map.layers[0][4][6].event = caveEntered;

    K.map.update = K.map.update.wrap(function($super, uc) {
        $super(uc);
        var sw = SGF.Screen.width, sh = SGF.Screen.height;
        this.x = this.width < sw ? (sw/2)-(this.width/2) : ((-K.kefka.x - (K.kefka.width/2)) + (sw/2)).constrain(sw-this.width, 0);
        this.y = this.height < sh ? (sh/2)-(this.height/2) : ((-K.kefka.y - (K.kefka.height/2)) + (sh/2)).constrain(sh-this.height, 0);
    });

    SGF.log("created outside!");
    return K.map;
}




// Gets the K.Map instance for the inside of the cave, creating the instance
// the first time it gets called
function getCave() {
    if (arguments.callee.done) return K.cave;
    arguments.callee.done = true;


    K.cave = new K.Map(K.inside,
    [     //  0       1       2       3       4       5       6       7       8       9       10      11      12      13      14      15      16
    /*0 */[[07,14],[07,15],[07,15],[07,15],[07,15],[07,15],[07,15],[07,15],[07,15],[07,15],[07,15],[07,15],[07,15],[07,15],[07,15],[07,15],[07,14]],
    /*1 */[[08,14],[12,00],[13,00],[14,00],[15,00],[12,00],[13,00],[14,00],[16,00],[12,00],[13,00],[14,00],[15,00],[14,05],[16,12],[17,12],[06,14]],
    /*2 */[[08,14],[12,01],[13,01],[14,01],[15,01],[12,01],[13,01],[14,01],[16,01],[12,01],[13,01],[14,01],[15,01],[14,06],[16,13],[17,13],[06,14]],
    /*3 */[[08,14],[12,02],[13,02],[14,02],[15,02],[12,02],[13,02],[14,02],[16,02],[12,02],[13,02],[14,02],[15,02],[14,07],[16,14],[17,14],[06,14]],
    /*4 */[[08,14],[01,10],[01,10],[01,10],[01,10],[01,10],[01,10],[01,10],[01,10],[01,10],[01,10],[01,10],[01,10],[01,10],[16,15],[17,15],[06,14]],
    /*5 */[[08,14],[01,10],[01,10],[01,10],[01,10],[01,10],[01,10],[01,10],[01,10],[01,10],[01,10],[01,10],[01,10],[01,10],[01,10],[01,10],[06,14]],
    /*6 */[[08,14],[01,10],[01,10],[01,10],[01,10],[01,10],[01,10],[01,10],[01,10],[01,10],[01,10],[01,10],[01,10],[01,10],[01,10],[01,10],[06,14]],
    /*7 */[[08,14],[01,10],[01,10],[01,10],[01,10],[01,10],[01,10],[01,10],[01,10],[01,10],[01,10],[01,10],[03,09],[04,09],[05,09],[01,10],[06,14]],
    /*8 */[[07,14],[07,13],[07,13],[07,13],[07,13],[07,13],[07,13],[07,13],[07,13],[07,13],[07,13],[07,13],[07,13],[07,13],[07,13],[07,13],[07,14]]
    ]);

    [[1,3],[2,3],[3,3],[4,3],[5,3],[6,3],[7,3],[8,3],[9,3],[10,3],[11,3],[12,3],
     [13,3],[14,3],[15,3],[16,3],[16,4],[16,5],[16,6],[16,7],[16,8],[15,8],[14,8],
     [13,8],[12,8],[11,8],[10,8],[9,8],[8,8],[7,8],[6,8],[5,8],[4,8],[3,8],[2,8],
     [1,8],[0,8],[0,7],[0,6],[0,5],[0,4],[0,3]].each(function(coord){
        K.cave.layers[0][coord[1]][coord[0]].passable = false;
    });

    K.cave.layers[0][7][12].event = caveExited;
    K.cave.layers[0][7][13].event = caveExited;
    K.cave.layers[0][7][14].event = caveExited;


    K.cave.update = K.cave.update.wrap(function($super, uc) {
        $super(uc);
        var sw = SGF.Screen.width, sh = SGF.Screen.height;
        this.x = this.width < sw ? (sw/2)-(this.width/2) : ((-K.kefka.x - (K.kefka.width/2)) + (sw/2)).constrain(sw-this.width, 0);
        this.y = this.height < sh ? (sh/2)-(this.height/2) : ((-K.kefka.y - (K.kefka.height/2)) + (sh/2)).constrain(sh-this.height, 0);
    });

    SGF.log("created cave!");
    return K.cave;
}




// Called when the player enters the cave
function caveEntered(character) {
    //SGF.log("entered cave");

    K.kefka.hasInput(false);

    K.fader.update = K.fader.fadeIn;
    K.fader.done = function() {

        var cave = getCave();


        cave.addComponent(K.kefka);
        cave.addComponent(K.fader);

        K.fader.update = K.fader.fadeOut;

        K.fader.done = function() {
            cave.removeComponent(this);
        }

        K.currentMap = cave;
        SGF.Game.current.addComponent(cave);
        SGF.Game.current.removeComponent(K.map);

        K.kefka.teleport(13,7);
        K.kefka.stepNorth();
        K.kefka.hasInput(true);
    }

    K.map.addComponent(K.fader);
}




// Called when the player exits the inside area
function caveExited(character) {

    K.kefka.hasInput(false);

    K.fader.update = K.fader.fadeIn;
    K.fader.done = function() {

        var map = getOutside();

        map.addComponent(K.kefka);
        map.addComponent(K.fader);

        K.fader.update = K.fader.fadeOut;

        K.fader.done = function() {
            map.removeComponent(this);
        }

        K.currentMap = map;
        SGF.Game.current.addComponent(map);
        SGF.Game.current.removeComponent(K.cave);

        K.kefka.teleport(6,4);
        K.kefka.stepSouth();
        K.kefka.hasInput(true);
    }

    K.cave.addComponent(K.fader);
}




// STATS PRINTOUT
K.label = new SGF.Label({
    width: 400,
    height: 150,
    size:10,
    //align:SGF.Label.CENTER,
    font: new SGF.Font("Comic Sans MS"),
    zIndex:5000,
    update: function() {
        //this.width = SGF.Screen.width;
        var g = SGF.Game.current;
        if (g.updateCount%2===0)
            this.setText(
                "Updates Processed:\t" + g.updateCount + "\n" +
                "Frames Rendered:\t" + g.renderCount + "\n" +
                "Frames / Second:\t" + ((g.renderCount/((new Date).getTime() - g.startTime))*1000).toFixed(2) + "\n" +
                "Updates / Second:\t" + ((g.updateCount/((new Date).getTime() - g.startTime))*1000).toFixed(2));
    }
});
SGF.Game.current.addComponent(K.label);
