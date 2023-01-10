import { ApiRoutes } from 'splunge-common-lib';

export function createImageUrl(id: string): string {
    return `${process.env.apiRoute}${ApiRoutes.SPG_IMAGE_RENDER.replace(':id', id)}`;
}
