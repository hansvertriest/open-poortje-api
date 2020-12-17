import { Document } from 'mongoose';


export interface IAuth {
    username: string;
    password: string;
}

export interface IPicture extends Document {
    title: string;
    description: string;
    filename: string;
    _createdAt: number;
  }
  