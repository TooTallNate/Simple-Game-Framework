P.Viewport = new (Class.create(SGF.Container, {
    initialize: function($super, levelData) {
        var levelContainer = new SGF.Container(), bg = new SGF.Rectangle();


        this.direction = -.01;
        
        levelContainer.addComponent(bg);
        levelContainer.zIndex = 0;

        levelData.each(function(rowData, i) {
            rowData.each(function(cell, j) {
                if (cell == 0) {
                    levelContainer.addComponent(new SGF.Rectangle({
                        width: P.TILE_WIDTH,
                        height: P.TILE_HEIGHT,
                        x: j * P.TILE_WIDTH,
                        y: i * P.TILE_HEIGHT,
                        color: "000077"
                        //update:null
                    }));
                } else if (cell == 1) {
                    levelContainer.addComponent(new SGF.Rectangle({
                        width: 3,
                        height: 3,
                        x: (j * P.TILE_WIDTH) + ((P.TILE_WIDTH-3)/2),
                        y: (i * P.TILE_HEIGHT) + ((P.TILE_HEIGHT-3)/2),
                        color: "FFFFFF"
                        //update:null
                    }));
                } else if (cell == 2) {
                    levelContainer.addComponent(new SGF.Rectangle({
                        width: 6,
                        height: 6,
                        x: (j * P.TILE_WIDTH) + ((P.TILE_WIDTH-6)/2),
                        y: (i * P.TILE_HEIGHT) + ((P.TILE_HEIGHT-6)/2),
                        color: "FFFFFF"
                        //update:null
                    }));
                }
            });
        });
        //levelContainer.components.each(function(c) {
        //    c.update = c.update = null;
        //});

        $super([P.Pacman, levelContainer], {
            width: levelData.first().size() * P.TILE_WIDTH,
            height: levelData.size() * P.TILE_HEIGHT,
            updateChildren: true
        });
        levelContainer.width = bg.width = this.width;
        levelContainer.height = bg.height = this.height;

        //this.rotation = 1 * (Math.PI/180);
    },
    update: function($super, updateCount) {
        $super(updateCount);
        this.x = (SGF.Screen.width/2) - (this.width/2);
        this.y = (SGF.Screen.height/2) - (this.height/2);
        //this.opacity += this.direction;
        if (this.opacity <= 0 || this.opacity >= 1) {
            this.direction = -this.direction;
        }
        this.rotation = ((this.rotation*(180/Math.PI))+.01).toRadians();
    }
}))(
    [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,0],
        [0,1,0,0,0,0,1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,0,0,0,1,0],
        [0,2,0,0,0,0,1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,0,0,0,2,0],
        [0,1,0,0,0,0,1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,0,0,0,1,0],
        [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    ]
);

