import {catchError, filter, map, of, ReplaySubject, Serializer, shareReplay, tap} from "@hypertype/core";
import {Model} from "./model";

export class WebsocketEntry {


    public Output$ = this.model.State$.pipe(
        map(s => Serializer.serialize(s)),
        shareReplay(1)
    );
    private InputSubject$ = new ReplaySubject();
    private Input$ = this.InputSubject$.asObservable().pipe(
        map((d: string) => JSON.parse(d)),
        tap(console.log),
        catchError(e => of(null)),
        filter(d => d.type),
        shareReplay(1),
    );

    constructor(private model: Model<any, any>) {
    }

    public onMessage = data => {
        const action = Serializer.deserialize(data);
        this.model.Invoke(action);
    }
}