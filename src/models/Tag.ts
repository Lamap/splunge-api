import { Schema } from 'mongoose';
import { ISpgTag } from 'splunge-common-lib';

const TagSchema = new Schema<ISpgTag>({
    id: { type: String, required: true },
    value: { type: String, required: true },
});

export default TagSchema;
