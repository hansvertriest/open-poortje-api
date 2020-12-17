import * as mongoose from 'mongoose'
import { Schema, Model } from 'mongoose';
import { IPicture } from './d.types';

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

export { PictureModel, pictureSchema };
