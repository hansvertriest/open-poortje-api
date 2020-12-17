import * as mongoose from 'mongoose';
import { Document, Schema, Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { IAuth } from './d.types';
import { IOrganisation, ISupervisor } from './';

interface IKid extends Document {
    auth: IAuth;
    first_name: string;
    last_name: string;
    birth_date: Date;
    current_organisation: IOrganisation;
    fiches: [ IFiche ];
    _soft_deleted: Boolean;
}

interface IFiche{
    _created_at: Date;
    _edited_at: Date;
    supervisor: ISupervisor;
    fiche: Schema.Types.ObjectId;
    fiche_date: any;
}

const kidSchema: Schema = new Schema({
    auth: {
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true }
    },
    first_name: { type: String, maxLength: 100, required: true, trim: true},
    last_name: { type: String, maxLength: 100, required: true, trim: true},
    birth_date: { type: Date, required: true },
    theme_color: { type: String, enum: ['#fff', '#000'], default: '#fff'},
    skin_color: { type: String, enum: ['#fff', '#000'], default: '#fff'},
    current_organisation: { type: Schema.Types.ObjectId, ref: 'organisation', required: true},
    fiches: [{ 
        _created_at: { type: Date, required: true },
        _edited_at: { type: Date, required: true },
        supervisor: { type: Schema.Types.ObjectId, ref: 'supervisor', required: true},
        fiche: { type: Schema.Types.ObjectId, ref: 'fiche', required: true},
        fiche_data: { type: Schema.Types.Mixed },
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
}