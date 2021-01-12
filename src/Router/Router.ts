import { Application, NextFunction, Request, Response } from 'express';
import { default as multer } from 'multer';
import { memoryStorage } from 'multer';

import {
    TestController,
    PictureController,
    OrganisationController,
    SupervisorController,
    KidController
} from '../controllers';
import { AuthService, IConfig, GridFs } from '../services';

class Router {
    private app: Application;

    private AuthService: AuthService;
    private TestController: TestController;
    private PictureController: PictureController;
    private OrganisationController: OrganisationController;
    private SupervisorController: SupervisorController;
    private KidController: KidController;

    constructor( app: Application, config: IConfig ) {
        this.app = app;

        this.AuthService = new AuthService(config);
        this.registerControllers();
        this.registerRoutes();
    }

    private sendAdminToken = (req: Request, res: Response, next: NextFunction): void => {
        try {
            const token = this.AuthService.createAdminToken(req.body.auth);
            if (token == '') {
                throw {msg: 'Incorrect admin credentials'};
            } else {
                res.status(200).send({token});
            }
        } catch( error ) {
            console.log(`ERROR! ${error}`)
            res.status(412).send({message: error.msg});
        }
    }

    private sendOrganisationToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const token = await this.AuthService.createOrganisationToken(req.body.auth);
            if (token === '') {
                throw {msg: 'Incorrect organisation credentials'};
            } else {
                res.status(200).send({token});
            }
        } catch( error ) {
            console.log(`ERROR! ${error}`)
            res.status(412).send({message: error.msg});
        }
    }

    private sendSupervisorToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const token = await this.AuthService.createSupervisorToken(req.body.auth);
            if (token === '') {
                throw {msg: 'Incorrect supervisor credentials'};
            } else {
                res.status(200).send({token});
            }
        } catch( error ) {
            console.log(`ERROR! ${error}`)
            res.status(412).send({message: error.msg});
        }
    }

    private sendKidToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const token = await this.AuthService.createKidToken(req.body.auth);
            if (token === '') {
                throw {msg: 'Incorrect kid credentials'};
            } else {
                res.status(200).send({token});
            }
        } catch( error ) {
            console.log(`ERROR! ${error}`)
            res.status(412).send({message: error.msg});
        }
    }

    private checkAdminAccess = (req: Request, res: Response, next: NextFunction): void => {
        try {
            const verification = this.AuthService.verifyToken(req.headers.authorization.split(' ')[1]);
            if (verification.result && verification.content.role === 'admin') {
                next();
            } else {
                throw {status: 403, msg: 'Acces denied' }
            }
        } catch( error ) {
            console.log(`ERROR! ${error}`)
            res.status(error.status).send({message: error.msg});
        }
    }

    private checkOrganisationAccess = (req: Request, res: Response, next: NextFunction): void => {
        try {
            const verification = this.AuthService.verifyToken(req.headers.authorization.split(' ')[1]);
            if (verification.result && verification.content.role === 'organisation') {
                req.body.verifiedOrganisationId = verification.content.id;
                next();
            } else {
                throw {status: 403, msg: 'Acces denied' }
            }
        } catch( error ) {
            console.log(`ERROR! ${error}`)
            res.status(error.status || 500).send({message: error.msg});
        }
    }

    private checkKidAccess = (req: Request, res: Response, next: NextFunction): void => {
        try {
            const verification = this.AuthService.verifyToken(req.headers.authorization.split(' ')[1]);
            if (verification.result && verification.content.role === 'kid') {
                req.body.verifiedKidId = verification.content.id;
                next();
            } else {
                throw {status: 403, msg: 'Acces denied' }
            }
        } catch( error ) {
            console.log(`ERROR! ${error}`)
            res.status(error.status || 500).send({message: error.msg});
        }
    }

    private checkSupervisorAccess = (req: Request, res: Response, next: NextFunction): void => {
        try {
            const verification = this.AuthService.verifyToken(req.headers.authorization.split(' ')[1]);
            if (verification.result && verification.content.role === 'supervisor') {
                req.body.verifiedSupervisorId = verification.content.id;
                req.body.verifiedOrganisationId = verification.content.organisation_id;
                next();
            } else {
                throw {status: 403, msg: 'Acces denied' }
            }
        } catch( error ) {
            console.log(`ERROR! ${error}`)
            res.status(error.status || 500).send({message: error.msg});
        }
    }
    
    private registerControllers() {
        this.TestController = new TestController();
        this.PictureController = new PictureController();
        this.OrganisationController = new OrganisationController();
        this.SupervisorController = new SupervisorController();
        this.KidController = new KidController();
    }

    private registerRoutes() {
        // admin routes
        this.app.post('/admin/organisation', this.checkAdminAccess, this.OrganisationController.new);
        this.app.get('/admin/organisation/:id', this.checkAdminAccess, this.OrganisationController.getById);
        this.app.get('/admin/organisations', this.checkAdminAccess, this.OrganisationController.getAll);
        this.app.get('/admin/supervisor/:id', this.checkAdminAccess, this.SupervisorController.getById);

        this.app.post('/token/organisation', this.sendOrganisationToken);
        this.app.post('/token/supervisor', this.sendSupervisorToken);
        this.app.post('/token/kid', this.sendKidToken);
        this.app.post('/token/admin', this.sendAdminToken);

        this.app.get('/organisation', this.checkOrganisationAccess, this.OrganisationController.getById);
        this.app.post('/organisation/supervisor', this.checkOrganisationAccess, this.SupervisorController.new);
        this.app.get('/organisation/supervisor/:id', this.checkOrganisationAccess, this.SupervisorController.getById);
        this.app.get('/organisation/supervisors', this.checkOrganisationAccess, this.SupervisorController.getAll);
        this.app.patch('/organisation/supervisor', this.checkOrganisationAccess, this.SupervisorController.update);
        this.app.patch('/organisation/supervisor/auth', this.checkOrganisationAccess, this.SupervisorController.authUpdate);
        this.app.delete('/organisation/supervisor', this.checkOrganisationAccess, this.SupervisorController.softDelete);
        this.app.post('/organisation/kid', this.checkOrganisationAccess, this.KidController.new);
        this.app.get('/organisation/kid/:id', this.checkOrganisationAccess, this.KidController.getById);
        this.app.get('/organisation/kids', this.checkOrganisationAccess, this.KidController.getAll);
        this.app.patch('/organisation/kid', this.checkOrganisationAccess, this.KidController.update);
        this.app.delete('/organisation/kid', this.checkOrganisationAccess, this.KidController.softDelete);
        this.app.patch('/organisation/kid/auth', this.checkOrganisationAccess, this.KidController.authUpdate);


        this.app.get('/supervisor', this.checkSupervisorAccess, this.SupervisorController.getSelf);
        this.app.get('/supervisor/kids', this.checkSupervisorAccess, this.KidController.getAll);
        this.app.post('/supervisor/kid/sticker', this.checkSupervisorAccess, this.KidController.addSticker);
        this.app.get('/supervisor/kid/stickers', this.checkSupervisorAccess, this.KidController.getAllStickers);
        this.app.get('/supervisor/kid/:id', this.checkSupervisorAccess, this.KidController.getById);

        this.app.get('/kid', this.checkKidAccess, this.KidController.getSelf);

        this.app.post(
			'/picture',
			multer({ storage: memoryStorage() }).single('picture'),
			GridFs.resizeAndUploadImage,
			this.PictureController.uploadImage
        );
        this.app.get('/picture/:filename', this.PictureController.show);
    }
}

export default Router;