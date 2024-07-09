// ==UserScript==
// @name         Session Saver client
// @namespace    http://tampermonkey.net/
// @version      -
// @description  NOT compatible with Sirr0m's session saver
// @author       rdm
// @match        zombs.io
// @match        localhost:1000
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zombs.io
// @require      https://raw.githubusercontent.com/dcodeIO/ByteBuffer.js/master/dist/bytebuffer.min.js
// @grant        none
// ==/UserScript==

// @Settings
const SESSION_SECRET_KEY = 'f07cbf563d19619ba4afe3ae1e2ec95710a72b3e';
const SESSION_DEFAULT_PORT = 727;

let PacketIds_1 = {
    default: {
        0: "PACKET_ENTITY_UPDATE",
        1: "PACKET_PLAYER_COUNTER_UPDATE",
        2: "PACKET_SET_WORLD_DIMENSIONS",
        3: "PACKET_INPUT",
        4: "PACKET_ENTER_WORLD",
        5: "PACKET_PRE_ENTER_WORLD",
        6: "PACKET_ENTER_WORLD2",
        7: "PACKET_PING",
        9: "PACKET_RPC",
        10: "PACKET_BLEND",
        PACKET_PRE_ENTER_WORLD: 5,
        PACKET_ENTER_WORLD: 4,
        PACKET_ENTER_WORLD2: 6,
        PACKET_ENTITY_UPDATE: 0,
        PACKET_INPUT: 3,
        PACKET_PING: 7,
        PACKET_PLAYER_COUNTER_UPDATE: 1,
        PACKET_RPC: 9,
        PACKET_SET_WORLD_DIMENSIONS: 2,
        PACKET_BLEND: 10,
    },
},
    e_AttributeType = {
        0: "Uninitialized",
        1: "Uint32",
        2: "Int32",
        3: "Float",
        4: "String",
        5: "Vector2",
        6: "EntityType",
        7: "ArrayVector2",
        8: "ArrayUint32",
        9: "Uint16",
        10: "Uint8",
        11: "Int16",
        12: "Int8",
        13: "Uint64",
        14: "Int64",
        15: "Double",
        Uninitialized: 0,
        Uint32: 1,
        Int32: 2,
        Float: 3,
        String: 4,
        Vector2: 5,
        EntityType: 6,
        ArrayVector2: 7,
        ArrayUint32: 8,
        Uint16: 9,
        Uint8: 10,
        Int16: 11,
        Int8: 12,
        Uint64: 13,
        Int64: 14,
        Double: 15,
    },
    e_ParameterType = { 0: "Uint32", 1: "Int32", 2: "Float", 3: "String", 4: "Uint64", 5: "Int64", Uint32: 0, Int32: 1, Float: 2, String: 3, Uint64: 4, Int64: 5 };

