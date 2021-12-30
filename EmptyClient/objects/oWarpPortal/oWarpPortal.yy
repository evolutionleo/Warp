{
  "spriteId": {
    "name": "sWarpPortal",
    "path": "sprites/sWarpPortal/sWarpPortal.yy",
  },
  "solid": false,
  "visible": true,
  "spriteMaskId": null,
  "persistent": false,
  "parentObjectId": {
    "name": "oEntity",
    "path": "objects/oEntity/oEntity.yy",
  },
  "physicsObject": false,
  "physicsSensor": false,
  "physicsShape": 1,
  "physicsGroup": 1,
  "physicsDensity": 0.5,
  "physicsRestitution": 0.1,
  "physicsLinearDamping": 0.1,
  "physicsAngularDamping": 0.1,
  "physicsFriction": 0.2,
  "physicsStartAwake": true,
  "physicsKinematic": false,
  "physicsShapePoints": [],
  "eventList": [
    {"isDnD":false,"eventNum":0,"eventType":3,"collisionObjectId":null,"resourceVersion":"1.0","name":"","tags":[],"resourceType":"GMEvent",},
  ],
  "properties": [
    {"varType":6,"value":"\"Entrance\"","rangeEnabled":false,"rangeMin":0.0,"rangeMax":10.0,"listItems":[
        "\"Entrance\"",
        "\"Exit\"",
        "\"Both\"",
      ],"multiselect":false,"filters":[],"resourceVersion":"1.0","name":"type","tags":[],"resourceType":"GMObjectProperty",},
    {"varType":1,"value":"0","rangeEnabled":false,"rangeMin":0.0,"rangeMax":10.0,"listItems":[],"multiselect":false,"filters":[],"resourceVersion":"1.0","name":"warp_id","tags":[],"resourceType":"GMObjectProperty",},
    {"varType":5,"value":"undefined","rangeEnabled":false,"rangeMin":0.0,"rangeMax":10.0,"listItems":[],"multiselect":false,"filters":[
        "GMRoom",
      ],"resourceVersion":"1.0","name":"room_to","tags":[],"resourceType":"GMObjectProperty",},
  ],
  "overriddenProperties": [],
  "parent": {
    "name": "Gameplay",
    "path": "folders/GMOF/Demo/Objects/Gameplay.yy",
  },
  "resourceVersion": "1.0",
  "name": "oWarpPortal",
  "tags": [],
  "resourceType": "GMObject",
}