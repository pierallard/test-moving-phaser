import {Selector} from "../Selector";
import {Ground} from "../map/Ground";
import {Player} from "../player/Player";
import {WorldKnowledge} from "../WorldKnowledge";
import {UserInterface} from "../UserInterface";
import {BuildingPositionner} from "../BuildingPositionner";

export const SCALE = 2;
export const MOVE = 3 * SCALE;
export const PANEL_WIDTH = 80;

export default class Play extends Phaser.State {
    private unitBuildingGroup: Phaser.Group;
    private selector: Selector;
    private players: Player[];
    private ground: Ground;
    private upKey: Phaser.Key;
    private downKey: Phaser.Key;
    private leftKey: Phaser.Key;
    private rightKey: Phaser.Key;
    private zKey: Phaser.Key;
    private sKey: Phaser.Key;
    private qKey: Phaser.Key;
    private dKey: Phaser.Key;
    private worldKnowledge: WorldKnowledge;
    private userInterface: UserInterface;
    private buildingPositionner: BuildingPositionner;

    constructor() {
        super();

        this.worldKnowledge = new WorldKnowledge(this.game);
        this.players = [
            new Player(this.worldKnowledge, 0, 0x00ff00),
            new Player(this.worldKnowledge, 1, 0xff00ff),
        ];
        this.selector = new Selector(this.worldKnowledge.getUnitRepository(), this.players[0]);
        this.buildingPositionner = new BuildingPositionner(this.worldKnowledge);
        this.userInterface = new UserInterface(this.worldKnowledge, this.players[0], this.buildingPositionner);
    }

    public create() {
        this.worldKnowledge.create();
        this.selector.create(this.game);
        this.userInterface.create(this.game);

        this.world.setBounds(0, 0, this.worldKnowledge.getGroundWidth(), this.worldKnowledge.getGroundHeight());

        this.game.camera.bounds.setTo(
            0,
            0,
            this.ground.getGroundWidth() + PANEL_WIDTH * SCALE,
            this.ground.getGroundHeight()
        );

        this.registerInputs();
    }

    update() {
        this.worldKnowledge.update();
        this.userInterface.update();

        if (this.upKey.isDown || this.zKey.isDown) {
            this.game.camera.setPosition(this.game.camera.position.x, this.game.camera.position.y - MOVE);
        } else if (this.downKey.isDown || this.sKey.isDown) {
            this.game.camera.setPosition(this.game.camera.position.x, this.game.camera.position.y + MOVE);
        }

        if (this.leftKey.isDown || this.qKey.isDown) {
            this.game.camera.setPosition(this.game.camera.position.x - MOVE, this.game.camera.position.y);
        } else if (this.rightKey.isDown || this.dKey.isDown) {
            this.game.camera.setPosition(this.game.camera.position.x + MOVE, this.game.camera.position.y);
        }

        this.unitBuildingGroup.sort('y');
    }

    private registerInputs() {
        this.upKey = this.game.input.keyboard.addKey(Phaser.Keyboard.UP);
        this.downKey = this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        this.leftKey = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        this.rightKey = this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        this.zKey = this.game.input.keyboard.addKey(Phaser.Keyboard.Z);
        this.sKey = this.game.input.keyboard.addKey(Phaser.Keyboard.S);
        this.qKey = this.game.input.keyboard.addKey(Phaser.Keyboard.Q);
        this.dKey = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
    }
}
