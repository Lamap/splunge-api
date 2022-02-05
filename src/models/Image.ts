import { Schema, model } from 'mongoose';

export interface IImage {
    readonly id: string;
    readonly imagePath: string;
    readonly title?: string;
    readonly pointId?: string;
    readonly url: string;
}

const ImageSchema = new Schema<IImage>({
    id: {type: String, required: true},
    imagePath: {type: String, required: true},
    url: {type: String, required: true},
    title: String,
    pointId: String,
});

const ImageModel = model<IImage>('Image', ImageSchema);

export default ImageModel;
