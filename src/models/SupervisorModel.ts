import * as mongoose from 'mongoose';
import { Document, Schema, Model } from 'mongoose';

import { IAuth } from './d.types';
import { IOrganisation } from './OrganisationModel';


interface ISupervisor extends Document {
    auth: IAuth;
    first_name: string;
    last_name: string;
    organisation: IOrganisation;
    _soft_deleted: boolean;
}

const supervisorSchema: Schema = new Schema({
    auth: {
        username: { type: String, required: true,  unique: true },
        password: { type: String, required: true }
    },
    first_name: { type: String, maxLength: 100, required: true, trim: true},
    last_name: { type: String, maxLength: 100, required: true, trim: true},
    organisation: { type: Schema.Types.ObjectId, ref: 'organisation', required: true},
    _soft_deleted: { type: Boolean }
}); 

const SupervisorKeys = Object.keys(supervisorSchema);

const SupervisorModel : Model<ISupervisor> = mongoose.model<ISupervisor>('supervisor', supervisorSchema);

export {
    SupervisorKeys,
    SupervisorModel, 
    supervisorSchema,
    ISupervisor,
}