import {map} from "rxjs/internal/operators/map";
import {Model} from "./model";
import {Container} from "@so/di";
import {Serializer} from "@so/utils";
import {shareReplay} from "rxjs/internal/operators/shareReplay";

export class WebworkerEntry {

    constructor(private model: Model<any, any>) {

    }

    public Output$ = this.model.State$.pipe(
        map(Serializer.serialize),
        shareReplay(1)
    );

    public onMessage = (e: MessageEvent) => {
        if (typeof e.data === "object")
            return;
        this.model.Invoke(Serializer.deserialize(e.data));
    };

    static Start(self, container: Container) {

        const aggregate = container.get<Model<any, any>>(Model);

        const service = new WebworkerEntry(aggregate);
        if (self.postMessage) {
            self.addEventListener('message', service.onMessage);
            service.Output$.subscribe(d => {
                self.postMessage(d)
            });
        }

// shared worker
        if ('onconnect' in self) {
            self['onconnect'] = function (e) {
                const port = e.ports[0];
                port.addEventListener('message', service.onMessage);
                service.Output$.subscribe(d => {
                    port.postMessage(d)
                });
                port.start();
            };
        }
    }
}