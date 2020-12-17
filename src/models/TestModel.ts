import * as mongoose from 'mongoose'
import { Document, Schema, Model } from 'mongoose';

interface ITest extends Document {
    greeting: string;
    randomNumber: number;
}

const testSchema: Schema = new Schema({
    greeting: { type: String, required: true, max:30 },
    randomNumber: { type: Number, required: true},
}); 

const TestModel : Model<ITest> = mongoose.model<ITest>('test', testSchema);

export {
    TestModel, 
    ITest,
}