const staticJSONs = [
    {
        name: 'BuildingShopPrices',
        response: {
            json: '[{"Name":"Wall","Class":"PlayerObject","GoldCosts":[0,5,30,60,80,100,250,800],"WoodCosts":[2,0,0,0,0,0,0,0],"StoneCosts":[0,2,0,0,0,0,0,0],"TokenCosts":[0,0,0,0,0,0,0,0],"Width":47.99,"Height":47.99,"Health":[150,200,300,400,600,800,1500,2500],"MsBeforeRegen":[10000,10000,10000,10000,10000,10000,10000,10000],"HealthRegenPerSecond":[5,7,12,17,25,40,80,250]},{"Name":"GoldStash","Class":"GoldStash","GoldCosts":[0,5000,10000,16000,20000,32000,100000,400000],"WoodCosts":[0,0,0,0,0,0,0,0],"StoneCosts":[0,0,0,0,0,0,0,0],"TokenCosts":[0,0,0,0,0,0,0,0],"Width":95.99,"Height":95.99,"Health":[1500,1800,2300,3000,5000,8000,12000,20000],"MsBeforeRegen":[10000,10000,10000,10000,10000,10000,10000,10000],"HealthRegenPerSecond":[50,60,70,90,110,150,400,700]},{"Name":"GoldMine","Class":"GoldMine","GoldCosts":[0,200,300,600,800,1200,8000,30000],"WoodCosts":[5,15,25,35,45,55,700,1600],"StoneCosts":[5,15,25,35,45,55,700,1600],"TokenCosts":[0,0,0,0,0,0,0,0],"Width":95.99,"Height":95.99,"Health":[150,250,350,500,800,1400,1800,2800],"GoldPerSecond":[4,6,7,10,12,15,25,35],"MsBeforeRegen":[10000,10000,10000,10000,10000,10000,10000,10000],"HealthRegenPerSecond":[5,7,12,17,25,40,70,120]},{"Name":"Door","Class":"Door","GoldCosts":[0,10,50,70,150,200,400,800],"WoodCosts":[5,5,0,0,0,0,0,0],"StoneCosts":[5,5,0,0,0,0,0,0],"TokenCosts":[0,0,0,0,0,0,0,0],"Width":47.99,"Height":47.99,"Health":[150,200,300,500,700,1000,1500,2000],"MsBeforeRegen":[10000,10000,10000,10000,10000,10000,10000,1000],"HealthRegenPerSecond":[5,7,12,17,25,40,70,100]},{"Name":"CannonTower","Class":"Tower","GoldCosts":[0,100,200,600,1200,2000,8000,35000],"WoodCosts":[15,25,30,40,60,80,300,800],"StoneCosts":[15,25,40,50,80,120,300,800],"TokenCosts":[0,0,0,0,0,0,0,0],"TowerRadius":[500,500,500,500,600,600,600,600],"MsBetweenFires":[1000,769,625,500,400,350,250,250],"Height":95.99,"Width":95.99,"Health":[150,200,400,800,1200,1600,2200,3600],"MsBeforeRegen":[10000,10000,10000,10000,10000,10000,10000,10000],"HealthRegenPerSecond":[2,5,10,20,40,80,110,150],"DamageToZombies":[20,30,50,70,120,150,200,300],"DamageToPlayers":[5,5,6,6,7,7,8,8],"DamageToPets":[5,5,5,5,5,5,6,8],"DamageToNeutrals":[250,350,450,550,650,750,850,1000],"ProjectileLifetime":[1000,1000,1000,1000,1000,1000,1000,1000],"ProjectileVelocity":[60,65,70,70,75,80,100,140],"ProjectileName":"CannonProjectile","ProjectileAoe":[true,true,true,true,true,true,true,true],"ProjectileAoeRadius":[250,250,250,250,250,250,250,250],"ProjectileCollisionRadius":[10,10,10,10,10,10,10,10]},{"Name":"ArrowTower","Class":"ArrowTower","GoldCosts":[0,100,200,600,1200,2000,8000,35000],"WoodCosts":[5,25,30,40,50,70,300,800],"StoneCosts":[5,20,30,40,60,80,300,800],"TokenCosts":[0,0,0,0,0,0,0,0],"TowerRadius":[600,650,700,750,800,850,900,1000],"MsBetweenFires":[400,333,285,250,250,250,250,250],"Height":95.99,"Width":95.99,"Health":[150,200,400,800,1200,1600,2200,3600],"MsBeforeRegen":[10000,10000,10000,10000,10000,10000,10000,10000],"HealthRegenPerSecond":[2,5,10,20,40,80,110,150],"DamageToZombies":[20,40,70,120,180,250,400,500],"DamageToPlayers":[5,5,6,6,7,7,8,8],"DamageToPets":[5,5,5,5,5,5,6,6],"DamageToNeutrals":[250,350,450,550,650,750,850,1000],"ProjectileLifetime":[1300,1300,1300,1300,1300,1300,1300,1300],"ProjectileVelocity":[60,65,70,70,75,80,120,140],"ProjectileName":"ArrowProjectile","ProjectileAoe":[false,false,false,false,false,false,false,false],"ProjectileCollisionRadius":[10,10,10,10,10,10,10,10]},{"Name":"Harvester","Class":"Harvester","GoldCosts":[0,100,200,600,1200,2000,8000,10000],"WoodCosts":[5,25,30,40,50,70,300,600],"StoneCosts":[5,20,30,40,60,80,300,600],"TokenCosts":[0,0,0,0,0,0,0,0],"Height":95.99,"Width":95.99,"Health":[150,200,400,800,1200,1600,2200,2800],"MsBeforeRegen":[10000,10000,10000,10000,10000,10000,10000,10000],"HealthRegenPerSecond":[2,5,10,20,40,80,110,130],"HarvestAmount":[2.5,4.65,4.55,7.2,8.25,10,13.5,16],"HarvestCooldown":[1500,1400,1300,1200,1100,1000,900,800],"HarvestMax":[400,800,1200,1600,2000,2400,2800,3600],"HarvestRange":[300,300,300,300,300,300,300,300],"DepositCostPerMinute":[200,300,350,500,600,700,1200,1400],"DepositMax":[800,1200,1400,2000,2400,2800,4800,6000],"MaxYawDeviation":[70,70,70,70,70,70,70,70]},{"Name":"BombTower","Class":"Tower","GoldCosts":[0,100,200,600,1200,2000,8000,35000],"WoodCosts":[10,25,40,50,80,120,300,800],"StoneCosts":[10,25,40,50,80,120,300,800],"TokenCosts":[0,0,0,0,0,0,0,0],"TowerRadius":[1000,1000,1000,1000,1000,1000,1000,1000],"MsBetweenFires":[1000,1000,1000,1000,1000,1000,900,900],"Height":95.99,"Width":95.99,"Health":[150,200,400,800,1200,1600,2200,3600],"MsBeforeRegen":[10000,10000,10000,10000,10000,10000,10000,10000],"HealthRegenPerSecond":[2,5,10,20,40,80,110,150],"DamageToZombies":[30,60,100,140,200,600,1200,1600],"DamageToPlayers":[9,9,10,10,11,11,12,12],"DamageToPets":[10,10,10,10,10,10,10,10],"DamageToNeutrals":[250,350,450,550,650,750,850,1000],"ProjectileLifetime":[1000,1000,1000,1000,1000,1000,1000,1000],"ProjectileVelocity":[20,20,20,20,20,20,20,20],"ProjectileName":"BombProjectile","ProjectileAoe":[true,true,true,true,true,true,true,true],"ProjectileIgnoresCollisions":[true,true,true,true,true,true,true,true],"ProjectileAoeRadius":[250,250,250,250,250,250,250,250],"ProjectileCollisionRadius":[10,10,10,10,10,10,10,10],"ProjectileMaxRange":[1000,1000,1000,1000,1000,1000,1000,1000]},{"Name":"MagicTower","Class":"MagicTower","GoldCosts":[0,100,200,600,1200,2000,8000,35000],"WoodCosts":[15,25,40,50,70,100,300,800],"StoneCosts":[15,25,40,50,70,100,300,800],"TokenCosts":[0,0,0,0,0,0,0,0],"TowerRadius":[400,400,400,400,400,400,400,400],"MsBetweenFires":[800,800,700,600,500,400,300,300],"Height":95.99,"Width":95.99,"Health":[150,200,400,800,1200,1600,2200,3600],"MsBeforeRegen":[10000,10000,10000,10000,10000,10000,10000,10000],"HealthRegenPerSecond":[2,5,10,20,40,80,110,150],"DamageToZombies":[10,20,40,50,70,80,120,160],"DamageToPlayers":[5,5,5,6,6,6,7,7],"DamageToPets":[5,5,5,5,5,5,5,5],"DamageToNeutrals":[250,350,450,550,650,750,850,1000],"ProjectileLifetime":[500,500,500,500,500,500,500,500],"ProjectileVelocity":[45,45,45,45,45,45,45,45],"ProjectileName":"FireballProjectile","ProjectileAoe":[true,true,true,true,true,true,true,true],"ProjectileAoeRadius":[100,100,100,100,100,100,100,100],"ProjectileCollisionRadius":[10,10,10,10,10,10,10,10]},{"Name":"MeleeTower","Class":"MeleeTower","GoldCosts":[0,100,200,600,1200,2000,8000,35000],"WoodCosts":[10,25,30,40,50,70,300,800],"StoneCosts":[10,20,30,40,60,80,300,800],"TokenCosts":[0,0,0,0,0,0,0,0],"TowerRadius":[110,110,110,110,110,110,110,110],"MsBetweenFires":[400,333,285,250,250,250,250,250],"Height":95.99,"Width":95.99,"Health":[200,400,800,1200,1600,2200,4000,9000],"MsBeforeRegen":[10000,10000,10000,10000,10000,10000,10000,10000],"HealthRegenPerSecond":[2,5,10,20,40,80,220,350],"DamageToZombies":[80,120,200,280,500,1000,2000,3000],"DamageToPlayers":[5,6,7,8,9,10,11,12],"DamageToPets":[5,5,5,5,5,5,6,6],"DamageToNeutrals":[250,350,450,550,650,750,850,1000],"MaxYawDeviation":[30,30,30,30,30,30,30,30]},{"Name":"SlowTrap","Class":"Trap","GoldCosts":[0,100,200,400,600,800,1000,1500],"WoodCosts":[5,25,30,40,50,70,300,800],"StoneCosts":[5,20,30,40,60,80,300,800],"TokenCosts":[0,0,0,0,0,0,0,0],"Height":47.99,"Width":47.99,"Health":[150,200,400,800,1200,1600,2200,3000],"MsBeforeRegen":[10000,10000,10000,10000,10000,10000,10000,10000],"HealthRegenPerSecond":[2,5,10,20,40,80,110,150],"SlowDuration":[2500,2500,2500,3000,3000,3250,3500,4000],"SlowAmount":[0.4,0.45,0.5,0.55,0.6,0.65,0.7,0.7]}]'},
        opcode: 9
    },
    {
        name: 'ItemShopPrices',
        response: {
            json: '[{"Name":"Spear","Class":"MeleeWeapon","MsBetweenFires":[250,250,250,250,250,250,250],"DamageToZombies":[30,80,120,300,2000,8000,10000],"DamageToNeutrals":[50,80,100,200,250,400,600],"DamageToBuildings":[0.75,1.5,2.25,3,3.75,4.5,5.25],"DamageToPlayers":[15,16,17,18,20,22,22],"DamageToPets":[3,3.5,4,4.5,5,5.5,5.5],"GoldCosts":[1400,2800,5600,11200,22500,45000,90000],"StoneCosts":[0,0,0,0,0,0,0],"WoodCosts":[0,0,0,0,0,0,0],"TokenCosts":[0,0,0,0,0,0,0],"Range":[100,100,100,100,100,100,100],"MaxYawDeviation":[50,50,50,50,50,50,50]},{"Name":"Pickaxe","Class":"MeleeWeapon","MsBetweenFires":[300,300,285,250,200,200,200],"DamageToZombies":[20,20,20,20,20,20,20],"DamageToBuildings":[0,0,0,0,0,0,0],"DamageToPlayers":[0,0,0,0,0,0,0],"DamageToNeutrals":[10,10,10,10,10,10,10],"DamageToPets":[0,0,0,0,0,0,0],"GoldCosts":[0,1000,3000,6000,8000,24000,90000],"StoneCosts":[0,0,0,0,0,0,0],"WoodCosts":[0,0,0,0,0,0,0],"TokenCosts":[0,0,0,0,0,0,0],"Range":[100,100,100,100,100,100,100],"MaxYawDeviation":[70,70,70,70,70,70,70],"IsTool":true,"HarvestCount":[1,2,2,3,3,4,6]},{"Name":"Bow","Class":"RangedWeapon","DamageToZombies":[20,40,100,300,2400,10000,14000],"DamageToBuildings":[2,2.3,2.5,2.7,3,3,3],"DamageToPlayers":[22,24,26,28,30,32,32],"DamageToNeutrals":[50,100,150,200,250,400,700],"DamageToPets":[2,2.3,2.5,2.7,3,3,3],"GoldCosts":[100,400,2000,7000,24000,30000,90000],"StoneCosts":[0,0,0,0,0,0,0],"WoodCosts":[0,0,0,0,0,0,0],"TokenCosts":[0,0,0,0,0,0,0],"MsBetweenFires":[500,500,500,500,500,500,500],"ChargeTime":[150,150,150,150,150,150,150],"ProjectileVelocity":[100,100,100,100,100,100,100],"ProjectileName":"BowProjectile","ProjectileCollisionRadius":[10,10,10,10,10,10,10],"ProjectileLifetime":[550,550,550,550,550,550,550]},{"Name":"Bomb","Class":"RangedWeapon","GoldCosts":[100,400,3000,5000,24000,30000,90000],"DamageToNeutrals":[50,100,150,200,250,300,500],"StoneCosts":[0,0,0,0,0,0,0],"WoodCosts":[0,0,0,0,0,0,0],"TokenCosts":[0,0,0,0,0,0,0],"MsBetweenFires":[500,500,500,500,500,500,500],"DamageToZombies":[10,30,80,150,1200,6000,9000],"DamageToBuildings":[1,1,1,1,1,1,1],"DamageToPlayers":[20,22,24,26,28,30,30],"DamageToPets":[1,1,1,1,1,1,1],"ProjectileVelocity":[40,40,40,40,40,40,40],"ProjectileName":"BombProjectile","ProjectileCollisionRadius":[10,10,10,10,10,10,10],"ProjectileLifetime":[700,700,700,700,700,700,700],"ProjectileAoe":[true,true,true,true,true,true,true],"ProjectileAoeRadius":[50,50,50,50,50,50,50],"ProjectileIgnoresCollisions":[false,false,false,false,false,false,false],"ProjectileMaxRange":[700,700,700,700,700,700,700]},{"Name":"HealthPotion","Class":"HealthPotion","GoldCosts":[100],"StoneCosts":[0],"WoodCosts":[0],"TokenCosts":[0],"PurchaseCooldown":15000},{"Name":"ZombieShield","Class":"ZombieShield","GoldCosts":[1000,3000,7000,14000,18000,22000,24000,30000,45000,70000],"StoneCosts":[0,0,0,0,0,0,0,0,0,0],"WoodCosts":[0,0,0,0,0,0,0,0,0,0],"TokenCosts":[0,0,0,0,0,0,0,0,0,0],"Health":[500,1000,1800,4000,10000,20000,35000,50000,65000,85000],"RechargePerSecond":[50,100,200,400,1000,2000,3500,5000,6500,8500],"MsBeforeRecharge":[10000,9000,8000,7000,6000,6000,6000,6000,6000,6000]},{"Name":"Pause","Class":"Pause","GoldCosts":[10000],"StoneCosts":[0],"WoodCosts":[0],"TokenCosts":[0],"PurchaseCooldown":240000},{"Name":"PetMiner","Class":"Pet","GoldCosts":[0,0,0,0,0,0,0,0],"WoodCosts":[0,0,0,0,0,0,0,0],"StoneCosts":[0,0,0,0,0,0,0,0],"TokenCosts":[0,100,100,100,100,200,200,300],"CollisionRadius":25,"Health":[400,800,1500,3000,5000,8000,10000,16000],"MsBeforeRegen":[8000,8000,8000,8000,8000,8000,8000,8000],"HealthRegenPerSecond":[5,5,5,5,5,5,5,5],"Speed":[30,32,34,35,35,37,37,38],"DamageToNeutrals":[80,100,150,200,250,400,500,600],"HarvestCount":[1,1,2,2,3,3,4,4],"Ranged":[false,false,false,false,false,false,false,false],"CanAttackPlayers":[false,false,false,false,false,false,false,false],"CanMine":[true,true,true,true,true,true,true,true],"LeashRange":[500,500,500,500,500,500,500,500],"HarvestLeashRange":[0,0,0,0,0,0,0,0],"AttackRange":[80,80,80,80,80,80,80,80],"MsBetweenFires":[500,450,450,400,400,380,380,350],"EvolvesAtLevel":[0,8,16,24,32,48,64,96],"ExperienceFromMiningPerHalfSecond":[1,1,1,1,1,1,1,1]},{"Name":"PetCARL","Class":"Pet","GoldCosts":[0,0,0,0,0,0,0,0],"WoodCosts":[0,0,0,0,0,0,0,0],"StoneCosts":[0,0,0,0,0,0,0,0],"TokenCosts":[0,100,100,100,100,200,200,300],"CollisionRadius":25,"Health":[400,800,1500,3000,5000,8000,10000,16000],"MsBeforeRegen":[8000,8000,8000,8000,8000,8000,8000,8000],"HealthRegenPerSecond":[5,5,5,5,5,5,5,5],"Speed":[30,32,34,35,35,37,37,38],"DamageToNeutrals":[80,100,150,200,250,400,500,600],"Ranged":[false,false,false,false,false,false,false,false],"CanAttackPlayers":[true,true,true,true,true,true,true,true],"LeashRange":[500,500,500,500,500,500,500,500],"AttackRange":[80,80,80,80,80,80,80,80],"MsBetweenFires":[500,490,490,490,480,480,470,470],"ProjectileLifetime":[1000,1000,1000,1000,1000,1000,1000,1000],"ProjectileVelocity":[60,60,60,60,60,60,60,60],"ProjectileName":"PetCARLProjectile","ProjectileAoe":[true,true,true,true,true,true,true,true],"ProjectileAoeRadius":[250,250,250,250,250,250,250,250],"ProjectileCollisionRadius":[10,10,10,10,10,10,10,10],"DamageToZombies":[30,100,400,600,1000,3000,6000,8000],"DamageToPlayers":[30,31,32,33,34,35,36,37],"DamageToBuildings":[2,2,2,3,3,3,4,4],"EvolvesAtLevel":[0,8,16,24,32,48,64,96],"ExperienceFromZombies":[30,28,25,25,25,25,25,25],"ExperienceFromNeutrals":[30,28,25,25,25,25,25,25]},{"Name":"HatHorns","Class":"Hat","GoldCosts":[0],"WoodCosts":[0],"StoneCosts":[0],"TokenCosts":[0]},{"Name":"PetHealthPotion","Class":"PetHealthPotion","GoldCosts":[100],"StoneCosts":[0],"WoodCosts":[0],"TokenCosts":[0]},{"Name":"PetWhistle","Class":"PetWhistle","GoldCosts":[0],"StoneCosts":[0],"WoodCosts":[0],"TokenCosts":[0]},{"Name":"PetRevive","Class":"PetRevive","GoldCosts":[0],"StoneCosts":[0],"WoodCosts":[0],"TokenCosts":[0]}]'},
        opcode: 9
    },
    {
        name: 'Spells',
        response: {
            json: '[{"Name":"HealTowersSpell","VisualLifetime":10000,"VisualRadius":600,"Cooldown":[240000],"IsCooldownForParty":true,"Healing":[{"Type":"Tower","Amount":[50],"Over":[10000],"Radius":[600]}],"GoldCosts":[1000],"WoodCosts":[0],"StoneCosts":[0],"TokenCosts":[0]}]'},
        opcode: 9
    }
];

