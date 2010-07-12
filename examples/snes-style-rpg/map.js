(function() {
    Number.prototype.constrain = function(n1, n2) {
        var min = (n1 < n2) ? n1 : n2,
            max = (n1 < n2) ? n2 : n1,
            num = Number(this);
        if (num < min) num = min;
        if (num > max) num = max;
        return num;
    }
    var Container = SGF.require("container"),
        DumbContainer = SGF.require("dumbcontainer"),
        Sprite = SGF.require("sprite");

    K.Map = Class.create(Container, {
        initialize: function($super) {
            var layerData = $A(arguments), layerContainers = [], i=0; j=0; l=0, xLen = 0, yLen = 0;
            layerData.shift();
            this.spriteset = layerData.shift();


            for (i=0; i<layerData.length; i++) {
                var tiles = [], layer = layerData[i],
                    yLen = layer.length,
                    xLen = layer[0].length;

                for (j=0; j<yLen; j++) {
                    for (l=0; l<xLen; l++) {

                        layer[j][l] = new Sprite(this.spriteset, {
                            width: K.TILE_SIZE,
                            height: K.TILE_SIZE,
                            x: l*K.TILE_SIZE,
                            y: j*K.TILE_SIZE,
                            spriteX: layer[j][l][0],
                            spriteY: layer[j][l][1],
                        
                            // Non-standard props
                            passable: true,
                            tileX: l,
                            tileY: j
                        });
                        tiles.push(layer[j][l]);

                    }
                }
            
            
                layerContainers.push(new DumbContainer(tiles, {
                    width: K.TILE_SIZE * xLen,
                    height: K.TILE_SIZE * yLen
                }));
            }
            this.layers = layerData;
            this.characters = [];
            $super(layerContainers, {
                width: K.TILE_SIZE * xLen,
                height: K.TILE_SIZE * yLen
            });
        },
        addComponent: function($super, component) {
            $super(component);
            if (component instanceof K.Character) {
                this.characters.push(component);
            }
        },
        removeComponent: function($super, component) {
            $super(component);        
        },
        isTilePassable: function(character, coords) {
            if (coords[1]>=0 && this.layers[0].length > coords[1]) {
                if (coords[0]>=0 && this.layers[0][coords[1]].length > coords[0]) {
                    // Check for non-passable tiles on the map
                    for (var i=0; i < this.layers.length; i++) {
                        if (!this.layers[i][coords[1]][coords[0]].passable) {
                            return false;
                        }
                    }
                    // Check for any NPCs on the map
                    for (var i=0; i<this.characters.length; i++) {
                        if (this.characters[i] === character) {
                            continue;
                        }
                        var tile = this.characters[i].currentTile;
                        if (tile[0] === coords[0] && tile[1] === coords[1]) {
                            return false;
                        }
                    }
                    return true;
                }
            }
            return false;
        },
        actionEvent: function(character, coords) {
            for (var i=0; i<this.characters.length; i++) {
                var other = this.characters[i];
                if (other === character) {
                    continue;
                }
                if (other.currentTile[0] === coords[0] && other.currentTile[1] === coords[1]) {
                    if (other.actionEvent)
                        other.actionEvent(character);
                }
            }
        },
        characterOnTile: function(character) {
            for (var i=0; i < this.layers.length; i++) {
                if (this.layers[i][character.currentTile[1]][character.currentTile[0]].event) {
                    this.layers[i][character.currentTile[1]][character.currentTile[0]].event(character);
                }
            }
        }
    });
})();