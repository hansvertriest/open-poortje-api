import { NextFunction, Request, Response } from 'express';
import { TestModel } from '../models';

class TestController {
    constructor() {

    }

    public newTest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const newTest = new TestModel(req.body);
            const savedTest = await newTest.save();
            
            res.send(savedTest);
        } catch (error) {
            console.log('!!! Failed newTest()')
            res.status(500).send({ message: "failed to create new test"});
        }
    }

    public getTest = (req: Request, res: Response, next: NextFunction): void => {
        res.send({
            message: 'Trololol',
          })
    }
    
}

export default TestController;