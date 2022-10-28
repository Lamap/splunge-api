import {model, Schema} from 'mongoose';
export interface IUser {
    readonly email: string;
    readonly password: string;
}
const UserSchema = new Schema({
    email: {type: String, required: true},
    password: {type: String, required: true},
});

export const UserModel = model('User', UserSchema);