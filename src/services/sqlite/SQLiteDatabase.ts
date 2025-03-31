import {DatabaseSync} from "node:sqlite";

const inMemoryDatabase = new DatabaseSync(":memory:");

export default inMemoryDatabase;