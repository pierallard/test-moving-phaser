import {Unit} from "./Unit";
import {Player} from "../player/Player";
import {UnitProperties} from "./UnitProperties";
import {WorldKnowledge} from "../WorldKnowledge";
import {MoveAttack} from "../state/MoveAttack";

export class Tank extends Unit {
    constructor(worldKnowledge: WorldKnowledge, cellPosition: PIXI.Point, player: Player) {
        super(
            worldKnowledge,
            cellPosition,
            player,
            UnitProperties.getSprite(Tank.prototype.constructor.name, player.getId())
        );

        this.life = this.maxLife = UnitProperties.getLife(Tank.prototype.constructor.name);
    }

    orderMoveAttack(goal: PIXI.Point): void {
        this.state = new MoveAttack(this.worldKnowledge, this, goal);
    }
}
