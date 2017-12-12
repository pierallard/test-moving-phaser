/// <reference path="../lib/phaser.d.ts"/>

import Boot from "./game/state/Boot";
import Preload from "./game/state/Preload";
import Play from "./game/state/Play";

class SimpleGame extends Phaser.Game {

    constructor()
    {
        super(
            1024,
            576,
            Phaser.AUTO, // Open GL for effect / shader ?
            'content',
            null,
            false,
            false,
            false,
        );

        this.antialias = false;
        this.state.add('Boot', Boot);
        this.state.add('Preload', Preload);
        this.state.add('Play', Play);
        this.state.start('Boot');
    }
}

window.onload = () => {
    new SimpleGame();
};