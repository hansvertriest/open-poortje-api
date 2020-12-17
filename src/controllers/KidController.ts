import { NextFunction, Request, Response } from 'express';
import { KidModel, KidKeys, OrganisationModel, IKid, IOrganisation } from '../models';
import { Utils } from '../services';

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
            }, KidKeys);

            // create new model
            const newKid = new KidModel(filteredProps);
            
            // add kid to organisation
            await OrganisationModel.findOneAndUpdate({ _id: req.body.verifiedOrganisationId || organisation_id }, { '$push': { 'kids': newKid._id} }, { new: true, useFindAndModify: false })
                .catch((error) => {
                    throw { status: 500, msg: "Could not save data" };
                });

            // save model
            const savedKid = await newKid.save()
                .catch((error) => {
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
            const kid: IKid = await KidModel.findOne({'_id': id})
                .catch((error) => {
                    throw { status: 404, msg: "Could not find data" };
                });
            
            if (kid == null) throw { status: 404, msg: "Could not find data" };

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
                .catch((error) => {
                    throw { status: 404, msg: "Could not find data" };
                });

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
                .catch((error) => {
                    throw { status: 404, msg: "Could not find data" };
                });

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
        console.log('ddd')
        try {
            const { verifiedOrganisationId, id } = req.body;

            if (!verifiedOrganisationId || !id) throw { status: 412, msg: "Given data does not meet requirements" }

            // find organisation
            const organisation = await OrganisationModel.findOne({'_id': verifiedOrganisationId});
            
            if (organisation.kids.includes(id)) {
                // add sticker
                const kid: IKid = await KidModel.findOne({'_id': id})
                    .catch((error) => {
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

    // UPDATE
    public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { verifiedOrganisationId, id, changes } = req.body;

            if (!changes || !id) throw { status: 412, msg: "Given data does not meet requirements" }

            // filter props to existing keys
            const filteredProps = Utils.filterKeysAgainstModelKeys(changes, KidKeys);

            // find organisation
            const organisation = await OrganisationModel.findOne({'_id': verifiedOrganisationId});

            if (organisation.kids.includes(id)) {
                const update = await KidModel.findOneAndUpdate({'_id': id}, filteredProps, {new: true})
                    .catch((error) => {
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
            
            if (organisation.kids.includes(id)) {
                // add sticker
                const update = await KidModel.findOneAndUpdate({'_id': id}, { '$push': { stickers: stickerObj } }, {new: true})
                    .catch((error) => {
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
            console.log(organisation.kids)
            if (organisation.kids.includes(id)) {
                const update = await KidModel.findOneAndUpdate({'_id': id}, {'_soft_deleted': true}, {new:true})
                    .catch((error) => {
                        throw { status: 500, msg: "Could not delete data" };
                    });

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
}

export default KidController;