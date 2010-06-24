var Container = SGF.require("Container");
var DumbContainer = SGF.require("DumbContainer");
var Sprite = SGF.require("Sprite");
var Label = SGF.require("Label");
var Font = SGF.require("Font");

K.Dialog = Class.create(Container, {
    initialize: function($super, text) {
        var layer = [
            [[0,0],[1,0],[1,0],[1,0],[1,0],[1,0],[1,0],[1,0],[1,0],[1,0],[1,0],[2,0]],
            [[0,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[2,1]],
            [[0,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[2,1]],
            [[0,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[2,1]],
            [[0,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[1,1],[2,1]],
            [[0,2],[1,2],[1,2],[1,2],[1,2],[1,2],[1,2],[1,2],[1,2],[1,2],[1,2],[2,2]]
        ], i=0; j=0; l=0, xLen = 0, yLen = 0;


        var tiles = [];
        yLen = layer.length;
        xLen = layer[0].length;

        for (j=0; j<yLen; j++) {
            for (l=0; l<xLen; l++) {
                //if (j == 4 && l == 4) continue;
                layer[j][l] = new Sprite(K.dialog, {
                    width: 7,
                    height: 7,
                    x: l*7,
                    y: j*7,
                    spriteX: layer[j][l][0],
                    spriteY: layer[j][l][1],
                });
                tiles.push(layer[j][l]);

            }
        }

        var bg = new DumbContainer(tiles, {
            width: 7 * xLen,
            height: 7 * yLen
        });
        
        var t = new Label({
            width: bg.width - 14,
            height: bg.height - 14,
            x: 7,
            y: 7,
            size: 12,
            font: new Font("Courier New")
        });
        t.setText(text);

        $super([bg, t], {
            width: 7 * xLen,
            height: 7 * yLen
        });
    }
});
