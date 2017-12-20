import {Cell} from "../Cell";
import {SCALE} from "../game_state/Play";
import {Building} from "./Building";
import {Tank} from "../unit/Tank";
import {Player} from "../player/Player";

export class Power extends Phaser.Sprite implements Building {
    private animationElec: Phaser.Animation;
    private cellPosition: PIXI.Point;
    private minerals: number = 0;
    private player: Player;
    private group: Phaser.Group;

    constructor(game: Phaser.Game, x: number, y: number, group: Phaser.Group, player: Player) {
        super(game, Cell.cellToReal(x), Cell.cellToReal(y), 'Factory2');

        this.group = group;
        this.player = player;
        this.cellPosition = new PIXI.Point(x, y);
        this.scale.setTo(SCALE);
        this.anchor.setTo(1/4, 1/6);
        this.animationElec = this.animations.add('toto', [0,1,2,3,4,5,8,9,10,11,12,11,10,9,8,5,4,3,2,1]);
        this.animationElec.play(10, true, false);

        group.add(this);
    }

    addMinerals(loading: number) {
        this.minerals += loading;
    }

    getCellPositions(): PIXI.Point[] {
        return [
            this.cellPosition,
            new PIXI.Point(this.cellPosition.x + 1, this.cellPosition.y),
            new PIXI.Point(this.cellPosition.x, this.cellPosition.y + 1),
            new PIXI.Point(this.cellPosition.x + 1, this.cellPosition.y + 1),
            new PIXI.Point(this.cellPosition.x, this.cellPosition.y + 2),
            new PIXI.Point(this.cellPosition.x + 1, this.cellPosition.y + 2),
        ];
    }

    build(unit: string): void {
        let tank = new Tank(
            this.player,
            this.x,
            this.y,
            this.group
        );
        this.player.getUnitRepository().add(tank);
    }
}