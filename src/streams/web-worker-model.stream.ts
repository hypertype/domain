import {ModelStream, IAction, IInvoker} from "../model.stream";
import {fromEvent, Observable} from "rxjs";
import {map} from "rxjs/operators";
import {Serializer} from "@so/utils";
import {InjectionToken} from "@so/di";


export const UrlToken = new InjectionToken('webworker');

export class WebWorkerModelStream<TState, TActions> extends ModelStream<TState, TActions> {
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

    public State$: Observable<TState>;

    public Action: IInvoker<TActions> = (action: IAction<TActions>) => {
        this.worker.postMessage(Serializer.serialize(action));
    };

}


