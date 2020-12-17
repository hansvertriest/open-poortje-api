import { default as mongoose } from 'mongoose';
import {
	Request,
	Response,
	NextFunction
} from 'express'
import * as GridFsStorage from 'multer-gridfs-storage';
import * as  multer from 'multer';
import * as path from 'path';
import * as crypto from 'crypto';
import { default as sharp } from 'sharp';

import * as stream from 'stream';


interface IMulter {
	storage: multer.StorageEngine,
}

interface MulterRequest extends Request {
    file: any;
}

class GridFs {
	private gfsBucket: any;
	private defaultBucketName: string = 'uploads';
	private bucketName: string;


	constructor() {
	}

	public initStream(bucketName ? : string): void {
		this.bucketName = bucketName ? bucketName : this.defaultBucketName;
		if (mongoose.connection.readyState === 1) {
			// init stream
			this.gfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
				bucketName: this.bucketName,
			});
			console.log('Initiated GridFs stream', {});
		} else {
			console.log('Could not initiate GridFs stream because there is no connection', {});
		}
	}

	/*
		Resizes picture and uploads it to mongoDB
	*/

	public resizeAndUploadImage = async (req: MulterRequest, res: Response, next: NextFunction): Promise < Response < any >> => {
		const input = req.file;
		const dimensionX = (req.body.width && parseInt(req.body.width) <= 500) ? parseInt(req.body.width) : 200;
		const dimensionY = (req.body.height && parseInt(req.body.height) <= 500) ? parseInt(req.body.height) : 200;
		try {
			if (dimensionX !== dimensionY) throw {code: 412, msg: 'Given dimensions must be square.'}
			crypto.randomBytes(16, async (err, buf) => {
				await sharp(input.buffer)
					.resize(dimensionX, dimensionY, {
						fit: 'cover'
					})
					.toFormat("jpeg")
					.jpeg({
						quality: 90
					})
					.toBuffer((err: any, data: any, info: any) => {
						const fileName = buf.toString('hex') + path.extname(input.originalname);
						const bufferStream = new stream.PassThrough();
						bufferStream.end(data);
						bufferStream.pipe(
							this.gfsBucket.openUploadStream(fileName)
							.on('error', (error: any) => {
								console.log('ERROR !!! Error while uploading file', error);
								throw {
									code: 500,
									error: 'Something went wrong while converting your picture.'
								};
							})
							.on('finish', () => {
								req.file.filename = fileName;
								next();
							})
						)
					});
			})
		} catch (error) {
			if (error.code) return res.status(error.code).send(error);
			console.log('ERROR !!! Unknown error occured while converting a picture.', error);
			return res.status(500).send({
				code: 500,
				msg: 'Unknown error occured.'
			});
		}
	}

	/*
		Resizes picture and uploads it to mongoDB
	*/

	public resizeAndUploadDuckPic = async (req: MulterRequest, res: Response, next: NextFunction): Promise < Response < any >> => {
		const input = req.file;
		try {
			crypto.randomBytes(16, async (err, buf) => {
				await sharp(input.buffer)
					.toFormat("png")
					// .jpeg({
					// 	quality: 90
					// })
					.toBuffer((err: any, data: any, info: any) => {
						const fileName = buf.toString('hex') + path.extname(input.originalname);
						const bufferStream = new stream.PassThrough();
						bufferStream.end(data);
						bufferStream.pipe(
							this.gfsBucket.openUploadStream(fileName)
							.on('error', (error: any) => {
								console.log('ERROR !!! Error while uploading file', error);
								throw {
									code: 500,
									error: 'Something went wrong while converting your picture.'
								};
							})
							.on('finish', () => {
								req.file.filename = fileName;
								next();
							})
						)
					});
			})
		} catch (error) {
			if (error.code) return res.status(error.code).send(error);
			console.log('ERROR !!! Unknown error occured while converting a picture.', error);
			return res.status(500).send({
				code: 500,
				msg: 'Unknown error occured.'
			});
		}
	}

	/*
		Pipes the requested image into the response
		FIX: typing
	*/

	public pipeImage(req: MulterRequest, res: Response): void {
		const file = this.gfsBucket
			.find({
				filename: req.params.filename,
			})
			.toArray((err: any, files: any) => {
				if (!files || files.length === 0) {
					return res.status(404).json({
						err: '404: file does not exist',
					});
				}
				this.gfsBucket
					.openDownloadStreamByName(req.params.filename)
					.pipe(res);
			});
	}

	public async getFileId(filename: string) {
		const file: any = await mongoose.connection.db.collection('uploads.files').findOne({'filename': filename});
		if (!file) return null;
		return file._id;
	}

	public async deleteImage(id: string) {
		return new Promise((resolve, reject) => {
			this.gfsBucket.delete(id)
				.then(() => resolve())
				.catch((error) => reject(error));
		}) 
	}
}

export default new GridFs();