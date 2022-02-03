import {model, Schema} from 'mongoose';

export interface IWGS84Location {
    readonly lat: number;
    readonly lon: number;
}
export type IPoint = {
    readonly id: string;
    readonly location: IWGS84Location,
    readonly direction?: number;
}
const WGS84LocationSchema = new Schema({
    lat: {type: Number, required: true, min: -90, max: 90},
    lon: {type: Number, required: true, min: -180, max: 180},
});

const PointSchema = new Schema<IPoint>({
    id: {type: String, required: true},
    location: {type: WGS84LocationSchema, required: true},
    direction: Number,
});
export const PointModel = model('Point', PointSchema);