const codecJSON = '{"attributeMaps":{"667546015":[{"name":"position","type":5},{"name":"yaw","type":2},{"name":"health","type":3},{"name":"maxHealth","type":3},{"name":"damage","type":3},{"name":"height","type":3},{"name":"width","type":3},{"name":"collisionRadius","type":1},{"name":"model","type":4},{"name":"entityClass","type":4},{"name":"dead","type":1},{"name":"timeDead","type":3},{"name":"slowed","type":1},{"name":"stunned","type":1},{"name":"tier","type":1},{"name":"partyId","type":1},{"name":"lastPetDamage","type":3},{"name":"lastPetDamageTick","type":1},{"name":"lastPetDamageTarget","type":1},{"name":"firingTick","type":1},{"name":"experience","type":1},{"name":"stoneGain","type":3},{"name":"woodGain","type":3},{"name":"stoneGainTick","type":1},{"name":"woodGainTick","type":1}],"742594995":[{"name":"position","type":5},{"name":"yaw","type":2},{"name":"health","type":3},{"name":"maxHealth","type":3},{"name":"damage","type":3},{"name":"height","type":3},{"name":"width","type":3},{"name":"collisionRadius","type":1},{"name":"model","type":4},{"name":"entityClass","type":4},{"name":"dead","type":1},{"name":"timeDead","type":3},{"name":"slowed","type":1},{"name":"stunned","type":1},{"name":"tier","type":1},{"name":"partyId","type":1}],"1059671174":[{"name":"position","type":5},{"name":"yaw","type":2},{"name":"health","type":3},{"name":"maxHealth","type":3},{"name":"damage","type":3},{"name":"height","type":3},{"name":"width","type":3},{"name":"collisionRadius","type":1},{"name":"model","type":4},{"name":"entityClass","type":4},{"name":"dead","type":1},{"name":"timeDead","type":3},{"name":"slowed","type":1},{"name":"stunned","type":1},{"name":"firingTick","type":1},{"name":"lastDamagedTick","type":1}],"1372600389":[{"name":"position","type":5},{"name":"yaw","type":2},{"name":"health","type":3},{"name":"maxHealth","type":3},{"name":"damage","type":3},{"name":"height","type":3},{"name":"width","type":3},{"name":"collisionRadius","type":1},{"name":"model","type":4},{"name":"entityClass","type":4},{"name":"dead","type":1},{"name":"timeDead","type":3},{"name":"slowed","type":1},{"name":"stunned","type":1},{"name":"hits","type":8}],"1496910567":[{"name":"position","type":5},{"name":"yaw","type":2},{"name":"health","type":3},{"name":"maxHealth","type":3},{"name":"damage","type":3},{"name":"height","type":3},{"name":"width","type":3},{"name":"collisionRadius","type":1},{"name":"model","type":4},{"name":"entityClass","type":4},{"name":"dead","type":1},{"name":"timeDead","type":3},{"name":"slowed","type":1},{"name":"stunned","type":1},{"name":"firingTick","type":1}],"1566069472":[{"name":"position","type":5},{"name":"yaw","type":2},{"name":"health","type":3},{"name":"maxHealth","type":3},{"name":"damage","type":3},{"name":"height","type":3},{"name":"width","type":3},{"name":"collisionRadius","type":1},{"name":"model","type":4},{"name":"entityClass","type":4},{"name":"dead","type":1},{"name":"timeDead","type":3},{"name":"slowed","type":1},{"name":"stunned","type":1},{"name":"tier","type":1},{"name":"partyId","type":1}],"1672634632":[{"name":"position","type":5},{"name":"yaw","type":2},{"name":"health","type":3},{"name":"maxHealth","type":3},{"name":"damage","type":3},{"name":"height","type":3},{"name":"width","type":3},{"name":"collisionRadius","type":1},{"name":"model","type":4},{"name":"entityClass","type":4},{"name":"dead","type":1},{"name":"timeDead","type":3},{"name":"slowed","type":1},{"name":"stunned","type":1}],"1816895259":[{"name":"position","type":5},{"name":"yaw","type":2},{"name":"health","type":3},{"name":"maxHealth","type":3},{"name":"damage","type":3},{"name":"height","type":3},{"name":"width","type":3},{"name":"collisionRadius","type":1},{"name":"model","type":4},{"name":"entityClass","type":4},{"name":"dead","type":1},{"name":"timeDead","type":3},{"name":"slowed","type":1},{"name":"stunned","type":1}],"2092990061":[{"name":"position","type":5},{"name":"yaw","type":2},{"name":"health","type":3},{"name":"maxHealth","type":3},{"name":"damage","type":3},{"name":"height","type":3},{"name":"width","type":3},{"name":"collisionRadius","type":1},{"name":"model","type":4},{"name":"entityClass","type":4},{"name":"dead","type":1},{"name":"timeDead","type":3},{"name":"slowed","type":1},{"name":"stunned","type":1},{"name":"tier","type":1},{"name":"partyId","type":1}],"2093252446":[{"name":"position","type":5},{"name":"yaw","type":2},{"name":"health","type":3},{"name":"maxHealth","type":3},{"name":"damage","type":3},{"name":"height","type":3},{"name":"width","type":3},{"name":"collisionRadius","type":1},{"name":"model","type":4},{"name":"entityClass","type":4},{"name":"dead","type":1},{"name":"timeDead","type":3},{"name":"slowed","type":1},{"name":"stunned","type":1},{"name":"hits","type":8}],"2347737811":[{"name":"position","type":5},{"name":"yaw","type":2},{"name":"health","type":3},{"name":"maxHealth","type":3},{"name":"damage","type":3},{"name":"height","type":3},{"name":"width","type":3},{"name":"collisionRadius","type":1},{"name":"model","type":4},{"name":"entityClass","type":4},{"name":"dead","type":1},{"name":"timeDead","type":3},{"name":"slowed","type":1},{"name":"stunned","type":1},{"name":"reconnectSecret","type":4},{"name":"name","type":4},{"name":"score","type":13},{"name":"baseSpeed","type":3},{"name":"speedAttribute","type":3},{"name":"availableSkillPoints","type":2},{"name":"experience","type":3},{"name":"level","type":1},{"name":"msBetweenFires","type":3},{"name":"aimingYaw","type":2},{"name":"energy","type":3},{"name":"maxEnergy","type":3},{"name":"energyRegenerationRate","type":3},{"name":"kills","type":2},{"name":"weaponName","type":4},{"name":"weaponTier","type":1},{"name":"firingTick","type":1},{"name":"startChargingTick","type":1},{"name":"stone","type":15},{"name":"wood","type":15},{"name":"gold","type":15},{"name":"token","type":15},{"name":"wave","type":1},{"name":"partyId","type":1},{"name":"zombieShieldHealth","type":3},{"name":"zombieShieldMaxHealth","type":3},{"name":"isPaused","type":1},{"name":"isInvulnerable","type":1},{"name":"lastPetDamage","type":3},{"name":"lastPetDamageTick","type":1},{"name":"lastPetDamageTarget","type":1},{"name":"lastDamage","type":3},{"name":"lastDamageTick","type":1},{"name":"lastDamageTarget","type":1},{"name":"hatName","type":4},{"name":"petUid","type":1},{"name":"isBuildingWalking","type":10}],"2402467733":[{"name":"position","type":5},{"name":"yaw","type":2},{"name":"health","type":3},{"name":"maxHealth","type":3},{"name":"damage","type":3},{"name":"height","type":3},{"name":"width","type":3},{"name":"collisionRadius","type":1},{"name":"model","type":4},{"name":"entityClass","type":4},{"name":"dead","type":1},{"name":"timeDead","type":3},{"name":"slowed","type":1},{"name":"stunned","type":1},{"name":"tier","type":1},{"name":"partyId","type":1}],"2462472648":[{"name":"position","type":5},{"name":"yaw","type":2},{"name":"health","type":3},{"name":"maxHealth","type":3},{"name":"damage","type":3},{"name":"height","type":3},{"name":"width","type":3},{"name":"collisionRadius","type":1},{"name":"model","type":4},{"name":"entityClass","type":4},{"name":"dead","type":1},{"name":"timeDead","type":3},{"name":"slowed","type":1},{"name":"stunned","type":1},{"name":"tier","type":1}],"2464630638":[{"name":"position","type":5},{"name":"yaw","type":2},{"name":"health","type":3},{"name":"maxHealth","type":3},{"name":"damage","type":3},{"name":"height","type":3},{"name":"width","type":3},{"name":"collisionRadius","type":1},{"name":"model","type":4},{"name":"entityClass","type":4},{"name":"dead","type":1},{"name":"timeDead","type":3},{"name":"slowed","type":1},{"name":"stunned","type":1},{"name":"tier","type":1},{"name":"partyId","type":1}],"2899981078":[{"name":"position","type":5},{"name":"yaw","type":2},{"name":"health","type":3},{"name":"maxHealth","type":3},{"name":"damage","type":3},{"name":"height","type":3},{"name":"width","type":3},{"name":"collisionRadius","type":1},{"name":"model","type":4},{"name":"entityClass","type":4},{"name":"dead","type":1},{"name":"timeDead","type":3},{"name":"slowed","type":1},{"name":"stunned","type":1},{"name":"tier","type":1},{"name":"partyId","type":1},{"name":"harvestMax","type":1},{"name":"stone","type":1},{"name":"wood","type":1},{"name":"firingTick","type":1},{"name":"deposit","type":3},{"name":"depositMax","type":3},{"name":"lastHarvestedBy","type":4}],"2969697641":[{"name":"position","type":5},{"name":"yaw","type":2},{"name":"health","type":3},{"name":"maxHealth","type":3},{"name":"damage","type":3},{"name":"height","type":3},{"name":"width","type":3},{"name":"collisionRadius","type":1},{"name":"model","type":4},{"name":"entityClass","type":4},{"name":"dead","type":1},{"name":"timeDead","type":3},{"name":"slowed","type":1},{"name":"stunned","type":1},{"name":"tier","type":1},{"name":"partyId","type":1},{"name":"towerYaw","type":3},{"name":"firingTick","type":1},{"name":"healingTick","type":1}]},"entityTypeNames":{"667546015":"Pet","742594995":"GoldMine","1059671174":"Zombie","1372600389":"Stone","1496910567":"Neutral","1566069472":"PlayerObject","1672634632":"NeutralCamp","1816895259":"GameProjectile","2092990061":"Trap","2093252446":"Tree","2347737811":"GamePlayer","2402467733":"GoldStash","2462472648":"Spell","2464630638":"Door","2899981078":"Harvester","2969697641":"Tower"},"rpcMaps":[{"name":"Shutdown","parameters":[{"name":"reason","type":3},{"name":"shutdownUnix","type":0}],"isArray":false,"index":0},{"name":"ReceiveChatMessage","parameters":[{"name":"displayName","type":3},{"name":"channel","type":3},{"name":"message","type":3},{"name":"uid","type":0}],"isArray":false,"index":1},{"name":"SendChatMessage","parameters":[{"name":"channel","type":3},{"name":"message","type":3}],"isArray":false,"index":2},{"name":"Login","parameters":[{"name":"token","type":3}],"isArray":false,"index":3},{"name":"LoginResponse","parameters":[{"name":"json","type":3}],"isArray":false,"index":4},{"name":"AccountSession","parameters":[{"name":"json","type":3}],"isArray":false,"index":5},{"name":"Metrics","parameters":[{"name":"minFps","type":2},{"name":"maxFps","type":2},{"name":"currentFps","type":2},{"name":"averageFps","type":2},{"name":"framesRendered","type":2},{"name":"framesInterpolated","type":2},{"name":"framesExtrapolated","type":2},{"name":"allocatedNetworkEntities","type":2},{"name":"currentClientLag","type":2},{"name":"minClientLag","type":2},{"name":"maxClientLag","type":2},{"name":"currentPing","type":2},{"name":"minPing","type":2},{"name":"maxPing","type":2},{"name":"averagePing","type":2},{"name":"longFrames","type":2},{"name":"stutters","type":2},{"name":"group","type":0},{"name":"isMobile","type":0},{"name":"timeResets","type":2},{"name":"maxExtrapolationTime","type":2},{"name":"extrapolationIncidents","type":2},{"name":"totalExtrapolationTime","type":2},{"name":"differenceInClientTime","type":2}],"isArray":false,"index":6},{"name":"DayCycle","parameters":[{"name":"cycleStartTick","type":0},{"name":"nightEndTick","type":0},{"name":"dayEndTick","type":0},{"name":"isDay","type":0}],"isArray":false,"index":7},{"name":"MakeBuilding","parameters":[{"name":"x","type":1},{"name":"y","type":1},{"name":"type","type":3},{"name":"yaw","type":1}],"isArray":false,"index":8},{"name":"BuildingShopPrices","parameters":[{"name":"json","type":3}],"isArray":false,"index":9},{"name":"ItemShopPrices","parameters":[{"name":"json","type":3},{"name":"json","type":3}],"isArray":false,"index":10},{"name":"LocalBuilding","parameters":[{"name":"x","type":1},{"name":"y","type":1},{"name":"type","type":3},{"name":"dead","type":0},{"name":"uid","type":0},{"name":"tier","type":0}],"isArray":true,"index":11},{"name":"Dead","parameters":[{"name":"stashDied","type":0}],"isArray":false,"index":12},{"name":"Admin","parameters":[{"name":"password","type":3},{"name":"command","type":3}],"isArray":false,"index":13},{"name":"UpgradeBuilding","parameters":[{"name":"uid","type":0}],"isArray":false,"index":14},{"name":"DeleteBuilding","parameters":[{"name":"uid","type":0}],"isArray":false,"index":15},{"name":"BuyItem","parameters":[{"name":"itemName","type":3},{"name":"tier","type":0}],"isArray":false,"index":16},{"name":"SetItem","parameters":[{"name":"itemName","type":3},{"name":"tier","type":0},{"name":"stacks","type":0}],"isArray":false,"index":17},{"name":"EquipItem","parameters":[{"name":"itemName","type":3},{"name":"tier","type":0}],"isArray":false,"index":18},{"name":"SetOpenParty","parameters":[{"name":"isOpen","type":0}],"isArray":false,"index":19},{"name":"SetPartyName","parameters":[{"name":"partyName","type":3}],"isArray":false,"index":20},{"name":"SetPartyMemberCanSell","parameters":[{"name":"uid","type":0},{"name":"canSell","type":0}],"isArray":false,"index":21},{"name":"JoinParty","parameters":[{"name":"partyId","type":0}],"isArray":false,"index":22},{"name":"JoinPartyByShareKey","parameters":[{"name":"partyShareKey","type":3}],"isArray":false,"index":23},{"name":"PartyApplicant","parameters":[{"name":"displayName","type":3},{"name":"applicantUid","type":0}],"isArray":false,"index":24},{"name":"PartyApplicantDecide","parameters":[{"name":"applicantUid","type":0},{"name":"accepted","type":0}],"isArray":false,"index":25},{"name":"PartyApplicantDenied","parameters":[],"isArray":false,"index":26},{"name":"PartyApplicantExpired","parameters":[{"name":"applicantUid","type":0}],"isArray":false,"index":27},{"name":"PartyShareKey","parameters":[{"name":"partyShareKey","type":3}],"isArray":false,"index":28},{"name":"PartyInfo","parameters":[{"name":"playerUid","type":0},{"name":"displayName","type":3},{"name":"isLeader","type":0},{"name":"canSell","type":0}],"isArray":true,"index":29},{"name":"AddParty","parameters":[{"name":"partyId","type":0},{"name":"partyName","type":3},{"name":"isOpen","type":0},{"name":"memberCount","type":0}],"isArray":false,"index":30},{"name":"RemoveParty","parameters":[{"name":"partyId","type":0}],"isArray":false,"index":31},{"name":"Leaderboard","parameters":[{"name":"name","type":3},{"name":"uid","type":0},{"name":"rank","type":0},{"name":"score","type":4},{"name":"wave","type":0}],"isArray":true,"index":32},{"name":"Failure","parameters":[{"name":"category","type":3},{"name":"reason","type":3},{"name":"x","type":0},{"name":"y","type":0},{"name":"type","type":3}],"isArray":false,"index":33},{"name":"RecallPet","parameters":[],"isArray":false,"index":34},{"name":"LeaveParty","parameters":[],"isArray":false,"index":35},{"name":"KickParty","parameters":[{"name":"uid","type":0}],"isArray":false,"index":36},{"name":"AddDepositToHarvester","parameters":[{"name":"uid","type":0},{"name":"deposit","type":2}],"isArray":false,"index":37},{"name":"CollectHarvester","parameters":[{"name":"uid","type":0}],"isArray":false,"index":38},{"name":"CastSpell","parameters":[{"name":"spell","type":3},{"name":"x","type":1},{"name":"y","type":1},{"name":"tier","type":0}],"isArray":false,"index":39},{"name":"CastSpellResponse","parameters":[{"name":"spell","type":3},{"name":"cooldown","type":0},{"name":"cooldownStartTick","type":0}],"isArray":false,"index":40},{"name":"Spells","parameters":[{"name":"json","type":3}],"isArray":false,"index":41},{"name":"SetPartyList","parameters":[{"name":"partyId","type":0},{"name":"partyName","type":3},{"name":"isOpen","type":0},{"name":"memberCount","type":0}],"isArray":true,"index":42}],"rpcMapsByName":{"Shutdown":{"name":"Shutdown","parameters":[{"name":"reason","type":3},{"name":"shutdownUnix","type":0}],"isArray":false,"index":0},"ReceiveChatMessage":{"name":"ReceiveChatMessage","parameters":[{"name":"displayName","type":3},{"name":"channel","type":3},{"name":"message","type":3},{"name":"uid","type":0}],"isArray":false,"index":1},"SendChatMessage":{"name":"SendChatMessage","parameters":[{"name":"channel","type":3},{"name":"message","type":3}],"isArray":false,"index":2},"Login":{"name":"Login","parameters":[{"name":"token","type":3}],"isArray":false,"index":3},"LoginResponse":{"name":"LoginResponse","parameters":[{"name":"json","type":3}],"isArray":false,"index":4},"AccountSession":{"name":"AccountSession","parameters":[{"name":"json","type":3}],"isArray":false,"index":5},"Metrics":{"name":"Metrics","parameters":[{"name":"minFps","type":2},{"name":"maxFps","type":2},{"name":"currentFps","type":2},{"name":"averageFps","type":2},{"name":"framesRendered","type":2},{"name":"framesInterpolated","type":2},{"name":"framesExtrapolated","type":2},{"name":"allocatedNetworkEntities","type":2},{"name":"currentClientLag","type":2},{"name":"minClientLag","type":2},{"name":"maxClientLag","type":2},{"name":"currentPing","type":2},{"name":"minPing","type":2},{"name":"maxPing","type":2},{"name":"averagePing","type":2},{"name":"longFrames","type":2},{"name":"stutters","type":2},{"name":"group","type":0},{"name":"isMobile","type":0},{"name":"timeResets","type":2},{"name":"maxExtrapolationTime","type":2},{"name":"extrapolationIncidents","type":2},{"name":"totalExtrapolationTime","type":2},{"name":"differenceInClientTime","type":2}],"isArray":false,"index":6},"DayCycle":{"name":"DayCycle","parameters":[{"name":"cycleStartTick","type":0},{"name":"nightEndTick","type":0},{"name":"dayEndTick","type":0},{"name":"isDay","type":0}],"isArray":false,"index":7},"MakeBuilding":{"name":"MakeBuilding","parameters":[{"name":"x","type":1},{"name":"y","type":1},{"name":"type","type":3},{"name":"yaw","type":1}],"isArray":false,"index":8},"BuildingShopPrices":{"name":"BuildingShopPrices","parameters":[{"name":"json","type":3}],"isArray":false,"index":9},"ItemShopPrices":{"name":"ItemShopPrices","parameters":[{"name":"json","type":3},{"name":"json","type":3}],"isArray":false,"index":10},"LocalBuilding":{"name":"LocalBuilding","parameters":[{"name":"x","type":1},{"name":"y","type":1},{"name":"type","type":3},{"name":"dead","type":0},{"name":"uid","type":0},{"name":"tier","type":0}],"isArray":true,"index":11},"Dead":{"name":"Dead","parameters":[{"name":"stashDied","type":0}],"isArray":false,"index":12},"Admin":{"name":"Admin","parameters":[{"name":"password","type":3},{"name":"command","type":3}],"isArray":false,"index":13},"UpgradeBuilding":{"name":"UpgradeBuilding","parameters":[{"name":"uid","type":0}],"isArray":false,"index":14},"DeleteBuilding":{"name":"DeleteBuilding","parameters":[{"name":"uid","type":0}],"isArray":false,"index":15},"BuyItem":{"name":"BuyItem","parameters":[{"name":"itemName","type":3},{"name":"tier","type":0}],"isArray":false,"index":16},"SetItem":{"name":"SetItem","parameters":[{"name":"itemName","type":3},{"name":"tier","type":0},{"name":"stacks","type":0}],"isArray":false,"index":17},"EquipItem":{"name":"EquipItem","parameters":[{"name":"itemName","type":3},{"name":"tier","type":0}],"isArray":false,"index":18},"SetOpenParty":{"name":"SetOpenParty","parameters":[{"name":"isOpen","type":0}],"isArray":false,"index":19},"SetPartyName":{"name":"SetPartyName","parameters":[{"name":"partyName","type":3}],"isArray":false,"index":20},"SetPartyMemberCanSell":{"name":"SetPartyMemberCanSell","parameters":[{"name":"uid","type":0},{"name":"canSell","type":0}],"isArray":false,"index":21},"JoinParty":{"name":"JoinParty","parameters":[{"name":"partyId","type":0}],"isArray":false,"index":22},"JoinPartyByShareKey":{"name":"JoinPartyByShareKey","parameters":[{"name":"partyShareKey","type":3}],"isArray":false,"index":23},"PartyApplicant":{"name":"PartyApplicant","parameters":[{"name":"displayName","type":3},{"name":"applicantUid","type":0}],"isArray":false,"index":24},"PartyApplicantDecide":{"name":"PartyApplicantDecide","parameters":[{"name":"applicantUid","type":0},{"name":"accepted","type":0}],"isArray":false,"index":25},"PartyApplicantDenied":{"name":"PartyApplicantDenied","parameters":[],"isArray":false,"index":26},"PartyApplicantExpired":{"name":"PartyApplicantExpired","parameters":[{"name":"applicantUid","type":0}],"isArray":false,"index":27},"PartyShareKey":{"name":"PartyShareKey","parameters":[{"name":"partyShareKey","type":3}],"isArray":false,"index":28},"PartyInfo":{"name":"PartyInfo","parameters":[{"name":"playerUid","type":0},{"name":"displayName","type":3},{"name":"isLeader","type":0},{"name":"canSell","type":0}],"isArray":true,"index":29},"AddParty":{"name":"AddParty","parameters":[{"name":"partyId","type":0},{"name":"partyName","type":3},{"name":"isOpen","type":0},{"name":"memberCount","type":0}],"isArray":false,"index":30},"RemoveParty":{"name":"RemoveParty","parameters":[{"name":"partyId","type":0}],"isArray":false,"index":31},"Leaderboard":{"name":"Leaderboard","parameters":[{"name":"name","type":3},{"name":"uid","type":0},{"name":"rank","type":0},{"name":"score","type":4},{"name":"wave","type":0}],"isArray":true,"index":32},"Failure":{"name":"Failure","parameters":[{"name":"category","type":3},{"name":"reason","type":3},{"name":"x","type":0},{"name":"y","type":0},{"name":"type","type":3}],"isArray":false,"index":33},"RecallPet":{"name":"RecallPet","parameters":[],"isArray":false,"index":34},"LeaveParty":{"name":"LeaveParty","parameters":[],"isArray":false,"index":35},"KickParty":{"name":"KickParty","parameters":[{"name":"uid","type":0}],"isArray":false,"index":36},"AddDepositToHarvester":{"name":"AddDepositToHarvester","parameters":[{"name":"uid","type":0},{"name":"deposit","type":2}],"isArray":false,"index":37},"CollectHarvester":{"name":"CollectHarvester","parameters":[{"name":"uid","type":0}],"isArray":false,"index":38},"CastSpell":{"name":"CastSpell","parameters":[{"name":"spell","type":3},{"name":"x","type":1},{"name":"y","type":1},{"name":"tier","type":0}],"isArray":false,"index":39},"CastSpellResponse":{"name":"CastSpellResponse","parameters":[{"name":"spell","type":3},{"name":"cooldown","type":0},{"name":"cooldownStartTick","type":0}],"isArray":false,"index":40},"Spells":{"name":"Spells","parameters":[{"name":"json","type":3}],"isArray":false,"index":41},"SetPartyList":{"name":"SetPartyList","parameters":[{"name":"partyId","type":0},{"name":"partyName","type":3},{"name":"isOpen","type":0},{"name":"memberCount","type":0}],"isArray":true,"index":42}}}'

