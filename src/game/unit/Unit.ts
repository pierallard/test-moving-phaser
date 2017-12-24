import {AStar, Path} from "../AStar";
import {Player} from "../player/Player";
import {State} from "../state/State";
import {Stand} from "../state/Stand";
import {Attack} from "../state/Attack";
import {Follow} from "../state/Follow";
import {MoveAttack} from "../state/MoveAttack";
import {UnitSprite} from "../sprite/UnitSprite";
import {Distance} from "../Distance";
import {UnitProperties} from "./UnitProperties";
import {WorldKnowledge} from "../WorldKnowledge";

export abstract class Unit {
    protected life: number;
    protected maxLife: number;
    protected unitSprite: UnitSprite;
    protected state: State;
    protected player: Player;
    protected worldKnowledge: WorldKnowledge;
    private pathCache: Path;
    private goalCache: PIXI.Point;
    private cellPosition: PIXI.Point;
    private isFreezed: boolean = false;
    private selected: boolean = false;
    private key: string;
    private timerEvents: Phaser.Timer;

    constructor(worldKnowledge: WorldKnowledge, cellPosition: PIXI.Point, player: Player, key: string) {
        this.worldKnowledge = worldKnowledge;
        this.cellPosition = cellPosition;
        this.player = player;
        this.state = new Stand(this);
        this.key = key;
    }

    create(game: Phaser.Game, group: Phaser.Group) {
        this.unitSprite = new UnitSprite(game, group, this.cellPosition, this.key);
        this.timerEvents = game.time.events;
    }

    update(): void {
        if (!this.isFreezed) {
            this.state = this.state.getNextStep();
            this.state.run();
        }
    }

    getCellPositions(): PIXI.Point[] {
        return [this.cellPosition];
    }

    getPlayer(): Player {
        return this.player;
    }

    getShootDistance(): number {
        return UnitProperties.getShootDistance(this.constructor.name);
    }

    isAlive(): boolean {
        return this.life > 0;
    }

    isSelected(): boolean {
        return this.selected;
    }

    shoot(ennemy: Unit): void {
        this.unitSprite.doShoot(ennemy.getCellPositions()[0]);
        ennemy.lostLife(10);
        this.freeze(UnitProperties.getShootTime(this.constructor.name) * Phaser.Timer.SECOND);
    }

    lostLife(life: number) {
        this.life -= life;
        if (!this.isAlive()) {
            this.unitSprite.doDestroy();
            this.worldKnowledge.removeUnit(this);
        }

        this.unitSprite.updateLife(this.life, this.maxLife);
    }

    getClosestShootable(): Unit {
        const enemies = this.player.getEnemyUnits();
        let minDistance = null;
        let closest = null;
        for (let i = 0; i < enemies.length; i++) {
            const enemy = (<Unit> enemies[i]);
            if (enemy !== this) {
                const distance = Distance.to(this.cellPosition, enemy.getCellPositions());
                if (distance <= this.getShootDistance()) {
                    if (null === closest || minDistance > distance) {
                        minDistance = distance;
                        closest = enemy;
                    }
                }
            }
        }

        return closest;
    }

    moveTowards(goal: PIXI.Point) {
        if (goal !== this.goalCache) {
            this.goalCache = null;
            this.pathCache = null;
        }
        let nextStep = null;
        if (this.pathCache) {
            if (this.pathCache.isStillAvailable(this.getPlayer().isPositionAccessible.bind(this.getPlayer()))) {
                nextStep = this.pathCache.splice();
            }
        }
        if (!nextStep) {
            const newPath = AStar.getPath(
                this.cellPosition,
                goal,
                this.getPlayer().isPositionAccessible.bind(this.getPlayer())
            );
            if (null !== newPath) {
                this.pathCache = newPath;
                this.goalCache = goal;
                nextStep = this.pathCache.splice();
            }
        }

        if (nextStep) {
            this.cellPosition = nextStep;
            this.unitSprite.doMove(
                nextStep,
                UnitProperties.getSlownessTime(this.constructor.name) * Phaser.Timer.SECOND
            );
            this.freeze(UnitProperties.getSlownessTime(this.constructor.name) * Phaser.Timer.SECOND);
        }
    }

    setSelected(value: boolean = true) {
        this.selected = value;
        this.unitSprite.setSelected(value);
    }

    updateStateAfterclick(cell: PIXI.Point) {
        const unit = this.worldKnowledge.getUnitAt(cell);
        if (null !== unit) {
            if (this.getPlayer() !== unit.getPlayer()) {
                this.state = new Attack(this, unit);
            } else {
                this.state = new Follow(this, unit);
            }
        } else {
            this.state = new MoveAttack(this, cell);
        }
    }

    isInside(left: number, right: number, top: number, bottom: number): boolean {
        return this.unitSprite.isInside(left, right, top, bottom);
    }

    protected freeze(time: number) {
        this.isFreezed = true;
        this.timerEvents.add(time, () => {
            this.isFreezed = false;
        }, this);
    }
}
