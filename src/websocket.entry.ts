import {map} from "rxjs/internal/operators/map";
import {Model} from "./model";
import {Container} from "@so/di";
import {Serializer} from "@so/utils";
import {shareReplay} from "rxjs/internal/operators/shareReplay";
import {of, ReplaySubject} from "rxjs";
import {catchError, filter, tap} from "rxjs/operators";

export class WebsocketEntry {


    constructor(private model: Model<any, any>) {
    }

    private InputSubject$ = new ReplaySubject();
    private Input$ = this.InputSubject$.asObservable().pipe(
        map((d: string) => JSON.parse(d)),
        tap(console.log),
        catchError(e => of(null)),
        filter(d => d.type),
        shareReplay(1),
    );


    public Output$ = this.model.State$.pipe(
        map(s => Serializer.serialize(s)),
        shareReplay(1)
    );


    public onMessage = data => {
        const action = Serializer.deserialize(data);
        this.model.Invoke(action);
    }
}