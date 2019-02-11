import {Observable} from "rxjs/internal/Observable";
import {Model} from "../model";
import {ModelStream, IAction, IInvoker} from "../model.stream";


export class SimpleModelStream<TState, TActions> extends ModelStream<TState, TActions> {
    constructor(private model: Model<TState, TActions>) {
        super();
    }

    public Action: IInvoker<TActions> = (action: IAction<TActions>) => {
        this.model.Invoke(action);
    };

    public State$: Observable<TState> = this.model.State$;
}

