import GFK, { GFKCompany, MyProjects } from '../classes/gfk.js';
import mongoose from 'mongoose';
import { validateEmail } from '../functions/index.js'

export async function checkProjectClient(req, res, next) {
    const { projectid, client_id } = req.params;
    const sessionClientID = req.session.clientID
    req.params.companyid = 'gfk'

         // No authenticated client
        if (!sessionClientID) {
            return res.status(401).json({
                message: "Not authenticated"
            });
        }

        // Session client doesn't match requested client
        if (sessionClientID !== client_id) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

    try {

        // verify project belongs to the client


           const company = await MyProjects.findOne({
            companyid: 'gfk',
            projects: {
                $elemMatch: {
                    projectid: projectid,
                    clientid: client_id
                }
            }
        });

        if (!company) {
            return res.status(404).json({
                message: 'Project does not belong to the client'
            });
        }

        next();

        // res.status(404).send({ Error: `Project does not belong to the client !!` })



    } catch (err) {

        res.status(401).send({ Error: `Could not verfy request ${err}` })
    }


}

export function checkClient(req, res, next) {
    const clientID = req.session?.clientID;

    if (!clientID) {
        return res.status(401).json({ message: "Not authenticated" });
    }
    next();
}

export async function compareProjects(req, res, next) {
    try {
        const { companyid, clientid } = req.params;
        const { projects = [] } = req.body;


        const doc = await MyProjects.findOne({ companyid });

        const oldProjects = doc?.projects.filter(
            p => p.clientid === clientid
        ) || [];

        // Get the client
        const companyDoc = await GFKCompany.findOne(
            {
                company: companyid,
                "clients._id": clientid
            },
            {
                "clients.$": 1
            }
        );

        const client = companyDoc?.clients?.[0] || null;

        const oldMap = new Map(
            oldProjects.map(p => [p.projectid, p])
        );

        const newMap = new Map(
            projects.map(p => [p.projectid, p])
        );

        const created = [];
        const updated = [];
        const deleted = [];

        // Created & Updated
        for (const project of projects) {

            const old = oldMap.get(project.projectid);

            if (!old) {
                created.push(project);
                continue;
            }

            const changes = {};

            for (const key of Object.keys(project)) {

                if (JSON.stringify(project[key]) !== JSON.stringify(old[key])) {
                    changes[key] = {
                        before: old[key],
                        after: project[key]
                    };
                }

            }

            if (Object.keys(changes).length) {
                updated.push({
                    before: old,
                    after: project,
                    changes
                });
            }

        }

        // Deleted
        for (const project of oldProjects) {

            if (!newMap.has(project.projectid)) {
                deleted.push(project);
            }

        }

        req.projectChanges = {
            created,
            updated,
            deleted,
            client
        };

        next();

    } catch (err) {
        next(err);
    }
};

export async function compareProject(req, res, next) {
    try {
        const { companyid, projectid } = req.params;

        const { updatedProject } = req.body;
        const clientid = req.session.clientID


        // Get the existing project
        const projectDoc = await MyProjects.findOne(
            {
                companyid,
                "projects.projectid": projectid
            },
            {
                "projects.$": 1
            }
        );

        const existingProject = projectDoc?.projects?.[0];

        if (!existingProject) {
            return next();
        }

        // Get the client
        const companyDoc = await GFKCompany.findOne(
            {
                company: companyid,
                "clients._id": clientid
            },
            {
                "clients.$": 1
            }
        );



        const client = companyDoc?.clients?.[0] || null;

        if (!client) {
            return next();
        }

        // Compare fields
        const changes = {};

        for (const key of Object.keys(updatedProject)) {

            // Ignore fields you don't care about
            if (["_id", "__v", "updatedAt", "createdAt"].includes(key)) {
                continue;
            }

            if (
                JSON.stringify(existingProject[key]) !==
                JSON.stringify(updatedProject[key])
            ) {
                changes[key] = {
                    before: existingProject[key],
                    after: updatedProject[key]
                };
            }
        }



        req.projectChanges = {
            client,
            project: existingProject,
            updatedProject,
            changes,
            hasChanges: Object.keys(changes).length > 0
        };

        next();

    } catch (err) {
        next(err);
    }
};

export async function validateClientRegister(req, res, next) {
    try {
        const {
            firstname,
            lastname,
            emailaddress,
            profileurl,
            phonenumber,
            authToken,
            clientid
        } = req.body;

        if (!authToken) {
            return res.status(401).json({
                error: 'Authentication token is required.'
            });
        }

        if (!clientid || !clientid.trim()) {
            return res.status(400).json({
                error: 'Client ID is required.'
            });
        }

        if (!emailaddress || !emailaddress.trim()) {
            return res.status(400).json({
                error: 'Email address is required.'
            });
        }

        if (!validateEmail(emailaddress)) {
            return res.status(400).json({
                error: `Invalid email address: ${emailaddress}`
            });
        }

        const gfk = new GFK();

        // Check email
        const emailExists = await gfk.findClientByEmail(emailaddress);

        if (emailExists) {
            return res.status(409).json({
                error: `Email address ${emailaddress} is already registered.`
            });
        }

        // Check client ID
        const clientIdExists = await gfk.findClientByClientID(clientid);

        if (clientIdExists) {
            return res.status(409).json({
                error: `Client ID ${clientid} is already registered.`
            });
        }

        next();

    } catch (error) {
        console.error('Client registration validation error:', error);

        return res.status(500).json({
            error: 'Unable to validate client registration.'
        });
    }
}

export async function validateClientIdentityChange(req, res, next) {
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


export function validateProfile(req, res, next) {
    try {
        const myuser = req.body.myuser;

        if (!myuser) {
            return res.status(400).json({
                error: "Missing user payload"
            });
        }

        const errors = [];

        // -----------------------
        // Client ID validation
        // -----------------------
        const clientId = myuser.clientid?.trim().toLowerCase();

        if (!clientId) {
            errors.push("Client ID is required.");
        } else if (!/^[a-z0-9._]{3,30}$/.test(clientId)) {
            errors.push(
                "Client ID must be 3-30 characters and contain only lowercase letters, numbers, periods, and underscores."
            );
        } else {
            // normalize it so downstream code uses safe value
            myuser.clientid = clientId;
        }

        // -----------------------
        // Email validation
        // -----------------------
        const email = myuser.emailaddress?.trim();

        if (!email) {
            errors.push("Email address is required.");
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push("Please enter a valid email address.");
        } else {
            myuser.emailaddress = email;
        }

        // -----------------------
        // Phone validation
        // -----------------------
        const phone = myuser.phonenumber?.trim();

        if (!phone) {
            errors.push("Phone number is required.");
        } else if (!/^\d{3}-\d{3}-\d{4}$/.test(phone)) {
            errors.push("Phone number must be in the format xxx-xxx-xxxx.");
        } else {
            myuser.phonenumber = phone;
        }

        // -----------------------
        // Fail request if errors
        // -----------------------
        if (errors.length > 0) {
            return res.status(400).json({
                errors
            });
        }

        // attach cleaned payload back
        req.body.myuser = myuser;

        next();
    } catch (err) {
        next(err);
    }
}

