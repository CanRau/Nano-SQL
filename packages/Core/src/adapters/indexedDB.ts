import { INanoSQLAdapter, INanoSQLDataModel, INanoSQLTable, INanoSQLPlugin, INanoSQLInstance, VERSION } from "../interfaces";
import { hash, generateID, cast } from "../utilities";

export class IndexedDB implements INanoSQLAdapter {

    plugin: INanoSQLPlugin = {
        name: "IndexedDB Adapter",
        version: VERSION
    };

    nSQL: INanoSQLInstance;

    private _db: { [table: string]: IDBDatabase };
    private _id: any;
    private _ai: {
        [key: string]: number;
    }

    constructor(public version?: number) {
        this._db = {};
        this._ai = {};
    }

    connect(id: string, complete: () => void, error: (err: any) => void) {
        this._id = id;
        complete();
    }

    createAndInitTable(tableName: string, tableData: INanoSQLTable, complete: () => void, error: (err: any) => void) {

        let version = 1;

        const dataModelHash = hash(JSON.stringify(tableData.columns));
        if (this.version) { // manually handled by developer
            version = this.version;
        } else { // automatically handled by nanoSQL
            version = parseInt(localStorage.getItem(this._id + "_" + tableName + "_idb_version") || "") || 1;
            const modelHash = localStorage.getItem(this._id + "_" + tableName + "_idb_hash") || dataModelHash;

            if (modelHash !== dataModelHash) {
                version++;
            }

            localStorage.setItem(this._id + "_" + tableName + "_idb_version", String(version));
            localStorage.setItem(this._id + "_" + tableName + "_idb_hash", dataModelHash);
        }

        const idb = indexedDB.open(this._id + "_" + tableName, version);
        this._ai[tableName] = parseInt(localStorage.getItem(this._id + "_" + tableName + "_idb_ai") || "0");

        idb.onerror = error;
        let isUpgrading = false;
        // Called only when there is no existing DB, creates the tables and data store.
        idb.onupgradeneeded = (event: any) => {
            this._db[tableName] = event.target.result;

            if (!this._db[tableName].objectStoreNames.contains(tableName)) {
                this._db[tableName].createObjectStore(tableName, { keyPath: tableData.pkCol });
            }
        };

        // Called once the database is connected
        idb.onsuccess = (event: any) => {
            this._db[tableName] = event.target.result;
            complete();
        };
    }

    disconnectTable(table: string, complete: () => void, error: (err: any) => void) {
        this._db[table].onerror = error;
        this._db[table].close();
        delete this._db[table];
        complete();
    }

    dropTable(table: string, complete: () => void, error: (err: any) => void) {
        // open a read/write db transaction, ready for clearing the data
        const tx = this._db[table].transaction(table, "readwrite");
        tx.onerror = error;
        const objectStoreRequest = tx.objectStore(table).clear();
        objectStoreRequest.onsuccess = () => {
            this.disconnectTable(table, complete, error);
        }
    }

    disconnect(complete: () => void, error: (err: any) => void) {
        complete();
    }

    store(table: string, type: IDBTransactionMode, open: (tr: IDBTransaction, store: IDBObjectStore) => void, error: (err: any) => void) {
        const transaction = this._db[table].transaction(table, type);
        transaction.onabort = error;
        transaction.onerror = error;
        open(transaction, transaction.objectStore(table));
    }

    write(table: string, pk: any, row: { [key: string]: any }, complete: (pk: any) => void, error: (err: any) => void) {
        pk = pk || generateID(this.nSQL.tables[table].pkType, this._ai[table] + 1);

        if (typeof pk === "undefined") {
            error(new Error("Can't add a row without a primary key!"));
            return;
        }

        this._ai[table] = Math.max(pk, this._ai[table]);

        if (this.nSQL.tables[table].ai) {
            this._ai[table] = cast("int", Math.max(this._ai[table] || 0, pk));
            localStorage.setItem(this._id + "_" + table + "_idb_ai", String(this._ai[table]));
        }

        row[this.nSQL.tables[table].pkCol] = pk;

        this.store(table, "readwrite", (transaction, store) => {
            try {
                store.put(row).onsuccess = () => {
                    complete(pk);
                };
            } catch (e) {
                error(e);
            }
        }, error);
    }

    read(table: string, pk: any, complete: (row: { [key: string]: any } | undefined) => void, error: (err: any) => void) {

        this.store(table, "readonly", (transaction, store) => {
            const singleReq = store.get(pk);
            singleReq.onerror = () => {
                complete(undefined);
            }
            singleReq.onsuccess = () => {
                complete(singleReq.result);
            };
        }, error);
    }

    delete(table: string, pk: any, complete: () => void, error: (err: any) => void) {

        this.store(table, "readwrite", (transaction, store) => {
            const req = store.delete(pk as any);
            req.onerror = error;
            req.onsuccess = (e) => {
                complete();
            };
        }, error);
    }

    readMulti(table: string, type: "range" | "offset" | "all", offsetOrLow: any, limitOrHigh: any, reverse: boolean, onRow: (row: { [key: string]: any }, i: number) => void, complete: () => void, error: (err: any) => void) {
        const doOffset = type === "offset";
        let count = 0;
        const lowerLimit = doOffset ? offsetOrLow : 0;
        const upperLimit = lowerLimit + limitOrHigh;
        this.store(table, "readonly", (tr, store) => {
            store.openCursor((type === "all" || doOffset) ? undefined : IDBKeyRange.bound(offsetOrLow, limitOrHigh, true, false), reverse ? "prev" : "next").onsuccess = (event: any) => {
                const cursor: IDBCursorWithValue = event.target.result;
                if (cursor) {
                    if (doOffset) {
                        if (lowerLimit <= count && upperLimit > count) {
                            onRow(cursor.value, count - offsetOrLow);
                        }
                    } else {
                        onRow(cursor.value, count);
                    }
                    count++;
                    cursor.continue();
                } else {
                    complete();
                }
            };
        }, error);
    }

    getIndex(table: string, complete: (index: any[]) => void, error: (err: any) => void) {
        let index: any[] = [];
        this.store(table, "readonly", (tr, store) => {
            store.openCursor().onsuccess = (event: any) => {
                const cursor: IDBCursorWithValue = event.target.result;
                if (cursor) {
                    index.push(cursor.value[this.nSQL.tables[table].pkCol]);
                    cursor.continue();
                } else {
                    complete(index);
                }
            };
        }, error);

    }

    getNumberOfRecords(table: string, complete: (length: number) => void, error: (err: any) => void) {
        let count = 0;
        this.store(table, "readonly", (tr, store) => {
            store.openCursor().onsuccess = (event: any) => {
                const cursor: IDBCursorWithValue = event.target.result;
                if (cursor) {
                    count++;
                    cursor.continue();
                } else {
                    complete(count);
                }
            };
        }, error);
    }
}