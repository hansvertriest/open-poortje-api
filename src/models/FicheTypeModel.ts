import * as mongoose from 'mongoose';
import { Document, Schema, Model } from 'mongoose';


interface IFicheType extends Document {
    name: string,
    description: string,
    thumbnail: string,
}

const ficheTypeSchema: Schema = new Schema({
    name: { type: String, default: 'Nieuwe fiche-type' },
    description: { type: String, default: 'Een beschrijving voor dit fiche-type.' },
    thumbnail: { type: String },
    _soft_deleted: { type: Boolean, default: false }
}); 

const FicheTypeKeys = Object.keys(ficheTypeSchema);

const FicheTypeModel : Model<IFicheType> = mongoose.model<IFicheType>('fichetype', ficheTypeSchema);

export {
    FicheTypeKeys,
    FicheTypeModel, 
    ficheTypeSchema,
    IFicheType,
}