import { Formatter, Value, ValueController, ViewProps } from '@tweakpane/core';
import { RingUnit, RingView } from '../view/ring.js';
interface Config {
    formatters: {
        ring: Formatter<number>;
        text: Formatter<number>;
    };
    tooltipEnabled: boolean;
    seriesId: string;
    unit: RingUnit;
    value: Value<number>;
    viewProps: ViewProps;
}
export declare class RingController implements ValueController<number, RingView> {
    readonly value: Value<number>;
    readonly view: RingView;
    readonly viewProps: ViewProps;
    private readonly unit_;
    private readonly showsTooltip_;
    private readonly tooltipEnabled_;
    private ox_;
    private ov_;
    constructor(doc: Document, config: Config);
    private onPointerDown_;
    private onPointerMove_;
    private onPointerUp_;
}
export {};
