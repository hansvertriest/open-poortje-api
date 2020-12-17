import * as mongoose from 'mongoose';
import { Document, Schema, Model } from 'mongoose';

import { IAuth } from './d.types';
import { ISupervisor, IKid } from './';

interface IOrganisation extends Document {
    auth: IAuth;
    name: string;
    supervisors: ISupervisor;
    kids: IKid[];
}

const organisationSchema: Schema = new Schema({
    auth: {
        username: { type: String, required: true,  unique: true },
        password: { type: String, required: true }
    },
    name: { type: String, maxLength: 100, required: true, trim: true},
    supervisors: [{ type: Schema.Types.ObjectId, ref: 'supervisor', required: true}],
    kids: [{ type: Schema.Types.ObjectId, ref: 'kid', required: true}],
    _soft_deleted: { type: Boolean }
}); 

const OrganisationKeys = Object.keys(organisationSchema);


const OrganisationModel : Model<IOrganisation> = mongoose.model<IOrganisation>('organisation', organisationSchema);

export {
    OrganisationKeys,
    OrganisationModel, 
    organisationSchema,
    IOrganisation,
}