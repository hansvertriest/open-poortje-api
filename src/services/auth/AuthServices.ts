import * as jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import { OrganisationModel, SupervisorModel, KidModel } from '../../models';
import { Utils } from '../utils';

import { IConfig } from '../config';
import { IAuth } from '.';

export default class AuthService {
  public config: IConfig;

  constructor(config: IConfig) {
    this.config = config;
  }

  public async encryptAuth(auth: IAuth): Promise<IAuth> {
    const password = await bcrypt.hash(auth.password, this.config.auth.salt);
    return {
        username: auth.username,
        password,
    }
}


  public createAdminToken(auth: IAuth): string {
    if (auth.password === this.config.auth.adminPass && auth.username === this.config.auth.adminUsername) {
      const payload = {
        role: "admin"
      };
      return jwt.sign(payload, this.config.auth.secret, {
        expiresIn: 3600,
      });
    } else {
      return "";
    }
  }

  public async createSupervisorToken(auth: IAuth): Promise<any> {
    const supervisor = await SupervisorModel.findOne({ 'auth.username': auth.username, '_soft_deleted': false });
    const isMatch = (supervisor) ?  await bcrypt.compare(auth.password, supervisor.auth.password) : false;

    if (supervisor !== null && isMatch) {
      const payload = {
        role: "supervisor",
        id: supervisor._id,
        organisation_id: supervisor.organisation,
      };
  
      return jwt.sign(payload, this.config.auth.secret, {
        expiresIn: 24*60*60,
      });
    } else {
      return ""
    }
  }

  public async createOrganisationToken(auth: IAuth): Promise<string> {
    const organisation = await OrganisationModel.findOne({ 'auth.username': auth.username});
    const isMatch = (organisation) ?  await bcrypt.compare(auth.password, organisation.auth.password): false;

    if (organisation != null && isMatch) {
      const payload = {
        role: "organisation",
        id: organisation._id
      };
  
      return jwt.sign(payload, this.config.auth.secret, {});
    } else {
      return ""
    }
  }

  public async createKidToken(auth:IAuth): Promise<string> {
    const kid = await KidModel.findOne({ 'auth.username': auth.username, '_soft_deleted': false });
    
    const isMatch = (kid) ?   await bcrypt.compare(auth.password, kid.auth.password) : false;

    if (kid != null && isMatch) {
      const payload = {
        role: "kid",
        id: kid._id
      };
  
      return jwt.sign(payload, this.config.auth.secret, {
        expiresIn: 3600,
      });
    } else {
      return ""
    }
  }

  public verifyToken = (token: string): any => {
    try {
      const decoded: string | object = jwt.verify(token, this.config.auth.secret);
      if (!decoded) throw {};
      return { result: true, content: decoded };
    } catch( error ) {
      return { result: false };
    }
  }
}