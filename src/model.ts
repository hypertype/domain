import {Observable} from "rxjs/internal/Observable";
import {ReplaySubject} from "rxjs/internal/ReplaySubject";
import {Subject} from "rxjs/internal/Subject";
import {map} from "rxjs/internal/operators/map";
import {shareReplay} from "rxjs/internal/operators/shareReplay";
import {startWith} from "rxjs/internal/operators/startWith";
import {IInvoker} from "./model.stream";

export abstract class Model<TState, TActions> implements IModel<TState, TActions> {

    protected StateSubject$: Subject<void> = new ReplaySubject<void>();

    public State$: Observable<TState> = this.StateSubject$.asObservable().pipe(
        startWith(null),
        map(() => this.ToJSON()),
        shareReplay(1)
    );

    public Invoke: IInvoker<TActions> = async action => {
        await this.GetSubActions(...(action.path||[]))[action.method](...action.args);
        this.Update();
    };

    private GetSubActions(...path: any[]): IActions<TActions>{
        return this.GetSubModel(...path) as unknown as IActions<TActions>;
    }

    private GetSubState(state, ...path) {
        if (!path.length)
            return state;
        if (Array.isArray(state))
            return this.GetSubState(state.find(s => s.Id == path[0]), ...path.slice(1));
        return this.GetSubState(state[path[0]], ...path.slice(1));
    }


    public abstract ToJSON(): TState;

    public abstract FromJSON(state: TState);

    protected GetSubModel<TState, TActions>(...path: any[]): Model<TState, TActions> {
        const model = this.GetSubState(this, ...path) as Model<TState, TActions>;
        model.Update = this.Update;
        return model;
    }

    Update = () => {
        this.StateSubject$.next();
    };
}

export type IModel<TState, TActions> = {
    ToJSON(): TState;
    FromJSON(state: TState);
};

export type IActions<TActions> = {
    [key in keyof TActions]: (...args) => void;
}