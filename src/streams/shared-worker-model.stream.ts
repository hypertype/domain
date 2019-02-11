import {IAction, IInvoker, ModelStream} from "../model.stream";
import {fromEvent, map, Observable, Serializer} from "@hypertype/core";

declare var SharedWorker;

export class SharedWorkerModelStream<TState, TActions> extends ModelStream<TState, TActions> {
    public State$: Observable<TState>;
    private worker: any;

    constructor(webSocketPath: string) {
        super();
        this.worker = new SharedWorker(webSocketPath);
        this.State$ = fromEvent<MessageEvent>(this.worker.port, 'message').pipe(
            // tap(console.log),
            map(e => e.data),
            map(s => Serializer.deserialize(s) as TState),
        );
        this.worker.port.start();
    }

    public Action: IInvoker<TActions> = (action: IAction<TActions>) => {
        this.worker.port.postMessage(Serializer.serialize(action));
    };

}