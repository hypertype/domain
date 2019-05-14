import {IAction, IInvoker, ModelStream} from "../model.stream";
import {
    filter,
    first,
    Fn,
    fromEvent,
    InjectionToken,
    map,
    mergeMap,
    Observable,
    of,
    Serializer,
    throwError
} from "@hypertype/core";

declare const OffscreenCanvas;
export const UrlToken = new InjectionToken('webworker');

export class WebWorkerModelStream<TState, TActions> extends ModelStream<TState, TActions> {
    public Input$: Observable<any>;
    public State$: Observable<TState>;
    private worker: Worker;

    constructor(webSocketPath: string) {
        super();
        this.worker = new Worker(webSocketPath);
        this.Input$ = fromEvent<MessageEvent>(this.worker, 'message').pipe(
            // tap(console.log),
            map(e => e.data),
            map(s => Serializer.deserialize(s) as TState),
        );
        this.State$ = this.Input$.pipe(
            map(d => d.state),
            filter(Fn.Ib),
        )
    }

    public Action: IInvoker<TActions> = (action: IAction<TActions>) => {
        const id = +performance.now();
        this.worker.postMessage(Serializer.serialize({
            ...action,
            _id: id
        }), action.args.filter(a => {
            return (a instanceof OffscreenCanvas);
        }));
        return this.Input$.pipe(
            filter(d => d.requestId == id),
            mergeMap(d => d.error ? throwError(d.error) : of(d.response)),
            first()
        ).toPromise()
    };

}


