import mongoose from 'mongoose';
import transporter from '../functions/mailer.js';
import path from 'path'
import { fileURLToPath } from "url";




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

}

export default Geotech;