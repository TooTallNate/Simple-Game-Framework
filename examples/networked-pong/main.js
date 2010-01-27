/**
 * Networked Pong
 * --------------
 * This is an example of a use of the Networking API. It is a two player classic
 * pong game, that requires the use of two game clients (one of which needs to
 * be able to host a server).
 *
 * To run, first start the game client that can launch the server (Java, for
 * example) and start the "Networked Pong" game. The game detects that the game
 * client can run a server and allows for that option in the beginning. Click
 * "Wait for Another Player" to start the server on port 8080. The game now
 * waits for an SGF.Client to try to join the game.
 *
 * Now start another instance of "Networked Pong". This time press "Join Game".
 * When the Client connects to the Server (hard-coded here as 'localhost'), the
 * game will start. Use the left and right buttons to move in either direction,
 * and try to hit the ball back to the other player.
 *
 * This is a simple game, but it shows how networking is possible with the
 * Networking API. In a real world scenario, the server the client tries to
 * connect to would not be hard-coded as 'localhost', but possibly configurable
 * in-game, or hard-coded to your dedicated game server address.
 *
 * Now go build that awesome MMO you've been dying to make!
 */

Pong = {};
Pong.FIXED_WIDTH  = 400;
Pong.FIXED_HEIGHT = 300;

Pong.BG = new SGF.Rectangle({
    color: "FFFFFF",
    width: Pong.FIXED_WIDTH,
    height: Pong.FIXED_HEIGHT,
    zIndex: 0
});

Pong.Ball = Class.create(SGF.Rectangle, {
    initialize: function($super) {
        $super();
    }
});

Pong.Paddle = Class.create(SGF.Rectangle, {
    initialize: function($super) {
        $super({
            width: 70,
            height: 12,
            zIndex: 1
        });
        this.x = (Pong.FIXED_WIDTH / 2) - (this.width / 2);
    }
});

Pong.PlayerPaddle = Class.create(Pong.Paddle, {
    initialize: function($super) {
        $super();
        this.color = "FF0000";
        this.y = Pong.FIXED_HEIGHT - this.height - 1;
        this.lastSentX = -1;
    },
    update: function($super) {
        $super();

        if (Pong.gameStarted) {
            if (SGF.Input.isKeyDown(SGF.Input.KEY_LEFT)) {
                this.x-=3;
            } else if (SGF.Input.isKeyDown(SGF.Input.KEY_RIGHT)) {
                this.x+=3;
            }

            if (Pong.conn && (this.x != this.lastSentX)) {
                try {
                    Pong.conn.send(this.x);
                } catch (ex) {
                    SGF.log(ex);
                }
                this.lastSentX = this.x;
            }
        }
    }
});

Pong.RemotePaddle = Class.create(Pong.Paddle, {
    initialize: function($super) {
        $super();
        this.color = "0000FF";
        this.y = 1;
    }
});


Pong.overlay = new SGF.Rectangle({
    color: "000000",
    width: Pong.FIXED_WIDTH,
    height: Pong.FIXED_HEIGHT,
    opacity: .5,
    zIndex: 100
});

Pong.Button = Class.create(SGF.Rectangle, {
    
});

Pong.start = function() {
    Pong.gameStarted = true;
    SGF.log("starting Pong!");
    SGF.Game.current.removeComponent(Pong.overlay);
};

Pong.stop = function() {
    Pong.gameStarted = false;
    SGF.log("stopping Pong!");
    SGF.Game.current.addComponent(Pong.overlay);
}

Pong.Client = Class.create(SGF.Client, {
    initialize: function($super) {
        $super("ws://localhost:8080", {
            autoconnect: true
        });
    },
    onOpen: function() {
        Pong.start();

        this.paddle = new Pong.RemotePaddle();
        SGF.Game.current.addComponent(this.paddle);

    },
    onClose: function() {
        Pong.stop();

        SGF.Game.current.removeComponent(this.paddle);
        this.paddle = null;
    },
    onMessage: function(message) {
        this.paddle.x = Pong.FIXED_WIDTH - this.paddle.width - parseInt(message);
    }
});

if (SGF.Server.canServe) {
    Pong.Server = Class.create(SGF.Server, {
        initialize: function($super) {
            $super({
                port: 8080,
                autostart: true
            });
        },
        onClientOpen: function(c) {
            // Only allow one connection at a time, close everything else
            if (this.connections().length > 1) {
                c.close();
                return;
            }

            Pong.start();

            this.paddle = new Pong.RemotePaddle();
            SGF.Game.current.addComponent(this.paddle);
        },
        onClientClose: function(c) {
            Pong.stop();

            SGF.Game.current.removeComponent(this.paddle);
            this.paddle = null;
        },
        onClientMessage: function(c, message) {
            this.paddle.x = Pong.FIXED_WIDTH - this.paddle.width - parseInt(message);
        },
        send: function(message) {
            this.connections()[0].send(message);
        }
    });
}



Pong.gameStarted = false;
SGF.Game.current.addComponent(Pong.BG);
SGF.Game.current.addComponent(new Pong.PlayerPaddle());
SGF.Game.current.addComponent(Pong.overlay);

if (SGF.Server.canServe) {
    Pong.conn = new Pong.Server();
} else {
    Pong.conn = new Pong.Client();
}
