import { InanoSQLAdapter, InanoSQLDataModel, InanoSQLTable, InanoSQLPlugin, InanoSQLInstance, VERSION } from "@nano-sql/core/lib/interfaces";
import { generateID, setFast, deepSet } from "@nano-sql/core/lib/utilities";
import { InanoSQLUniversalDB, InanoSQLSession } from "@nano-sql/plugin-net-common";

export class nanoSQLClient {

    public session: InanoSQLSession;

    constructor() {

    }

    public connect(clientArgs: {
        servers: string | string[]; // array of servers OR Url to JSON with server list
        disableWS?: boolean;
        databases: InanoSQLUniversalDB[];
    }, onSession?: (session: InanoSQLSession) => void): Promise<any> {
        return new Promise((res, rej) => {

        });
    }

    public db(name: string) {

    }

    public on(event: string, callback: () => void) {

    }

    public off(event: string, callback: () => void) {

    }

    public subscribe(stream: string): Promise<any> {
        return new Promise((res, rej) => {

        })
    }

    public unsubscribe(stream: string): Promise<any> {
        return new Promise((res, rej) => {

        })
    }

    public get(name: string, args: any): Promise<any> {
        return new Promise((res, rej) => {

        })
    }

    public post(name: string, args: any): Promise<any> {
        return new Promise((res, rej) => {

        })
    }

}