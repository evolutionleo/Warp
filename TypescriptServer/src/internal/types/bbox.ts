import { BBox as _BBox } from 'rbush';

export interface BBox /*extends _BBox*/ {
    left: number,
    right: number,
    top: number,
    bottom: number
}
export default BBox;