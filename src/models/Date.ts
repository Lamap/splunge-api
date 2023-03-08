import { Schema } from 'mongoose';
import { IDateInformation } from 'splunge-common-lib';

const DateSchema = new Schema<IDateInformation>({
    type: { type: String, required: true },
    start: { type: Number, required: true },
    end: { type: Number },
});

export default DateSchema;
