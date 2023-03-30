{
  "resourceType": "GMObject",
  "resourceVersion": "1.0",
  "name": "oWarpPortal",
  "eventList": [
    {"resourceType":"GMEvent","resourceVersion":"1.0","name":"","collisionObjectId":null,"eventNum":0,"eventType":3,"isDnD":false,},
  ],
  "managed": true,
  "overriddenProperties": [],
  "parent": {
    "name": "Entities",
    "path": "folders/Warp/Objects/Entities.yy",
  },
  "parentObjectId": {
    "name": "oEntity",
    "path": "objects/oEntity/oEntity.yy",
  },
  "persistent": false,
  "physicsAngularDamping": 0.1,
  "physicsDensity": 0.5,
  "physicsFriction": 0.2,
  "physicsGroup": 1,
  "physicsKinematic": false,
  "physicsLinearDamping": 0.1,
  "physicsObject": false,
  "physicsRestitution": 0.1,
  "physicsSensor": false,
  "physicsShape": 1,
  "physicsShapePoints": [],
  "physicsStartAwake": true,
  "properties": [
    {"resourceType":"GMObjectProperty","resourceVersion":"1.0","name":"portal_type","filters":[],"listItems":[
        "\"Entrance\"",
        "\"Exit\"",
        "\"Both\"",
      ],"multiselect":false,"rangeEnabled":false,"rangeMax":10.0,"rangeMin":0.0,"value":"\"Entrance\"","varType":6,},
    {"resourceType":"GMObjectProperty","resourceVersion":"1.0","name":"warp_id","filters":[],"listItems":[],"multiselect":false,"rangeEnabled":false,"rangeMax":10.0,"rangeMin":0.0,"value":"0","varType":1,},
    {"resourceType":"GMObjectProperty","resourceVersion":"1.0","name":"room_to","filters":[
        "GMRoom",
      ],"listItems":[],"multiselect":false,"rangeEnabled":false,"rangeMax":10.0,"rangeMin":0.0,"value":"undefined","varType":5,},
  ],
  "solid": false,
  "spriteId": {
    "name": "sWarpPortal",
    "path": "sprites/sWarpPortal/sWarpPortal.yy",
  },
  "spriteMaskId": null,
  "visible": true,
}