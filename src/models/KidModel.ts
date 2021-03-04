import * as mongoose from 'mongoose';
import { Document, Schema, Model, Types } from 'mongoose';

import { IAuth } from './d.types';
import { IOrganisation, ISupervisor } from './';

interface IKid extends Document {
    auth: IAuth;
    first_name: string;
    last_name: string;
    birth_date: Date;
    current_organisation: IOrganisation;
    fiches: IFiche[];
    stickers: ISticker[],
    _soft_deleted: Boolean;
}

interface ISticker{
    pictureName: string;
}
interface IFiche {
    _id: Types.ObjectId,
    _created_at: Date,
    _edited_at: Date,
    created_by_supervisor: Types.ObjectId,
    edited_by_supervisor: Types.ObjectId,
    fiche_type: Types.ObjectId,
    picture_name: string
    fiche_data: any, 
}

const kidSchema: Schema = new Schema({
    auth: {
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true }
    },
    first_name: { type: String, maxLength: 100, required: true, trim: true},
    last_name: { type: String, maxLength: 100, required: true, trim: true},
    birth_date: { type: Date, required: true },
    theme_color: { type: String, enum: ['color-01', 'color-02', 'color-03', 'color-04'], default: 'color-01'},
    skin_color: { type: String, enum: ['skin-01', 'skin-02', 'skin-03', 'skin-04'], default: '#fff'},
    current_organisation: { type: Schema.Types.ObjectId, ref: 'organisation', required: true},
    fiches: [{ 
        _id: { type: Schema.Types.ObjectId},
        _created_at: { type: Date, required: true },
        _edited_at: { type: Date, required: true },
        created_by_supervisor: { type: Schema.Types.ObjectId, ref: 'supervisor', required: true},
        edited_by_supervisor: { type: Schema.Types.ObjectId, ref: 'supervisor', required: true},
        fiche_type: { type: Schema.Types.ObjectId, ref: 'fiche', required: true},
        fiche_data: { type: Schema.Types.Mixed },
        picture_name: { type: String }
     }],
    stickers: [{
        // _id: { type: Schema.Types.ObjectId, required: true },
        pictureName: { type: String, required: true }, 
        _created_at: { type: Date, required: true, default: Date.now },
    }],
    _soft_deleted: { type: Boolean }
}); 


const KidKeys = Object.keys(kidSchema);


const KidModel : Model<IKid> = mongoose.model<IKid>('kid', kidSchema);

export {
    KidKeys,
    KidModel, 
    kidSchema,
    IKid,
    IFiche,
}