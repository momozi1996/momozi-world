import { Formatter, NumberTextProps, Parser, Value, ValueController, ViewProps } from '@tweakpane/core';
import { RingUnit } from '../view/ring.js';
import { RingTextView } from '../view/ring-text.js';
interface Config {
    parser: Parser<number>;
    ringFormatter: Formatter<number>;
    ringUnit: RingUnit;
    seriesId: string;
    textProps: NumberTextProps;
    value: Value<number>;
    viewProps: ViewProps;
}
export declare class RingTextController implements ValueController<number, RingTextView> {
    readonly value: Value<number>;
    readonly view: RingTextView;
    readonly viewProps: ViewProps;
    private readonly rc_;
    private readonly tc_;
    constructor(doc: Document, config: Config);
}
export {};
