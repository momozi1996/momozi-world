import { NumberTextView, View } from '@tweakpane/core';
import { RingView } from './ring.js';
interface Config {
    ringView: RingView;
    textView: NumberTextView;
}
export declare class RingTextView implements View {
    readonly element: HTMLElement;
    constructor(doc: Document, config: Config);
}
export {};
