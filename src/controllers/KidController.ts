import { NextFunction, Request, Response } from 'express';
import { KidModel, KidKeys, OrganisationModel, IKid, IOrganisation, IFiche, SupervisorModel, ISupervisor, IFicheType, FicheTypeModel } from '../models';
import { Utils } from '../services';
import { Types } from 'mongoose';

class KidController {
    constructor() {

    }
    // CREATE

    public new = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // get props
            const { first_name, last_name, birth_date, organisation_id, auth } = req.body;

            // generate hashed auth
            const hashedAuth = await Utils.hashAuth(auth);

            // filter props to existing keys
            const filteredProps = Utils.filterKeysAgainstModelKeys({ 
                first_name,
                last_name,
                birth_date,
                current_organisation: req.body.verifiedOrganisationId || organisation_id,
                auth: hashedAuth,
                _soft_deleted: false
            }, KidKeys, true);

            // create new model
            const newKid = new KidModel(filteredProps);
            
            // add kid to organisation
            await OrganisationModel.findOneAndUpdate({ _id: req.body.verifiedOrganisationId || organisation_id }, { '$push': { 'kids': newKid._id} }, { new: true, useFindAndModify: false })
                .catch((error:any) => {
                    console.log(error)
                    throw { status: 500, msg: "Could not save data" };
                });

            // save model
            const savedKid = await newKid.save()
                .catch((error:any) => {
                    console.log(error)
                    if (error.code == 11000) throw { status: 412, msg: "Duplicate kid name" };
                    throw { status: 500, msg: "Could not save data" };
                });


            // delete password from return model
            savedKid.auth.password = undefined

