import { Document, ObjectId } from 'mongoose';


export interface IAuth {
    username: string;
    password: string;
}