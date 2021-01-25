import { NextFunction, Request, Response } from 'express';
import { FicheTypeModel, FicheTypeKeys } from '../models';
import { Utils } from '../services';

class TestController {

    //  CREATE

    public new = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // get props
            const { name, description, thumbnail } = req.body;

            if (!name || !description || !thumbnail) throw { status: 403, msg: "Insufficient data" };

            // Create new do
            const newFicheType = new FicheTypeModel({
                name,
                description,
                thumbnail
            });

            // save model
            const savedFicheType = await newFicheType.save()
                .catch((error:any) => {
                    console.log(error)
                    if (error.code == 11000) throw { status: 412, msg: "Duplicate kid name" };
                    throw { status: 500, msg: "Could not save data" };
                });
        
            res.send(savedFicheType); 
        } catch (error) {
            const log = (error.msg) ? `!!! ERROR ${error.msg}` : error;
            console.log(log) 
            res.status(error.status).send({message: error.msg});
        }
    }

    // READ

    public getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {

            const FicheTypes = await FicheTypeModel.find({_soft_deleted: false})
                .catch(() => {
                    throw { status: 500, msg: "Error occured while finding your data" };
                });
        
            res.send(FicheTypes); 
        } catch (error) {
            const log = (error.msg) ? `!!! ERROR ${error.msg}` : error;
            console.log(log) 
            res.status(error.status).send({message: error.msg});
        }
    }
    
    // UPDATE

    public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // get props
            const { id, changes } = req.body;

            if (!id || !changes ) throw { status: 403, msg: "Insufficient data" };  

            const filteredChanges = Utils.filterKeysAgainstModelKeys(changes, FicheTypeKeys);

            const FicheTypes = await FicheTypeModel.findOneAndUpdate({_id: id}, filteredChanges, {new: true})
                .catch(() => {
                    throw { status: 500, msg: "Error occured while updating your data" };
                });
        
            res.send(FicheTypes); 
        } catch (error) {
            const log = (error.msg) ? `!!! ERROR ${error.msg}` : error;
            console.log(log) 
            res.status(error.status).send({message: error.msg});
        }
    }

    // REMOVE

    public softDelete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // get props
            const id = req.params.id;

            if (!id) throw { status: 403, msg: "Insufficient data to delete fiche-type" };  

            const FicheTypes = await FicheTypeModel.findOneAndUpdate({_id: id}, {_soft_deleted: true}, {new: true})
                .catch(() => {
                    throw { status: 500, msg: "Error occured while updating your data" };
                });
        
            res.send({ deletion: 'ok' }); 
        } catch (error) {
            const log = (error.msg) ? `!!! ERROR ${error.msg}` : error;
            console.log(log) 
            res.status(error.status).send({message: error.msg});
        }
    }
}

export default TestController;