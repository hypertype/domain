import {Container, map, Serializer, shareReplay} from "@hypertype/core";
import {Model} from "./model";

export class WebworkerEntry {

    public Output$ = this.model.State$.pipe(
        map(Serializer.serialize),
        shareReplay(1)
    );

    constructor(private model: Model<any, any>) {

    }

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

    public onMessage = (e: MessageEvent) => {
        if (typeof e.data === "object")
            return;
        this.model.Invoke(Serializer.deserialize(e.data));
    };
}