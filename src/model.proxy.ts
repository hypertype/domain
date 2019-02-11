import {map, Observable} from "@hypertype/core";
import {ModelStream} from "./model.stream";
import {IActions} from "./model";

export class ModelProxy<TState, TActions extends IActions<TActions>> {

    public State$: Observable<TState> = this.stream.State$.pipe(
        map(state => this.GetSubState(state, ...this.path)),
    );
    public Actions: TActions = new Proxy({}, {
        get: (target: TActions, key: keyof TActions, receiver) => {
            return target[key] || (target[key] = ((...args) => {
                this.stream.Action({
                    path: this.path,
                    method: key,
                    args: args
                })
            }));
        }
    }) as TActions;

    constructor(protected stream: ModelStream<TState, TActions>, private path = []) {
    }

    protected GetSubProxy<UState, UActions extends IActions<UActions>>(constructor: any = ModelProxy, ...path: any[]): ModelProxy<UState, UActions> {
        return new constructor(this.stream.SubStream<UState, UActions>(), [
            ...this.path,
            ...path
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