import { v4 as uuidv4 } from "uuid";

export class Opponent {
    public name: string;
    public id: string;
    constructor(name: string) {
        this.name = name;
        this.id = uuidv4();
    }   
}