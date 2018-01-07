import {BuildingRepository} from "../repository/BuildingRepository";
import {Player, START_POWER} from "../player/Player";
import {Building} from "../building/Building";
import {Unit} from "../unit/Unit";
import {UnitRepository} from "../repository/UnitRepository";
import {Appear} from "../sprite/Appear";
import {GeneratedGround} from "./GeneratedGround";
import {Shootable} from "../Shootable";
import {MiniAppear} from "../sprite/MiniAppear";
import {TiberiumPlant} from "../sprite/TiberiumPlant";
import {BuildingProperties} from "../building/BuildingProperties";
import {UnitCreator} from "../creator/UnitCreator";
import {BuildingCreator} from "../creator/BuildingCreator";
import {ProductionStatus} from "../creator/AbstractCreator";
import {Fog} from "../Fog";

export class WorldKnowledge {
    private game: Phaser.Game;
    private ground: GeneratedGround;
    private groundGroup: Phaser.Group;
    private unitBuildingGroup: Phaser.Group;
    private effectsGroup: Phaser.Group;
    private unitRepository: UnitRepository;
    private buildingRepository: BuildingRepository;
    private unitCreators: UnitCreator[];
    private buildingCreators: BuildingCreator[];
    private players: Player[];
    private groundRepository: TiberiumPlant[];
    private fogs: Fog[];
    private fogGroup: Phaser.Group;

    constructor() {
        this.ground = new GeneratedGround();
        this.unitRepository = new UnitRepository();
        this.buildingRepository = new BuildingRepository();
        this.groundRepository = [];
        this.unitCreators = [];
        this.buildingCreators = [];
        this.players = [];
        this.fogs = [];
    }

    create(game: Phaser.Game, startPositions: PIXI.Point[], player: Player) {
        this.game = game;
        this.ground.create(this.game, startPositions);

        this.groundGroup = this.game.add.group();
        this.groundGroup.fixedToCamera = false;

        this.unitBuildingGroup = this.game.add.group();
        this.unitBuildingGroup.fixedToCamera = false;

        this.effectsGroup = this.game.add.group();
        this.effectsGroup.fixedToCamera = false;

        this.unitCreators.forEach((unitCreator) => {
            unitCreator.create(game);
        });
        this.buildingCreators.forEach((buildingCreator) => {
            buildingCreator.create(game);
        });

        this.fogGroup = this.game.add.group();

        this.fogs.forEach((fog) => {
            fog.create(game, this.fogGroup, fog.getPlayer() === player);
        });
    }

    update() {
        this.unitBuildingGroup.sort('y');
        this.unitRepository.getUnits().forEach((unit) => {
            unit.update();
        });
        this.buildingRepository.getBuildings().forEach((building) => {
            building.update();
        });
        this.fogs.forEach((fog) => {
            fog.update();
        });
    }

    isCellAccessible(position: PIXI.Point) {
        return this.ground.isCellAccessible(position) &&
            this.unitRepository.isCellNotOccupied(position) &&
            this.buildingRepository.isCellNotOccupied(position);
    }

    getGroundWidth() {
        return this.ground.getGroundWidth();
    }

    getGroundHeight() {
        return this.ground.getGroundHeight();
    }

    addBuilding(newBuilding: Building, appear: boolean = false) {
        this.buildingRepository.add(newBuilding);
        newBuilding.create(this.game, this.unitBuildingGroup, this.effectsGroup);
        if (appear) {
            newBuilding.setVisible(false);
            let appearSprite = new Appear(newBuilding.getCellPositions()[0]);
            appearSprite.create(this.game, this.unitBuildingGroup);
            this.game.time.events.add(Phaser.Timer.SECOND * 1.2, () => {
                newBuilding.setVisible(true);
            }, this);
        }
    }

    addUnit(newUnit: Unit, appear: boolean = false) {
        this.unitRepository.add(newUnit);
        newUnit.create(this.game, this.unitBuildingGroup, this.effectsGroup);
        if (appear) {
            newUnit.setVisible(false);
            let appearSprite = new MiniAppear(newUnit.getCellPositions()[0]);
            appearSprite.create(this.game, this.unitBuildingGroup);
            this.game.time.events.add(Phaser.Timer.SECOND * 2, () => {
                newUnit.setVisible(true);
            }, this);
        }
    }

    removeUnit(unit: Unit, delay: number = 0) {
        if (delay === 0) {
            this.unitRepository.removeUnit(unit);
        } else {
            this.game.time.events.add(delay, () => {
                this.unitRepository.removeUnit(unit);
            });
        }
    }

    getUnitAt(cell: PIXI.Point) {
        return this.unitRepository.unitAt(cell);
    }

    getBuildingAt(cell: PIXI.Point) {
        return this.buildingRepository.buildingAt(cell);
    }

    getGroundAt(cell: PIXI.Point): TiberiumPlant {
        for (let i = 0; i < this.groundRepository.length; i++) {
            if (this.groundRepository[i].getCellPositions()[0].x === cell.x &&
                this.groundRepository[i].getCellPositions()[0].y === cell.y) {
                return this.groundRepository[i];
            }
        }

        return null;
    }

    getUnits() {
        return this.unitRepository.getUnits();
    }

    getBuildings() {
        return this.buildingRepository.getBuildings();
    }

    getSelectedUnits() {
        return this.unitRepository.getSelectedUnits();
    }

