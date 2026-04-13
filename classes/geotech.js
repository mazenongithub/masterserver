import mongoose from 'mongoose';
import transporter from '../functions/mailer.js';
import path from 'path'
import { fileURLToPath } from "url";
import bcrypt from 'bcryptjs'
import GFK, { GFKCompany, MyProjects } from './gfk.js';




const ContactSchema = new mongoose.Schema(
    {
        datein: {
            type: Date,
            default: Date.now
        },

        fullname: {
            type: String,
            trim: true,
            required: true
        },

        company: {
            type: String,
            trim: true,
            default: ""
        },

        emailaddress: {
            type: String,
            trim: true,
            lowercase: true
        },

        phonenumber: {
            type: String,
            trim: true
        },

        projectaddress: {
            type: String,
            trim: true
        },

        projectcity: {
            type: String,
            trim: true
        },

        // Client type
        clienttype: {
            residential: { type: Boolean, default: false },
            commercial: { type: Boolean, default: false },
            mixeduse: { type: Boolean, default: false },
            publicagency: { type: Boolean, default: false }
        },

        // Services requested
        services: {
            investigation: { type: Boolean, default: false },
            planreview: { type: Boolean, default: false },
            compactiontesting: { type: Boolean, default: false },
            foundationdesign: { type: Boolean, default: false },
            pavementdesign: { type: Boolean, default: false },
            specialinspection: { type: Boolean, default: false },
            retainingwall: { type: Boolean, default: false },
            foundationinspection: { type: Boolean, default: false }
        },

        preferredContact: {
            type: String,
            enum: ["email", "phone"],
            required: true
        },

        message: {
            type: String,
            trim: true
        },

        captchaToken: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

const GeotechContactUs = mongoose.model("GeotechContactUs", ContactSchema);
class Geotech {

    async insertContact(contact) {

        try {

            const contactus = await GeotechContactUs.insertOne(contact);
            return contactus;


        } catch (err) {

            console.error('Error inserting contact form:', err);
            return { message: `Error: Could not insert contact form - ${err.message}` };
        }


    }

    async findProjectsByClientID(clientID) {
        try {
            // 1️⃣ Validate clientID
            if (!clientID || !mongoose.Types.ObjectId.isValid(clientID)) {
                throw new Error("Invalid client ID");
            }

            const company = await MyProjects.findOne({ companyid: "gfk" });

            const allprojects = company?.projects.filter(
                p => p.clientid === clientID
            ) || [];

            return allprojects;

        } catch (err) {
            console.error("findProjectsByClientID error:", err);
            throw err;
        }
    }


    async findClientByID(clientID) {
        try {
            // 1️⃣ Validate ID
            if (!clientID || !mongoose.Types.ObjectId.isValid(clientID)) {
                throw new Error("Invalid client ID");
            }

            // 2️⃣ Query embedded client
            const company = await GFKCompany.findOne(
                { company: "gfk", "clients._id": clientID },
                { "clients.$": 1 }
            );

            if (!company || !company.clients.length) {
                return null; // client not found
            }

            // 3️⃣ Return the matched client
            return company.clients[0];

        } catch (err) {
            console.error("findClientByID error:", err);
            throw err; // let route handler decide response
        }
    }

    async sendContactEmail(values) {

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        const emailaddress = values.emailaddress;

        let clienttype = ""
        if (values.clienttype.residential) {
            clienttype += `residential;`
        }
        if (values.clienttype.commercial) {
            clienttype += `commercial;`
        }

        if (values.clienttype.mixeduse) {
            clienttype += `mixeduse;`
        }

        if (values.clienttype.publicagency) {
            clienttype += `public agency;`
        }

        let servicetype = "";
        if (values.services.geotechnicalinvestigation) {
            servicetype += `geotechnical investigation;`
        }
        if (values.services.planreview) {
            servicetype += `plan review;`
        }

        if (values.services.foundationdesign) {
            servicetype += `foundation design;`
        }

        if (values.services.compactiontesting) {
            servicetype += `compaction testing;`
        }

        if (values.services.pavementdesign) {
            servicetype += `pavement design;`
        }

        if (values.services.foundationinspection) {
            servicetype += `foundation inspection;`
        }

        if (values.services.retainingwall) {
            servicetype += `retaining wall;`
        }

        if (values.services.specialinspection) {
            servicetype += `special inspection;`
        }

        const createdAt = new Date(values.createdAt).toLocaleTimeString("en-US", {
            timeZone: "America/Los_Angeles",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        })



        const htmlEmail = (values) => {
            return (`<div>
                <div style="margin-bottom: 10px;">
                    <div style="text-align: center"><img style="width:50%; margin:auto;" src="cid:emailheader" alt="Email Header" /></div>
                </div>
                <div style="margin-bottom:10px; text-align: center; font-family:Tahoma, Arial, Helvetica, sans-serif; margin-left: 15px"> <span style="font-size: 18px">GEOTECHNICAL SERVICE REQUEST</span> </div>
                <div style="margin-bottom:10px; font-family:Tahoma, Arial, Helvetica, sans-serif; margin-left: 15px"> <span style="font-size: 16px">${values.fullname}</span> </div>
                <div style="margin-bottom:10px; font-family:Tahoma, Arial, Helvetica, sans-serif; margin-left: 15px"> <span style="font-size: 16px">${values.company}</span> </div>
                <div style="margin-bottom:10px; font-family:Tahoma, Arial, Helvetica, sans-serif; margin-left: 15px"> <span style="font-size: 16px">${values.emailaddress}</span> </div>
                <div style="margin-bottom:10px; font-family:Tahoma, Arial, Helvetica, sans-serif; margin-left: 15px"> <span style="font-size: 16px">${values.phonenumber}</span> </div>
                <div style="margin-bottom:10px; font-family:Tahoma, Arial, Helvetica, sans-serif; margin-left: 15px"> <span style="font-size: 16px">Project Location: ${values.projectaddress} ${values.projectcity}</span> </div>
                <div style="margin-bottom:10px; font-family:Tahoma, Arial, Helvetica, sans-serif; margin-left: 15px"> <span style="font-size: 16px">Client Type: ${clienttype}</span> </div>
                <div style="margin-bottom:10px; font-family:Tahoma, Arial, Helvetica, sans-serif; margin-left: 15px"> <span style="font-size: 16px">Service Type: ${servicetype}</span> </div>
                <div style="margin-bottom:10px; font-family:Tahoma, Arial, Helvetica, sans-serif; margin-left: 15px"> <span style="font-size: 16px">${values.message}</span> </div>
                <div style="margin-bottom:10px; font-family:Tahoma, Arial, Helvetica, sans-serif; margin-left: 15px"> <span style="font-size: 16px">Created at ${createdAt}</span> </div>
            </div>`)
        }

        const adminEmail = await transporter.sendMail({
            from: `"CivilEngineer.io" <mazen@civilengineer.io>`,
            to: 'mazen@civilengineer.io',
            replyTo: values.emailaddress,
            subject: 'GEOTECHNICAL SERVICE REQUEST',
            html: htmlEmail(values),
            attachments: [
                {
                    filename: "emailheader.jpg",
                    path: path.join(__dirname, "../uploads/images/emailheader.jpg"),
                    cid: "emailheader" // MUST match src="cid:emailheader"
                }]
        })

        const clientEmail = await transporter.sendMail({
            from: `"CivilEngineer.io" <mazen@civilengineer.io>`,
            to: values.emailaddress,
            replyTo: values.emailaddress,
            subject: 'GEOTECHNICAL SERVICE REQUEST',
            html: htmlEmail(values),
            attachments: [
                {
                    filename: "emailheader.jpg",
                    path: path.join(__dirname, "../uploads/images/emailheader.jpg"),
                    cid: "emailheader" // MUST match src="cid:emailheader"
                }]
        })

        await Promise.all([adminEmail, clientEmail]);
    }

    async sendClientEmail(values) {
        await transporter.sendMail({
            from: `"CivilEngineer.io" <mazen@civilengineer.io>`,
            to: [
                'mazen@civilengineer.io',
                values.emailaddress
            ],
            replyTo: values.emailaddress,
            subject: 'GEOTECHNICAL SERVICE REQUEST',
            html: ``
        })
    }


    async clientLogin(myClient) {
        try {
            // Must have at least one provider
            if (!myClient.apple && !myClient.google) {
                return { message: 'Missing Apple or Google ID' };
            }

            // Determine provider
            const provider = myClient.apple ? 'apple' : 'google';
            const providerId = myClient[provider];

            // Look for existing client
            let existingClient = null;
            if (provider === 'apple') {
                existingClient = await this.getAppleUser(providerId);
            } else {
                existingClient = await this.getGoogleUser(providerId);
            }

            if (existingClient) {
                // ✅ Wrap in object with "client" property
                return existingClient;
            }

            // Ensure client ID exists before registration
            if (!myClient.clientid) {
                return { message: 'Cannot register client — client ID missing' };
            }

            // Register new client
            const newClient = await this.registerNewUser(myClient);

            // ✅ Wrap in object with "client" property
            return newClient;

        } catch (err) {
            console.error('Client login error:', err);
            return { message: `Error during client login: ${err.message}` };
        }
    }

    hashPassword(password) {

        return bcrypt.hashSync(password, 10);
    }

    async getAppleUser(appleId) {
        try {
            const result = await GFKCompany.aggregate([
                { $match: { company: "gfk" } },
                { $unwind: "$clients" },
                {
                    $match: {
                        "clients.apple": { $exists: true, $ne: null, $ne: "" }
                    }
                },
                {
                    $replaceRoot: { newRoot: "$clients" }
                }
            ]);

            const allClients = result;

            for (const client of allClients) {
                const isMatch = bcrypt.compareSync(appleId, client.apple);
                if (isMatch) {
                    return { client }; // Found
                }
            }

            // Return null if no match found (important!)
            return null;

        } catch (err) {
            console.error('Error finding Apple client:', err);
            throw err; // Let clientLogin handle it
        }
    }


    async getGoogleUser(googleId) {
        try {
            const result = await GFKCompany.aggregate([
                { $match: { company: "gfk" } },
                { $unwind: "$clients" },
                {
                    $match: {
                        "clients.google": { $exists: true, $ne: null, $ne: "" }
                    }
                },
                {
                    $replaceRoot: { newRoot: "$clients" }
                }
            ]);

            const allClients = result;

            for (const client of allClients) {
                const isMatch = bcrypt.compareSync(googleId, client.google);
                if (isMatch) {
                    return { client }; // Found
                }
            }

            // Return null if no match found (important!)
            return null;

        } catch (err) {
            console.error('Error finding Google client:', err);
            throw err; // Let clientLogin handle it
        }
    }


    async registerNewUser(values) {
        try {
            const SALT_ROUNDS = 10;

            const appleHash = values.apple
                ? await bcrypt.hash(values.apple, SALT_ROUNDS)
                : "";

            const googleHash = values.google
                ? await bcrypt.hash(values.google, SALT_ROUNDS)
                : "";

            const newClient = {
                clientid: values.clientid,
                prefix: values.prefix || "",
                firstname: values.firstname,
                lastname: values.lastname,
                company: values.company || "",
                address: values.address || "",
                city: values.city || "",
                contactstate: values.contactstate || "",
                zipcode: values.zipcode || "",
                emailaddress: values.emailaddress || "",
                phonenumber: values.phonenumber || "",
                apple: appleHash,
                google: googleHash
            };

            // Check duplicates
            const existing = await GFKCompany.findOne({
                company: "gfk",
                $or: [
                    { "clients.apple": appleHash },
                    { "clients.google": googleHash }
                ]
            });

            if (existing) {
                throw new Error("Client already exists");
            }

            // Push client and return updated doc
            const result = await GFKCompany.findOneAndUpdate(
                { company: "gfk" },
                { $push: { clients: newClient } },
                { new: true }
            );

            if (!result) {
                throw new Error("Company not found");
            }

            // Get the last inserted client (Mongo just added it)
            const client = result.clients[result.clients.length - 1];

            return { client };

        } catch (err) {
            console.error("Error registering new client:", err);
            return {
                message: `Error: Could not register client - ${err.message}`
            };
        }
    }

    async saveProfile(values) {
        try {
            if (!values || !values._id) {
                throw new Error("Client _id is required for update");
            }

            const clientId = new mongoose.Types.ObjectId(values._id);

            const result = await GFKCompany.findOneAndUpdate(
                { company: "gfk", "clients._id": clientId },
                {
                    $set: Object.fromEntries(
                        Object.entries(values).map(([k, v]) => [`clients.$.${k}`, v])
                    )
                },
                { new: true }
            );

            if (!result) {
                throw new Error("Client not found");
            }

            return result.clients.find(c => c._id.equals(clientId));

        } catch (err) {
            console.error("Error in saveProfile:", err);
            throw err;
        }
    }

}

export default Geotech;