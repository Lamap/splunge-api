import { Schema, model } from 'mongoose';

export interface IImage {
    readonly url: string;
    readonly title?: string;
    readonly image?: any;
}

const ImageSchema = new Schema<IImage>({
    url: {type: String, required: true},
    title: String,
});

const ImageModel = model<IImage>('Image', ImageSchema);

export default ImageModel;