            res.send(savedKid);
        } catch (error) {
            const log = (error.msg) ? `!!! ERROR ${error.msg}` : error;
            console.log(log) 
            res.status(error.status).send({message: error.msg});
        }
    }

    //READ

    public getSelf = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.body.verifiedKidId;
            
            // get model
            const kid: IKid = await KidModel.findOne({'_id': id, _soft_deleted: false})
                .catch((error: any) => {
                    console.log(error)
                    throw { status: 500, msg: "Error occured while finding your data" };
                });
            
            if (!kid) throw { status: 404, msg: "Could not find data" };

            res.send({kid: Utils.obscureAuthOfModel(kid)});
        } catch (error) {
            const log = (error.msg) ? `!!! ERROR ${error.msg}` : error;
            console.log(log) 
            res.status(error.status).send({message: error.msg});
        }
    }

    public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {

            const organisationId = req.body.verifiedOrganisationId;
            const kidId = req.params.id;
            
            // get model
            const organisation: IOrganisation = await OrganisationModel.findOne({'_id': organisationId})
                .catch((error: any) => {
                    console.log(error)
                    throw { status: 500, msg: "Error occured while finding your data" };
                });

            
            if (!organisation) throw { status: 404, msg: "Could not find data" };

            const populatedOrganisation = await organisation.populate('kids').execPopulate();

            // filter by id
            const kids = populatedOrganisation.kids.filter((kid) => kid._id == kidId && kid._soft_deleted == false);
            if (kids.length == 0) throw { status: 404, msg: "Could not find data" };
            const kid = kids[0];

            res.send({kid: Utils.obscureAuthOfModel(kid)});
        } catch (error) {
            const log = (error.msg) ? `!!! ERROR ${error.msg}` : error;
            console.log(log) 
            res.status(error.status).send({message: error.msg});
        }
    }

    public getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {

            const id = req.body.verifiedOrganisationId;
            
            // get model
            const organisation: IOrganisation = await OrganisationModel.findOne({'_id': id})
                .catch(() => {
                    throw { status: 500, msg: "Error occured while finding your data" };
                });

            if (!organisation) throw { status: 404, msg: "Could not find organisation" };

            const populatedOrganisation = await organisation.populate('kids').execPopulate();

            const filteredDeleted = populatedOrganisation.kids.filter((kid) => kid._soft_deleted == false)

            const kids = filteredDeleted.map((kid) => {
                return Utils.obscureAuthOfModel(kid)
            });
            res.send({organisation_id: id, kids});
        } catch (error) {
            const log = (error.msg) ? `!!! ERROR ${error.msg}` : error;
            console.log(log) 
            res.status(error.status).send({message: error.msg});
        }
    }

    public getAllStickers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { verifiedOrganisationId, id } = req.body;

            if (!verifiedOrganisationId || !id) throw { status: 412, msg: "Given data does not meet requirements" }

            // find organisation
            const organisation: IOrganisation = await OrganisationModel.findOne({'_id': verifiedOrganisationId})
                .catch(() => {
                    throw { status: 500, msg: "Error occured while finding your data" };
                });

            if (!organisation) throw { status: 404, msg: "Could not find organisation" };
            
            if (organisation.kids.includes(id)) {
                // add sticker
                const kid: IKid = await KidModel.findOne({'_id': id})
                    .catch(() => {
                        throw { status: 500, msg: "Could not save data" };
                    });
                console.log(kid)
                if (!kid) throw { status: 404, msg: "Could not find data" };

                const populatedKid = await kid.populate('stickers').execPopulate();

                res.send({stickers: populatedKid.stickers});
            } else { 
                throw { status: 404, msg: "Could not find kid in organization." }; 
            }

        } catch (error) {
            const log = (error.msg) ? `!!! ERROR ${error.msg}` : error;
            console.log(log) 
            res.status(error.status).send({message: error.msg});
        }
    }
    
    public newFiche = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { kidId, fiche } = req.body;
            const supervisorId = req.body.verifiedSupervisorId;

            if (!kidId) throw { status: 412, msg: "Given data does not meet requirements" }

            // check if supervisor has acces to kid
            const supervisor: ISupervisor = await SupervisorModel.findOne({_id: supervisorId})
                .catch(() => {
                    throw { status: 500, msg: "Could not save data" };
                });
            if (!supervisor) throw { status: 404, msg: "Could not find supervisor" };

            const supervisorPopulated = await supervisor.populate('organisation').execPopulate();

            if (!supervisorPopulated.organisation.kids.includes(kidId)) throw { status: 403, msg: "Supervisor cannot acces this kid" }
                
            // check if fiche type exists

            const ficheType: IFicheType = await FicheTypeModel.findOne({_id: fiche.fiche_type});
            if (!ficheType) throw { status: 404, msg: "fichetype does not exist" }

            // create fiche object
            const ficheObject: IFiche = {
                _id: Types.ObjectId(),
                _created_at: new Date,
                _edited_at: new Date,
                created_by_supervisor: Types.ObjectId(supervisorId),
                edited_by_supervisor: Types.ObjectId(supervisorId),
                fiche_type: Types.ObjectId(fiche.fiche_type),
                fiche_data: fiche.fiche_data,
            }

            // find and update kid
            const updatedKid: IKid = await KidModel.findOneAndUpdate(
                {_id: kidId},
                { $push: { fiches: ficheObject } },
                {new: true}
            )
            .catch(() => {
                throw { status: 500, msg: "Error occured while updating your data" };
            });

            res.send(updatedKid);

        } catch (error) {
            const log = (error.msg) ? `!!! ERROR ${error.msg}` : error;
            console.log(log) 
            res.status(error.status).send({message: error.msg});
        }
    }

    // UPDATE
    public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { verifiedOrganisationId, id, changes } = req.body;

            if (!changes || !id) throw { status: 412, msg: "Given data does not meet requirements" }

            // filter props to existing keys
            const filteredProps = Utils.filterKeysAgainstModelKeys(changes, KidKeys);

            // find organisation
            const organisation = await OrganisationModel.findOne({'_id': verifiedOrganisationId});

            if (!organisation) throw { status: 404, msg: "Could not find organisation" };

            if (organisation.kids.includes(id)) {
                const update = await KidModel.findOneAndUpdate({'_id': id}, filteredProps, {new: true})
                    .catch((error:any) => {
                        if (error.code == 11000) throw { status: 412, msg: "Duplicate kid name" };
                        throw { status: 500, msg: "Could not save data" };
                    });
                
                if (!update) throw { status: 404, msg: "Could not find data" };

                res.send({supervisorUpdated: Utils.obscureAuthOfModel(update)});
            } else { 
                throw { status: 404, msg: "Could not find kid in organisation." }; 
            }
        } catch (error) {
            const log = (error.msg) ? `!!! ERROR ${error.msg}` : error;
            console.log(log) 
            res.status(error.status).send({message: error.msg});
        }
    }

    public authUpdate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { verifiedOrganisationId, id, authUpdate } = req.body;

            if (!authUpdate || !id) throw { status: 412, msg: "Given data does not meet requirements" }

            if (authUpdate.newPassword != authUpdate.confirmNewPassword) throw { status: 412, msg: "Passwords do not match" }

            // find organisation
            const organisation = await OrganisationModel.findOne({'_id': verifiedOrganisationId});

            if (!organisation) throw { status: 404, msg: "Could not find organisation" };
            
            if (organisation.kids.includes(id)) {
                const update = await KidModel.findOneAndUpdate({'_id': id}, {'auth.password': authUpdate.newPassword}, {new: true})
                    .catch((error: any) => {
                        console.log(error)
                        if (error.code == 11000) throw { status: 412, msg: "Duplicate supervisor name" };
                        throw { status: 500, msg: "Could not save data" };
                    });
                
                if (!update) throw { status: 404, msg: "Could not find data" };

                res.send({supervisorUpdated: Utils.obscureAuthOfModel(update)});
            } else { 
                throw { status: 404, msg: "Could not find kid in organization." }; 
            }
        } catch (error) {
            const log = (error.msg) ? `!!! ERROR ${error.msg}` : error;
            console.log(log) 
            res.status(error.status).send({message: error.msg});
        }
    }

    public addSticker = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { verifiedOrganisationId, id, pictureName } = req.body;

            if (!pictureName || !verifiedOrganisationId || !id) throw { status: 412, msg: "Given data does not meet requirements" }

            // create stickerObj
            const stickerObj = {
                pictureName,
            };

            // find organisation
            const organisation = await OrganisationModel.findOne({'_id': verifiedOrganisationId});

            if (!organisation) throw { status: 404, msg: "Could not find organisation" };
            
            if (organisation.kids.includes(id)) {
                // add sticker
                const update = await KidModel.findOneAndUpdate({'_id': id}, { '$push': { stickers: stickerObj } }, {new: true})
                    .catch((error:any) => {
                        if (error.code == 11000) throw { status: 412, msg: "Duplicate kid name" };
                        throw { status: 500, msg: "Could not save data" };
                    });

                if (!update) throw { status: 404, msg: "Could not find data" };

                res.send({supervisorUpdated: Utils.obscureAuthOfModel(update)});
            } else { 
                throw { status: 404, msg: "Could not find kid in organization." }; 
            }

        } catch (error) {
            const log = (error.msg) ? `!!! ERROR ${error.msg}` : error;
            console.log(log) 
            res.status(error.status).send({message: error.msg});
        }
    }

    //  DELETE
    public softDelete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { verifiedOrganisationId, id } = req.body;

            // find organisation
            const organisation = await OrganisationModel.findOne({'_id': verifiedOrganisationId});
            
            if (!organisation) throw { status: 404, msg: "Could not find organisation" };

            if (organisation.kids.includes(id)) {
                const update = await KidModel.findOneAndUpdate({'_id': id}, {'_soft_deleted': true}, {new:true})
                    .catch(() => {
                        throw { status: 500, msg: "Could not delete data" };
                    });

                if (!update) throw { status: 404, msg: "Could not find data" };

                res.send({deletionCompleted: true});
            } else { 
                throw { status: 404, msg: "Could not find kid in organization." }; 
            }
        } catch (error) {
            const log = (error.msg) ? `!!! ERROR ${error.msg}` : error;
            console.log(log) 
            res.status(error.status).send({message: error.msg});
        }
    }

    public deleteFiche = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { kidId, ficheId } = req.body;
            const supervisorId = req.body.verifiedSupervisorId;

            if (!kidId) throw { status: 412, msg: "Given data does not meet requirements" }

            // check if supervisor has acces to kid
            const supervisor: ISupervisor = await SupervisorModel.findOne({_id: supervisorId})
                .catch(() => {
                    throw { status: 500, msg: "Could not save data" };
                });
            if (!supervisor) throw { status: 404, msg: "Could not find supervisor" };

            const supervisorPopulated = await supervisor.populate('organisation').execPopulate();

            if (!supervisorPopulated.organisation.kids.includes(kidId)) throw { status: 403, msg: "Supervisor cannot acces this kid" }

            // find and update kid
            const kid: IKid = await KidModel.findOne({_id: kidId})

            kid.fiches = kid.fiches.filter((fiche) => fiche._id != ficheId);

            await kid.save()
                .catch((err) => {
                    console.log(err)
                    throw { status: 500, msg: "Error occured while updating your data" };
                });

            res.send(kid);

        } catch (error) {
            const log = (error.msg) ? `!!! ERROR ${error.msg}` : error;
            console.log(log) 
            res.status(error.status).send({message: error.msg});
        }
    }
}

export default KidController;