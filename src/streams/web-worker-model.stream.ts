import {IAction, IInvoker, ModelStream} from "../model.stream";
import {filter, first, Fn, fromEvent, InjectionToken, map, mergeMap, Observable, of, throwError} from "@hypertype/core";

declare const OffscreenCanvas;
export const UrlToken = new InjectionToken('webworker');

export class WebWorkerModelStream<TState, TActions> extends ModelStream<TState, TActions> {
    public Input$: Observable<any>;
    public State$: Observable<TState>;
    private worker: Worker;

    constructor(webSocketPath: string) {
        super();
        this.worker = this.createWorker(webSocketPath);
    }

    protected createWorker(path){
        return new Worker(path);
    }

    public Action: IInvoker<TActions> = (action: IAction<TActions>) => {
        const id = +performance.now();
        this.worker.postMessage({
            ...action,
            _id: id
        }, action.args.filter(a => {
            return (a instanceof OffscreenCanvas);
        }));
        return this.Input$.pipe(
            filter(d => d.requestId == id),
            mergeMap(d => d.error ? throwError(d.error) : of(d.response)),
            first()
        ).toPromise()
    };

}


