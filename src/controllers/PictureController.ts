import express, {
	Request,
	Response,
	NextFunction
} from 'express';
import { GridFs } from '../services';
import { default as mongoose } from 'mongoose';

import { PictureModel, IPicture, pictureSchema } from '../models';

class PictureController {
	constructor() {}

	public show = (req: Request, res: Response, next: NextFunction): void => {
		GridFs.pipeImage(req, res);
	}

	public uploadImage = async (req: Request, res: Response, next: NextFunction): Promise < Response < any >> => {
		try {
			if (req.file) {
				res.status(200).send({
					filename: req.file.filename,
				});

			} else {
				throw {
					code: 412,
					msg: 'No files were received'
				}
			}
		} catch (error) {
			if (error.code) {
				return res.status(error.code).send(error.msg);
			}
			return res.status(500).send({code:500, msg: 'unknown error occured'});
		}
	}

	// public getPictureInfo = async (req: Request, res: Response, next: NextFunction): Promise < Response < any >> => {
	// 	try {
	// 		const {
	// 			id
	// 		} = req.query;
	// 		const pictureInfo: IPicture = await PictureModel.findById(mongoose.Types.ObjectId(id)).exec();

	// 		if (pictureInfo) {
	// 			return res.status(200).send(pictureInfo);
	// 		} else {
	// 			throw {
	// 				code: 404,
	// 				msg: 'no such picture'
	// 			};
	// 		}
	// 	} catch (error) {
	// 		if (error.code) {
	// 			return res.status(error.code).send(error);
	// 		}
	// 		return res.status(500).send(error);
	// 	}
	// }

	// public uploadPicture = async (req: Request, res: Response, next: NextFunction): Promise < Response < any >> => {
	// 	try {
	// 		if (req.file) {
	// 			const {
	// 				title,
	// 				description
	// 			} = req.body;
	// 			const picture: IPicture = new PictureModel({
	// 				title,
	// 				description,
	// 				filename: req.file.filename,
	// 			});

	// 			await picture.save()
	// 				.then((response) => {
	// 					return res.status(200).send(response)
	// 				});

	// 		} else {
	// 			throw {
	// 				code: 412,
	// 				msg: 'No files were received'
	// 			}
	// 		}
	// 	} catch (error) {
	// 		if (error.code) {
	// 			return res.status(error.code).send(error.msg);
	// 		}
	// 		return res.status(500).send(error);
	// 	}
	// }

	// public uploadPictureWithFilename = async (req: Request, res: Response, next: NextFunction): Promise < Response < any >> => {
	// 	try {
	// 			const {
	// 				title,
	// 				description, 
	// 				filename,
	// 			} = req.body;
	// 			const picture: IPicture = new PictureModel({
	// 				title,
	// 				description,
	// 				filename,
	// 			});

	// 			await picture.save()
	// 				.then((response) => {
	// 					return res.status(200).send(response)
	// 				})
	// 				.catch((error) => {
	// 					throw error;
	// 				})
	// 	} catch (error) {
	// 		if (error.code) {
	// 			return res.status(error.code).send(error.msg);
	// 		}
	// 		return res.status(500).send({code:500, msg: 'unknown error occured'});
	// 	}
	// }


}

export default PictureController;