    getPlayerBuildings(player: Player, type: string = null): Building[] {
        return this.buildingRepository.getBuildings(type).filter((building) => {
            return building.getPlayer() === player;
        });
    }

    getEnemyBuildings(player: Player, type: string = null): Building[] {
        return this.buildingRepository.getBuildings(type).filter((building) => {
            return building.getPlayer() !== null && building.getPlayer() !== player;
        });
    }

    getPlayerUnits(player: Player, type: string = null): Unit[] {
        return this.unitRepository.getUnits(type).filter((unit) => {
            return unit.getPlayer() === player;
        });
    }

    getEnemyUnits(player: Player, type: string = null): Unit[] {
        return this.unitRepository.getUnits(type).filter((unit) => {
            return unit.getPlayer() !== null && unit.getPlayer() !== player;
        });
    }

    getCreatorOf(buildingName: string, player: Player): Building {
        const creators = this.buildingRepository.getCreatorOf(buildingName).filter((building) => {
            return building.getPlayer() === player;
        });
        return creators.length > 0 ? creators[0] : null;
    }

    getEnemies(player: Player): (Shootable)[] {
        let result = [];
        this.getEnemyUnits(player).forEach((unit) => {
            result.push(unit);
        });
        this.getEnemyBuildings(player).forEach((building) => {
            result.push(building);
        });

        return result;
    }

    removeBuilding(building: Building) {
        this.buildingRepository.removeBuilding(building);
    }

    getGroundCSV() {
        return this.ground.getCSV();
    }

    addGroundElement(newPlant: TiberiumPlant) {
        this.groundGroup.add(newPlant);
        this.groundRepository.push(newPlant);
    }

    getGrounds(): TiberiumPlant[] {
        return this.groundRepository;
    }

    getPlayerNeededPower(player: Player): number {
        return -this.getPlayerBuildings(player).reduce((power, building) => {
            return power + Math.min(0, BuildingProperties.getPower(building.constructor.name));
        }, 0);
    }

    getPlayerProvidedPower(player: Player): number {
        return START_POWER + this.getPlayerBuildings(player).reduce((power, building) => {
            return power + Math.max(0, BuildingProperties.getPower(building.constructor.name));
        }, 0);
    }

    addPlayer(player: Player) {
        this.players.push(player);
        this.unitCreators.push(player.getUnitCreator());
        this.buildingCreators.push(player.getBuildingCreator());
        this.fogs.push(new Fog(this, player));
    }

    getPlayers(): Player[] {
        return this.players;
    }

    productUnit(player: Player, unitName: string) {
        this.getPlayerUnitCreator(player).orderProduction(unitName);
    }

    productBuilding(player: Player, unitName: string) {
        this.getPlayerBuildingCreator(player).orderProduction(unitName);
    }

    isBuildingProduced(player: Player, buildingName: string) {
        return this.getPlayerBuildingCreator(player).isProduced(buildingName);
    }

    runBuildingCreation(player: Player, buildingName: string, cell: PIXI.Point) {
        this.getPlayerBuildingCreator(player).runCreation(buildingName, cell);
    }

    getPlayerAllowedBuildings(player: Player): string[] {
        return this.getPlayerBuildingCreator(player).getAllowedBuildings();
    }

    getPlayerAllowedUnits(player: Player) {
        return this.getPlayerUnitCreator(player).getAllowedUnits();
    }

    getBuildingProductionStatus(player: Player): ProductionStatus {
        return this.getPlayerBuildingCreator(player).getProductionStatus();
    }

    canProductBuilding(player: Player, buildingName: string) {
        return this.getPlayerBuildingCreator(player).canProduct(buildingName);
    }

    getUnitProductionStatus(player: Player) {
        return this.getPlayerUnitCreator(player).getProductionStatus();
    }

    canProductUnit(player: Player, unitName: string) {
        return this.getPlayerUnitCreator(player).canProduct(unitName);
    }

    holdBuilding(player: Player, itemName: string) {
        return this.getPlayerBuildingCreator(player).hold(itemName);
    }

    holdUnit(player: Player, itemName: string) {
        return this.getPlayerUnitCreator(player).hold(itemName);
    }

    isBuildingProducing(player: Player, itemName: string) {
        return this.getPlayerBuildingCreator(player).isProducing(itemName);
    }

    isBuildingHold(player: Player, itemName: string) {
        return this.getPlayerBuildingCreator(player).isHold(itemName);
    }

    isUnitHold(player: Player, itemName: string) {
        return this.getPlayerUnitCreator(player).isHold(itemName);
    }

    isUnitProducing(player: Player, itemName: string) {
        return this.getPlayerUnitCreator(player).isProducing(itemName);
    }

    cancelBuilding(player: Player, itemName: string) {
        return this.getPlayerBuildingCreator(player).cancel(itemName);
    }

    cancelUnit(player: Player, itemName: string) {
        return this.getPlayerUnitCreator(player).cancel(itemName);
    }

    private getPlayerUnitCreator(player: Player): UnitCreator {
        return this.unitCreators.filter((unitCreator) => {
            return unitCreator.getPlayer() === player;
        })[0];
    }

    private getPlayerBuildingCreator(player: Player): BuildingCreator {
        return this.buildingCreators.filter((buildingCreator) => {
            return buildingCreator.getPlayer() === player;
        })[0];
    }
}
