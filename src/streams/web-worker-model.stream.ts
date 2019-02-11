import {IAction, IInvoker, ModelStream} from "../model.stream";
import {fromEvent, InjectionToken, map, Observable, Serializer} from "@hypertype/core";


export const UrlToken = new InjectionToken('webworker');

export class WebWorkerModelStream<TState, TActions> extends ModelStream<TState, TActions> {
    public State$: Observable<TState>;
    private worker: Worker;

    constructor(webSocketPath: string) {
        super();
        this.worker = new Worker(webSocketPath);
        this.State$ = fromEvent<MessageEvent>(this.worker, 'message').pipe(
            // tap(console.log),
            map(e => e.data),
            map(s => Serializer.deserialize(s) as TState),
        );
    }

    public Action: IInvoker<TActions> = (action: IAction<TActions>) => {
        this.worker.postMessage(Serializer.serialize(action));
    };

}


