Number.prototype.constrain = function(n1, n2) {
    var min = (n1 < n2) ? n1 : n2,
        max = (n1 < n2) ? n2 : n1,
        num = Number(this);
    if (num < min) num = min;
    if (num > max) num = max;
    return num;
}

K.Map = Class.create(SGF.Container, {
    initialize: function($super) {
        var layerData = $A(arguments), layerContainers = [], i=0; j=0; l=0, xLen = 0, yLen = 0;
        layerData.shift();
        this.spriteset = layerData.shift();


        for (i=0; i<layerData.length; i++) {
            var tiles = [], layer = layerData[i];
            yLen = layer.length;
            xLen = layer[0].length;

            for (j=0; j<yLen; j++) {
                for (l=0; l<xLen; l++) {

                    layer[j][l] = new SGF.Sprite(this.spriteset, {
                        width: K.TILE_SIZE,
                        height: K.TILE_SIZE,
                        x: l*K.TILE_SIZE,
                        y: j*K.TILE_SIZE,
                        spriteX: layer[j][l][0],
                        spriteY: layer[j][l][1],
                        
                        // Non-standard props
                        passable:true,
                        tileX: l,
                        tileY: j
                    });
                    tiles.push(layer[j][l]);

                }
            }
            
            layerContainers.push(new SGF.DumbContainer(tiles, {
                width: K.TILE_SIZE * xLen,
                height: K.TILE_SIZE * yLen
            }));
        }
        this.layers = layerData;
        $super(layerContainers, {
            width: K.TILE_SIZE * xLen,
            height: K.TILE_SIZE * yLen
        });
    }
});
