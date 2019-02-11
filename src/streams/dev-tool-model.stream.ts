import {IAction, IInvoker, ModelStream} from "../model.stream";
import {Observable} from "@hypertype/core";
import {shareReplay, tap} from "@hypertype/core";
import "redux-devtools-extension";


export class DevToolModelStream<TState, TActions> extends ModelStream<TState, TActions> {
    private lastState: TState;
    private devTools: any;


    constructor(private stream: ModelStream<TState, TActions>) {
        super();

        this.devTools = window['__REDUX_DEVTOOLS_EXTENSION__'];
        this.devTools.connect();
    }


    public Action: IInvoker<TActions> = (action: IAction<TActions>) => {
        this.devTools.send({
            type: [
                ...action.path,
                action.method
            ].join(':'),
            payload: action.args
        }, this.lastState);
        this.stream.Action(action);
    };

    public State$: Observable<TState> = this.stream.State$.pipe(
        tap(state => {
            this.lastState = state;
            this.devTools.send('-----', state);
        }),
        shareReplay(1)
    );


}