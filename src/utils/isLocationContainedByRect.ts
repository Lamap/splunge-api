import {IPoint} from '../models/Point';
import { ILocationRect } from '../interfaces';

export function isLocationContainedByRect(point: IPoint, rect: ILocationRect): boolean {
    return point.location.lon > rect.minLon &&
        point.location.lon < rect.maxLon &&
        point.location.lat > rect.minLat &&
        point.location.lat < rect.maxLat;
}
