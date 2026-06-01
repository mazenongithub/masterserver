import mongoose from 'mongoose';
import { GFKCompany } from '../classes/gfk.js';

async function validateClientIdentityChange(req, res, next) {
    try {
        const sessionClientId = req.session.clientID;

        if (!sessionClientId) {
            return res.status(401).json({
                error: "Not authenticated"
            });
        }

        const company = await GFKCompany.findOne(
            {
                company: "gfk",
                "clients._id": new mongoose.Types.ObjectId(sessionClientId)
            },
            {
                "clients.$": 1
            }
        );

        if (!company || !company.clients.length) {
            return res.status(404).json({
                error: "Client not found"
            });
        }

        const currentClient = company.clients[0];

        const currentEmail = currentClient.emailaddress;
        const currentClientCode = currentClient.clientid;

        const newEmail = req.body.myuser.emailaddress;
        const newClientCode = req.body.myuser.clientid;

        const emailChanged =
            newEmail &&
            newEmail.toLowerCase() !== currentEmail?.toLowerCase();

        const clientIdChanged =
            newClientCode &&
            newClientCode !== currentClientCode;

        const normalizePhone = phone =>
            phone ? phone.replace(/\D/g, "") : "";

        const currentPhone = currentClient.phonenumber;
        const newPhone = req.body.myuser.phonenumber;

      

        const phoneChanged =
            newPhone &&
            newPhone !== currentPhone;

            

        // Nothing changed
        if (!emailChanged && !clientIdChanged && !phoneChanged) {
           
            return next();
        }

        const conflictConditions = [];

        if (emailChanged) {
            conflictConditions.push({
                clients: {
                    $elemMatch: {
                        emailaddress: newEmail,
                        _id: {
                            $ne: new mongoose.Types.ObjectId(sessionClientId)
                        }
                    }
                }
            });
        }

        if (clientIdChanged) {
            conflictConditions.push({
                clients: {
                    $elemMatch: {
                        clientid: newClientCode,
                        _id: {
                            $ne: new mongoose.Types.ObjectId(sessionClientId)
                        }
                    }
                }
            });
        }


        if (phoneChanged) {
            conflictConditions.push({
                clients: {
                    $elemMatch: {
                        phonenumber: newPhone,
                        _id: {
                            $ne: new mongoose.Types.ObjectId(sessionClientId)
                        }
                    }
                }
            });
        }

        const existing = await GFKCompany.findOne({
            company: "gfk",
            $or: conflictConditions
        });

        if (existing) {
            return res.status(400).json({
                error:
                    "The email address, phone number, or client ID is already being used by another client."
            });
        }

        next();
    } catch (err) {
        next(err);
    }
}

export default validateClientIdentityChange;