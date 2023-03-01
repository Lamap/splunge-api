import { Schema, model } from 'mongoose';
import { ISpgImage } from 'splunge-common-lib';
import TagSchema from './Tag';
export interface IImage extends ISpgImage {
    readonly imagePath: string;
}

const ImageSchema = new Schema<IImage>({
    description: { type: String },
    id: { type: String, required: true },
    imagePath: { type: String, required: true },
    url: { type: String, required: true },
    tags: { type: [TagSchema] },
    title: String,
    widthPerHeightRatio: Number,
});

const ImageModel = model<IImage>('Image', ImageSchema);

export default ImageModel;
