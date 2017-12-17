import Play from "../game_state/Play";
import {UnitRepository} from "../repository/UnitRepository";

const SIZE = 200;

export class Minimap {
    private graphics: Phaser.Graphics;
    private unitRepository: UnitRepository;

    constructor(play: Play, unitRepository: UnitRepository, group: Phaser.Group) {
        this.unitRepository = unitRepository;

        let map = new Phaser.Tilemap(play.game, 'basicmap');
        map.addTilesetImage('GrasClif', 'GrasClif');
        map.addTilesetImage('GrssMisc', 'GrssMisc');
        let layer = map.createLayer('layer');
        let scale = SIZE / Math.max(map.widthInPixels, map.heightInPixels);
        layer.scale.setTo(scale, scale);

        group.add(layer);

        this.graphics = new Phaser.Graphics(play.game);
        this.graphics.scale.set(1 / scale, 1 / scale);

        group.add(this.graphics);
    }

    update() {
        this.graphics.clear();
        this.unitRepository.getUnits().forEach((unit) => {
            this.graphics.beginFill(unit.getPlayer().getColor());
            unit.getCellPositions().forEach((cellPosition) => {
                this.graphics.drawRect(cellPosition.x, cellPosition.y, 1, 1);
            });
        });
    }
}
