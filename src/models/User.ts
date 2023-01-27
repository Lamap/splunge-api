import { CallbackError, model, Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import { IUser, IUserMetadata } from 'splunge-common-lib';

const UserMetadataSchema: Schema<IUserMetadata> = new Schema({
    lastActed: { type: Date, required: true },
    createdOn: { type: Date, required: true },
    lastLoggedIn: { type: Date },
});

const UserSchema: Schema<IUser> = new Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    metadata: { type: UserMetadataSchema, required: true },
    role: { type: String, required: true },
});
UserSchema.pre('save', async function (next: (err?: CallbackError) => void) {
    this.set('password', await bcrypt.hash(this.password, 8));
    next();
});
export const UserModel = model('User', UserSchema);
