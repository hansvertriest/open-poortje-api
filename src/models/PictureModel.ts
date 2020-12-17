import * as mongoose from 'mongoose'
import { Schema, Model } from 'mongoose';

interface IPicture extends Document {
  title: string;
  description: string;
  filename: string;
  _createdAt: number;
  save: Model
}

const pictureSchema: Schema = new Schema({
  filename: {
		type: String,
		required: true,
	},
  _createdAt: { 
	type: Number,
	required: true,
	default: () => { return new Date() }
	},
});

const PictureModel = mongoose.model<IPicture>('Picture', pictureSchema);

export { PictureModel, IPicture, pictureSchema };
