import {ModelStream, IAction, IInvoker} from "../model.stream";
import {fromEvent, Observable} from "rxjs";
import {map} from "rxjs/operators";
import {Serializer} from "@so/utils";
declare var SharedWorker;

export class SharedWorkerModelStream<TState, TActions> extends ModelStream<TState, TActions> {
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

    public State$: Observable<TState>;

    public Action: IInvoker<TActions> = (action: IAction<TActions>) => {
        this.worker.port.postMessage(Serializer.serialize(action));
    };

}