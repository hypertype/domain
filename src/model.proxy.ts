import {map, mergeMap, Observable, shareReplay, startWith, Subject, switchMap, take, tap} from "@hypertype/core";
import {ModelStream} from "./model.stream";
import {IActions} from "./model";

export class ModelProxy<TState, TActions extends IActions<TActions>> {

    private ActionSubject = new Subject();

    public State$: Observable<TState> = this.ActionSubject.pipe(
        startWith(null),
        switchMap(_ => this.stream.State$),
        map(state => this.GetSubState(state, ...this.path)),
        shareReplay(1),
    );

    public Actions: TActions = new Proxy({}, {
        get: (target: TActions, key: keyof TActions, receiver) => {
            return target[key] || (target[key] = (async (...args) => {
                this.ActionSubject.next();
                try {
                    const res = await this.stream.Action({
                        path: this.path,
                        method: key,
                        args: args
                    });
                    await this.State$.pipe(take(1)).toPromise();
                    return res;
                }catch (e) {
                    return Promise.reject(e);
                }
            }) as any);
        }
    }) as TActions;

    constructor(protected stream: ModelStream<TState, TActions>, private path = []) {
    }

    protected GetSubProxy<UState, UActions extends IActions<UActions>>(constructor: any = ModelProxy, path: keyof TState, ...paths: any[]): ModelProxy<UState, UActions> {
        return new constructor(this.stream.SubStream<UState, UActions>(), [
            ...this.path,
            path,
            ...paths
        ]);
    }

    private GetSubState(state, ...path) {
        if (!path.length)
            return state;
        if (Array.isArray(state))
            return this.GetSubState(state.find(s => s.Id == path[0]), ...path.slice(1));
        return this.GetSubState(state[path[0]], ...path.slice(1));
    }
}
