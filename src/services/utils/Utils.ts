import * as bcrypt from 'bcrypt';
import { IAuth } from '../auth';

class Utils {
    static filterKeysAgainstModelKeys(changes, modelKeys) {
        const changesKeys = Object.keys(changes);
        const filteredKeys = changesKeys.filter((key) => !modelKeys.includes(key));

        // construct filteredChanges
        const filteredChanges = {};
        filteredKeys.forEach((key) => {
            filteredChanges[key] = changes[key];
        })

        return filteredChanges;
    }

    static obscureAuthOfModel(model) {
        const obscuredModel = model;
        obscuredModel.auth.password = undefined;
        return obscuredModel;
    }
    
    static hashAuth(auth: IAuth) {
        return new Promise((resolve, reject) => { 

            bcrypt.genSalt(12, function(err, salt) {
                if (err) return reject(err);
        
                // hash the password using our new salt
                bcrypt.hash(auth.password, salt, function(err, hash) {
                    if (err) return reject(err);
                    auth.password = hash;
                    resolve(auth);
                })
            });
        });
    }

}

export default Utils;