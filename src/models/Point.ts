import { LatLngLiteral } from 'leaflet';
import { model, Schema } from 'mongoose';
import { ISpgPoint } from 'splunge-common-lib/src';

const LatLangSchema = new Schema<LatLngLiteral>({
    lat: { type: Number },
    lng: { type: Number },
});
const PointSchema = new Schema<ISpgPoint>({
    id: { type: String, required: true },
    images: [{ type: String }],
    direction: { type: Number },
    hasDirection: { type: Boolean },
    position: { type: LatLangSchema },
});
export const PointModel = model('Point', PointSchema);
