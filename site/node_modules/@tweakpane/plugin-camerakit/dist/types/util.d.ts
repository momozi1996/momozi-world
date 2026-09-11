import { BaseInputParams, Constraint, NumberTextInputParams } from '@tweakpane/core';
import { RingUnit } from './view/ring.js';
export type RingSeries = 0 | 1 | 2;
export interface RingInputParams extends BaseInputParams, NumberTextInputParams {
    view: 'cameraring';
    series?: RingSeries;
    unit?: RingUnit;
    wide?: boolean;
}
export interface WheelInputParams extends BaseInputParams, NumberTextInputParams {
    view: 'camerawheel';
    amount?: number;
    wide?: boolean;
}
export declare function createConstraint(params: RingInputParams | WheelInputParams): Constraint<number>;
