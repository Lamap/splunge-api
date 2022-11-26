import { CallbackError, model, Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
export interface IUser extends Document {
    readonly email: string;
    readonly password: string;
}
const UserSchema = new Schema<IUser>({
    email: { type: String, required: true },
    password: { type: String, required: true },
});
UserSchema.pre('save', async function (next: (err?: CallbackError) => void) {
    this.set('password', await bcrypt.hash(this.password, 8));
    next();
});
export const UserModel = model('User', UserSchema);
