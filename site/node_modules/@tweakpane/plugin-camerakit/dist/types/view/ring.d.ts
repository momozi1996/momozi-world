import { Formatter, Value, View, ViewProps } from '@tweakpane/core';
/**
 * A configuration of a ring unit.
 */
export interface RingUnit {
    /**
     * The number of pixels for the unit.
     */
    pixels: number;
    /**
     * The number of ticks for the unit.
     */
    ticks: number;
    /**
     * The value for the unit.
     */
    value: number;
}
interface Config {
    formatters: {
        ring: Formatter<number>;
        text: Formatter<number>;
    };
    seriesId: string;
    showsTooltip: Value<boolean>;
    unit: RingUnit;
    value: Value<number>;
    viewProps: ViewProps;
}
export declare class RingView implements View {
    readonly element: HTMLElement;
    private readonly value_;
    private readonly unit_;
    private readonly offsetElem_;
    private readonly svgElem_;
    private readonly formatters_;
    private tickElems_;
    private labelElems_;
    private tooltipElem_;
    private boundsWidth_;
    constructor(doc: Document, config: Config);
    private waitToBeAdded_;
    private rebuildScaleIfNeeded_;
    private updateScale_;
    update(): void;
    private onValueChange_;
    private onShowsTooltipChange_;
}
export {};
