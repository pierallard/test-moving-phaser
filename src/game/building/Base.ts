import {Cell} from "../Cell";
import {SCALE} from "../game_state/Play";
import {ConstructableBuilding} from "./ConstructableBuilding";
import {Unit} from "../unit/Unit";
import {Harvester} from "../unit/Harvester";
import {Player} from "../player/Player";

export class Base extends ConstructableBuilding {
    private animationPump: Phaser.Animation;
    private animationElec: Phaser.Animation;
    private minerals: number = 0;
    private group: Phaser.Group;

    constructor(game: Phaser.Game, x: number, y: number, group: Phaser.Group, player: Player) {
        super(game, Cell.cellToReal(x), Cell.cellToReal(y), 'Base');

        this.player = player;
        this.group = group;
        this.cellPosition = new PIXI.Point(x, y);
        this.scale.setTo(SCALE);
        this.anchor.setTo(1 / 6, 1 / 6);
        this.animationPump = this.animations.add('toto', [0, 1, 2, 3, 2, 1]);
        this.animationElec = this.animations.add('toto', [5, 6, 7]);
        this.animationElec.play(10, true, false);

        group.add(this);
    }

    addMinerals(loading: number) {
        this.minerals += loading;
    }

    private buildHarvester(): Unit {
        return new Harvester(
            this.player,
            this.x,
            this.y,
            this.group
        );
    }
}
