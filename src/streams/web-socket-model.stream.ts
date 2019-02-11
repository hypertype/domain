import {Observable} from "rxjs/internal/Observable";
import {fromEvent} from "rxjs/internal/observable/fromEvent";
import {map} from "rxjs/internal/operators/map";
import {Serializer} from "@so/utils";
import {ModelStream, IAction, IInvoker} from "../model.stream";
import {InjectionToken} from "@so/di";

export class WebSocketModelStream<TState, TActions> extends ModelStream<TState, TActions> {
    private ws: WebSocket;

    constructor(webSocketPath: string) {
        super();
        this.ws = new WebSocket(webSocketPath);
        this.ws.binaryType = 'arraybuffer';
        this.State$ = fromEvent<MessageEvent>(this.ws, 'message').pipe(
            // tap(console.log),
            map(e => e.data),
            map(s => Serializer.deserialize(s) as TState),
        );
    }

    public State$: Observable<TState>;

    public Action: IInvoker<TActions> = (action: IAction<TActions>) => {
        this.ws.send(Serializer.serialize(action));
    };

}
