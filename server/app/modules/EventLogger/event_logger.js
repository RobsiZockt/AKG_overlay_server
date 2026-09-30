const { readFileSync, writeFile, chownSync, lstatSync, copyFile } = require("fs");
const fs = require("fs").promises;
const path = require("path");
const { json } = require("stream/consumers");
const { error, timeStamp } = require("console");
const eventBus = require("./../eventBus.js")


const EventTypes = Object.freeze({
    MAP_PICK: "MAP_PICK",
    HERO_BAN: "HERO_BAN",
    SWAP_SIDES: "SWAP_SIDES",
    SET_MAP_SCORE: "SET_MAP_SCORE",
    MAP_WON: "MAP_WON",
    MAP_DRAWN: "MAP_DRAWN",
    LOAD_TEAM: "LOAD_TEAM",

    UNDEFINED_EVENT: "UNDEFINED_EVENT"

})



class Event {
    constructor(event,data){
        this.timeStamp = Date.now();
        this.event = event;
        this.data = data;
    }

    getEvent(){
        return `${this.timeStamp} || ${this.event} || ${this.data}`;
    }
}

class EventLogger {
    constructor() {
        this.events = [];
    }

    log(type, data ={}) {
        const valitatedType = EventTypes[type]?type:EventTypes.UNDEFINED_EVENT;

        const newEvent = new Event(valitatedType, data);
        this.events.push(newEvent);

        eventBus.emit("newLoggedEvent", newEvent);
        console.log(newEvent);
        return newEvent;
    }

    clear() {
        this.events = [];
    }

    getEvents() {
        return this.events;
    }
}



module.exports = {logger: new EventLogger(), EventTypes, EventLogger}