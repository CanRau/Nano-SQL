import { INanoSQLQuery, ISelectArgs, IWhereArgs, INanoSQLIndex, IWhereCondition, INanoSQLSortBy, INanoSQLTableConfig, INanoSQLQueryExec, INanoSQLInstance, IGraphArgs, INanoSQLTable } from "./interfaces";
import { NanoSQLQueue } from "./utilities";
export declare const secondaryIndexQueue: {
    [idAndTable: string]: NanoSQLQueue;
};
export declare const adapterFilters: (nSQL: INanoSQLInstance, query: INanoSQLQuery) => {
    write: (table: string, pk: any, row: {
        [key: string]: any;
    }, complete: (pk: any) => void, error: (err: any) => void) => void;
    read: (table: string, pk: any, complete: (row: {
        [key: string]: any;
    } | undefined) => void, error: (err: any) => void) => void;
    readMulti: (table: string, type: "all" | "range" | "offset", offsetOrLow: any, limitOrHigh: any, reverse: boolean, onRow: (row: {
        [key: string]: any;
    }, i: number) => void, complete: () => void, error: (err: any) => void) => void;
};
export declare class _NanoSQLQuery implements INanoSQLQueryExec {
    nSQL: INanoSQLInstance;
    query: INanoSQLQuery;
    progress: (row: any, i: number) => void;
    complete: () => void;
    error: (err: any) => void;
    _queryBuffer: any[];
    _stream: boolean;
    _selectArgs: ISelectArgs[];
    _whereArgs: IWhereArgs;
    _havingArgs: IWhereArgs;
    _pkOrderBy: boolean;
    _idxOrderBy: boolean;
    _sortGroups: any[][];
    _sortGroupKeys: {
        [groupKey: string]: number;
    };
    _groupByColumns: string[];
    _orderBy: INanoSQLSortBy;
    _groupBy: INanoSQLSortBy;
    upsertPath: string[];
    private _TableCache;
    private _TableCacheLoading;
    _graphTableCache: {
        [key: string]: any[];
    };
    private _graphTableCacheLoading;
    constructor(nSQL: INanoSQLInstance, query: INanoSQLQuery, progress: (row: any, i: number) => void, complete: () => void, error: (err: any) => void);
    _conform(progress: (row: any, i: number) => void, finished: () => void, error: (err: any) => void): void;
    _getTableCache(cacheKey: string, table: any, callback: (joinTable: any) => void): void;
    _select(complete: () => void, onError: (error: any) => void): void;
    _groupByRows(): void;
    _buildCombineWhere(graphWhere: any, graphTable: string, rowTable: string, rowData: any): any;
    _graph(gArgs: IGraphArgs | IGraphArgs[], topTable: string, row: any, index: number, onRow: (row: any, i: number) => void, level: number): void;
    _upsert(onRow: (row: any, i: number) => void, complete: () => void, error: (err: any) => void): void;
    _updateRow(newData: any, oldRow: any, complete: (row: any) => void, error: (err: any) => void): void;
    private _diffUpdates;
    private _updateIndex;
    _newRow(newRow: any, complete: (row: any) => void, error: (err: any) => void): void;
    _delete(onRow: (row: any, i: number) => void, complete: () => void, error: (err: any) => void): void;
    _removeRowAndIndexes(table: INanoSQLTable, row: any, complete: () => void, error: (err: any) => void): void;
    _getIndexValues(indexes: {
        [name: string]: INanoSQLIndex;
    }, row: any): {
        [indexName: string]: any;
    };
    _showTables(): void;
    _describe(): void;
    _combineRows(rData: any): {};
    _streamAS(row: any): any;
    _orderByRows(a: any, b: any): number;
    _createTable(table: INanoSQLTableConfig, complete: () => void, error: (err: any) => void): void;
    _alterTable(table: INanoSQLTableConfig, complete: () => void, error: (err: any) => void): void;
    _dropTable(table: string, complete: () => void, error: (err: any) => void): void;
    _onError(err: any): void;
    _resolveFastWhere(onlyGetPKs: any, fastWhere: IWhereCondition, isReversed: boolean, onRow: (row: {
        [name: string]: any;
    }, i: number) => void, complete: () => void): void;
    _fastQuery(onRow: (row: {
        [name: string]: any;
    }, i: number) => void, complete: () => void): void;
    _getRecords(onRow: (row: {
        [name: string]: any;
    }, i: number) => void, complete: () => void): void;
    _rebuildIndexes(progress: (row: any, i: any) => void, complete: () => void, error: (err: any) => void): void;
    _where(singleRow: any, where: (IWhereCondition | string | (IWhereCondition | string)[])[]): boolean;
    static likeCache: {
        [likeQuery: string]: RegExp;
    };
    _processLIKE(columnValue: string, givenValue: string): boolean;
    _getColValue(where: IWhereCondition, wholeRow: any): any;
    /**
     * Compare function used by WHERE to determine if a given value matches a given condition.
     *
     * Accepts single where arguments (compound arguments not allowed).
     *
     *
     * @param {*} val1
     * @param {string} compare
     * @param {*} val2
     * @returns {boolean}
     */
    _compare(where: IWhereCondition, wholeRow: any): boolean;
    static _sortMemoized: {
        [key: string]: INanoSQLSortBy;
    };
    _parseSort(sort: string[], checkforIndexes: boolean): INanoSQLSortBy;
    static _selectArgsMemoized: {
        [key: string]: {
            hasAggrFn: boolean;
            args: ISelectArgs[];
        };
    };
    _hasAggrFn: boolean;
    _parseSelect(): void;
    static _whereMemoized: {
        [key: string]: IWhereArgs;
    };
    _parseWhere(qWhere: any[] | ((row: {
        [key: string]: any;
    }) => boolean), ignoreIndexes?: boolean): IWhereArgs;
}