let allSessions = null;

const shouldUseSession = true;

(game.network.fetchSessions = async function() {
    let data = await fetch(`http://localhost:${SESSION_DEFAULT_PORT + 1}/sessions`);
    data = await data.json();
    allSessions = data;
    return data;
})();

game.network.createSession = async function() {
    const nickname = game.ui.getOption("nickname");
    const server = document.getElementsByClassName("hud-intro-server")[0].value;
    await fetch(`http://localhost:${SESSION_DEFAULT_PORT + 1}/create?name=${nickname}&serverId=${server}`);
};

game.network.establishSessionConnection = function() {
    this.connectionOptions = Object.values(allSessions)[0].connectionOptions;
    this.connected = false;
    this.connecting = true;
    this.codec.rpcMaps = [{
        "name": "SyncData",
        "parameters": [{
            "name": "json",
            "type": 3
        }],
        "isArray": false,
        "index": 0
    }, {
        "name": "VerifyUser",
        "parameters": [{
            "name": "secretKey",
            "type": 3,
        }],
        "isArray": false,
        "index": 1
    }, {
        "name": "ConnectSession",
        "parameters": [{
            "name": "id",
            "type": 3
        }],
        "isArray": false,
        "index": 2
    }];
    this.codec.rpcMapsByName = {
        "SyncData": {
            "name": "SyncData",
            "parameters": [{
                "name": "json",
                "type": 3
            }],
            "isArray": false,
            "index": 0
        },
        "VerifyUser": {
            "name": "VerifyUser",
            "parameters": [{
                "name": "secretKey",
                "type": 3
            }],
            "isArray": false,
            "index": 1
        },
        "ConnectSession": {
            "name": "ConnectSession",
            "parameters": [{
                "name": "id",
                "type": 3
            }],
            "isArray": false,
            "index": 2
        },
    };
    this.socket = new WebSocket(`ws://localhost:${SESSION_DEFAULT_PORT}`);
    this.socket.binaryType = `arraybuffer`;
    this.socket.addEventListener("open", () => {
        this.socket.send(this.codec.encode(9, {
            name: "VerifyUser",
            secretKey: SESSION_SECRET_KEY
        }));
        this.socket.send(this.codec.encode(9, {
            name: "ConnectSession",
            id: Object.keys(allSessions)[0]
        }));
    });
    this.bindEventListeners();
    this.addRpcHandler("SyncData", (response) => {
        console.log('a', response);
        try {
            const data = JSON.parse(response.json);

            this.connectionOptions = data.connectionOptions;
            game.options.serverId = data.connectionOptions.serverId;
            game.options.nickname = data.syncNeeds[0].effectiveDisplayName;

            const staticCodecData = JSON.parse(codecJSON);
            for (let i in staticCodecData) {
                this.codec[i] = staticCodecData[i];
            };
            this.codec.sortedUidsByType = data.sortedUidsByType;
            this.codec.removedEntities = data.removedEntities;
            this.codec.absentEntitiesFlags = data.absentEntitiesFlags;
            this.codec.updatedEntityFlags = data.updatedEntityFlags;

            for (let i = 0; i < staticJSONs.length; i++) {
                this.emitter.emit(PacketIds_1.default[staticJSONs[i].opcode], staticJSONs[i]);
            };

            for (let i = 0; i < data.syncNeeds.length; i++) {
                this.emitter.emit(PacketIds_1.default[data.syncNeeds[i].opcode], data.syncNeeds[i]);
            };

            for (let i = 0; i < data.messages.length; i++) {
                this.emitter.emit(PacketIds_1.default[9], {
                    name: "ReceiveChatMessage",
                    response: data.messages[i],
                    opcode: 9
                });
            };

            if (data.castSpellResponse && data.castSpellResponse.cooldownStartTick && (data.tick - data.castSpellResponse.cooldownStartTick) * 50 < 240000) {
                this.emitter.emit(PacketIds_1.default[9], {
                    name: 'CastSpellResponse',
                    response: data.castSpellResponse,
                    opcode: 9
                });
            };

            for (let i in data.inventory) {
                this.emitter.emit(PacketIds_1.default[9], {
                    name: "SetItem",
                    response: {
                        itemName: data.inventory[i].itemName,
                        tier: data.inventory[i].tier,
                        stacks: data.inventory[i].stacks
                    },
                    opcode: 9
                });
            };

            this.emitter.emit(PacketIds_1.default[9], {
                name: "LocalBuilding",
                response: data.localBuildings,
                opcode: 9
            });

            this.emitter.emit(PacketIds_1.default[0], {
                tick: data.tick,
                entities: data.entities,
                byteSize: data.byteSize,
                opcode: 0
            });

            this.emitter.once(PacketIds_1.default[0], () => {
                const myPlayer = data.entities[data.syncNeeds[0].uid];
                myPlayer?.dead && this.emitter.emit(PacketIds_1.default[9], {
                    name: "Dead",
                    response: {stashDied: 0},
                    opcode: 9
                });
                myPlayer?.isPaused && (
                    game.ui.onLocalItemUpdate({
                        itemName: 'Pause',
                        tier: 1,
                        stacks: 1
                    }),
                    game.ui.emit('wavePaused')
                );
            });
        } catch(e) { console.log(e); };
    });
};

game.network.connect = async function (options) {
    if (!this.connecting) {
        if (shouldUseSession) return this.establishSessionConnection();
        this.connectionOptions = options;
        this.connected = false;
        this.connecting = true;
        this.socket = new WebSocket('wss://' + options.hostname + ':' + options.port);
        this.socket.binaryType = `arraybuffer`;
        this.bindEventListeners();
    };
};