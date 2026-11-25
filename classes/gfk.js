import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'
import transporter from '../functions/mailer.js';
import UnconfinedCalcs from './unconfinedcalcs.js';
import { calcdryden, calcmoist } from '../functions/gfkfunctions.js';
import SoilClassification from './soilclassification.js';

const GraphicLogSchema = new mongoose.Schema({
    companyid: {
        type: String,
        required: true,
        unique: true
    },
    graphics: [{
        graphicid: String,
        code: String,
        graphiclog: String,
        description: String
    }]
});

const ProjectSchema = new mongoose.Schema({
    companyid: String,
    projects: [{
        projectid: String,
        projectnumber: String,
        series: String,
        title: String,
        sow: String,
        clientid: String,
        engineerid: String,
        projectaddress: String,
        projectcity: String,
        projectapn: String

    }]

})



const sectionSchema = new mongoose.Schema({
    sectionid: String,
    section: String,
    type: String,
    content: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        default: 'text'
    },
    referenceid: {
        type: String,
        default: ''
    },
    subsections: [{
        type: mongoose.Schema.Types.Mixed
    }]
}, { _id: false });

sectionSchema.add({
    subsections: [sectionSchema]
});

const reportSchema = new mongoose.Schema({
    reportid: String,
    projectid: String,
    datereport: {
        type: Date,
        default: Date.now
    },
    author: String,
    type: String,
    reporttitle: String,
    sections: {
        type: [sectionSchema],
        default: []
    }
});

const figureSchema = new mongoose.Schema({
    projectid: String,
    figures: [{
        figureid: String,
        figuretitle: String,
        figureurl: String,
        figurecaption: String,
        orientation: {
            type: String,
            enum: ['portrait', 'landscape'],
            default: 'portrait'
        }
    }]
});


const BoringSchema = new mongoose.Schema({
    projectid: String,
    borings: [{
        boringid: String,
        projectid: String,
        boringnumber: String,
        datedrilled: String,
        loggedby: String,
        drillrig: String,
        elevation: String,
        diameter: String,
        gwdepth: String,
        latitude: String,
        longitude: String,
        samples: [{
            sampleid: String,
            boringid: String,
            sampleset: String,
            samplenumber: String,
            sampledepth: String,
            depth: String,
            diameter: String,
            samplelength: String,
            description: String,
            wetwgt: String,
            drywgt: String,
            wetwgt_2: String,
            uscs: String,
            spt: String,
            tarewgt: String,
            tareno: String,
            graphicid: String,
            ll: String,
            pi: String,
            remarks: String,
            sptlength: String,
            linebreak: {
                type: Boolean,
                default: false
            },
            sieve: {
                wgt34: String,
                wgt38: String,
                wgt4: String,
                wgt10: String,
                wgt30: String,
                wgt40: String,
                wgt100: String,
                wgt200: String,
            },
            unconfined:
                [{
                    unid: String,
                    displacement: String,
                    loadreading: String
                }]

        }]

    }]
})

const fieldReportSchema = new mongoose.Schema({
    projectid: String,
    fieldreports: [{
        fieldid: String,
        datereport: String,
        content: String,
        images: [{
            image: String,
            imageid: String,
            caption: String
        }],
        compactiontests: [{
            testid: String,
            timetest: {
                type: Date,
                default: Date.now
            },
            testnum: String,
            elevation: String,
            location: String,
            wetpcf: String,
            moistpcf: String,
            curveid: String,
        }]
    }]


})

const compactionCurveSchema = ({

    projectid: String,
    compactioncurves: [{
        curveid: String,
        curvenumber: String,
        description: String,
        maxden: String,
        moist: String
    }]

})

const seismicSchema = new mongoose.Schema({
    projectid: String,
    siteacceleration: String,
    magnitude: String,
    points: [{
        pointid: String,
        sampleid: String,
        spt: String,
        pi: String,
        fines: String,
        depth: String,
        strain: [{
            strainid: String,
            toplayer: String,
            bottomlayer: String,
            strainratio: String
        }]

    }]
})

const PTSchema = new mongoose.Schema({
    projectid: String,
    sections: [{
        sectionid: String,
        sectionname: String,
        layers: [{
            layerid: String,
            layername: String,
            toplayer: String,
            bottomlayer: String,
            ll: String,
            pi: String,
            fines: String,
            micro: String
        }]

    }]

})

const slopeSchema = new mongoose.Schema({
    projectid: String,
    vseismic: String,
    hseismic: String,
    sections: [{
        sectionid: String,
        sectionname: String,
        slices: String,
        layers: [{
            layerid: String,
            layer: String,
            layertype: String,
            linetype: String,
            color: String,
            layerorder: String,
            points: [{
                pointid: String,
                xcoord: String,
                ycoord: String
            }],
            strength: {
                gamma: String,
                cohesion: String,
                friction: String
            },
            failure: {
                rx: String,
                ry: String,
                cx: String,
                cy: String
            }
        }],


    }]


})

const EngineerSchema = new mongoose.Schema({
    engineerid: String,
    google: String,
    apple: String,
    uid: String,
    firstname: String,
    lastname: String,
    emailaddress: String,
    profileurl: String,
    phonenumber: String
})

const gfkSchema = new mongoose.Schema({
    company: String,
    clients: [{
        clientid: String,
        prefix: String,
        firstname: String,
        lastname: String,
        company: String,
        address: String,
        city: String,
        contactstate: String,
        zipcode: String,
        emailaddress: String,
        phonenumber: String,
        uid: String,
        profileurl: String

    }]

})



const TimesheetSchema = new mongoose.Schema({
    projectid: {
        type: String,
        required: true,
        index: true
    },

    labor: [
        {
            engineerid: { type: String, required: true },
            laborid: { type: String, required: true, unique: true },
            timein: { type: Date, required: true },   // stored as UTC
            timeout: { type: Date, required: true },  // stored as UTC
            laborrate: { type: Number, required: true },
            description: String
        }
    ],

    costs: [
        {
            engineerid: { type: String },
            costid: { type: String, required: true, unique: true },
            datein: { type: Date, required: true },  // stored as UTC
            unitcost: { type: Number, required: true },
            unit: { type: String, default: "each" },
            quantity: { type: Number, default: 1 },
            description: String
        }
    ],

    invoices: [
        {
            invoiceid: { type: String, required: true },
            dateinvoice: { type: Date, required: true }, // stored as UTC
            labor: [{ type: String }], // references labor.laborid
            costs: [{ type: String }],
            status: String,
            transactionid: { type: String },
            paymentstatus: {
                type: String,
                default: "Pending"
            },

            datepaid: Date  // references costs.costid
        }
    ]
});


const CompactionTableSchema = new mongoose.Schema({

    projectid: {
        type: String,
        required: true,
        unique: true
    },

    tables: [{
        tableid: {
            type: String,
            required: true
        },

        tabletitle: String,

        compactiontests: [String]
    }]

});

const ScheduleSchema = new mongoose.Schema({
    projectid: {
        type: String,
        required: true,
        index: true
    },

    labor: [
        {
            engineerid: { type: String, required: true },
            laborid: { type: String, required: true },
            timein: { type: Date, required: true },
            timeout: { type: Date, required: true },
            laborrate: { type: Number, required: true },
            description: String
        }
    ],

    costs: [
        {
            engineerid: { type: String },
            costid: { type: String, required: true },
            datein: { type: Date, required: true },
            unitcost: { type: Number, required: true },
            unit: { type: String, default: "each" },
            quantity: { type: Number, default: 1 },
            description: String
        }
    ],

    proposals: [
        {
            proposalid: {
                type: String,
                required: true
            },

            version: {
                type: Number,
                default: 1
            },

            dateproposal: {
                type: Date,
                required: true
            },

            expirationdate: Date,

            labor: [{ type: String }], // references labor.laborid

            costs: [{ type: String }], // references costs.costid

            status: {
                type: String,
                enum: [
                    "Draft",
                    "Pending",
                    "Approved",
                    "Rejected",
                    "Expired"
                ],
                default: "Draft"
            },

            dateapproved: Date,

            approvedby: {
                type: String
            },
            updatedby: {
                type: String
            },

            comments: String,

            proposalnumber: String

        }
    ]
});


const contactSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
        trim: true
    },
    company: {
        type: String,
        trim: true,
        default: ''
    },
    emailaddress: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    created: {
        type: Date,
        default: Date.now
    }
});

const GFKContactUs = mongoose.model("GFKContactUs", contactSchema);
const MyProjects = mongoose.model("gfkprojects", ProjectSchema);
const MyBorings = mongoose.model("myborings", BoringSchema);
const FieldReports = mongoose.model("fieldreports", fieldReportSchema)
const CompactionCurves = mongoose.model("compactioncurves", compactionCurveSchema)
const SeismicReport = mongoose.model("seismicreports", seismicSchema)
const PTSlabs = mongoose.model("ptslabs", PTSchema)
const Slopes = mongoose.model("slopes", slopeSchema)
const MyEngineer = mongoose.model("engineers", EngineerSchema)
const GFKCompany = mongoose.model("GFKCompany", gfkSchema, "gfkcompany")
const TimeSheets = mongoose.model("timesheets", TimesheetSchema)
const Schedules = mongoose.model("schedules", ScheduleSchema)
const GFKReports = mongoose.model("gfkreports", reportSchema)
const GFKFigures = mongoose.model("gfkfigures", figureSchema)
const CompactionTables = mongoose.model("compactiontables", CompactionTableSchema)
const GraphicLogs = mongoose.model("graphiclogs", GraphicLogSchema)


class GFK {



    async findProposalByID(projectid, proposalid) {

        try {

            if (!projectid || !proposalid) {
                return null;
            }

            // Find schedule containing the proposal
            const schedule = await Schedules.findOne({
                projectid,
                'proposals.proposalid': proposalid
            }).lean();

            if (!schedule) {
                return null;
            }

            // Find the specific proposal
            const proposal = schedule.proposals.find(
                p => p.proposalid === proposalid
            );

            if (!proposal) {
                return null;
            }

            // Resolve referenced labor items
            const laborIDs = new Set(proposal.labor || []);

            const laboritems = (schedule.labor || []).filter(
                item => laborIDs.has(item.laborid)
            );

            // Resolve referenced cost items
            const costIDs = new Set(proposal.costs || []);

            const costitems = (schedule.costs || []).filter(
                item => costIDs.has(item.costid)
            );

            // Calculate labor total
            const labortotal = laboritems.reduce((total, item) => {

                const hours =
                    (new Date(item.timeout) - new Date(item.timein))
                    / (1000 * 60 * 60);

                if (!Number.isFinite(hours) || hours < 0) {
                    return total;
                }

                return total + hours * Number(item.laborrate || 0);

            }, 0);

            // Calculate costs total
            const costtotal = costitems.reduce((total, item) => {

                return total +
                    Number(item.unitcost || 0) *
                    Number(item.quantity ?? 1);

            }, 0);

            return {
                ...proposal,
                projectid,
                laboritems,
                costitems,
                labortotal,
                costtotal,
                total: labortotal + costtotal
            };

        } catch (err) {

            console.error('Error finding proposal:', err);
            throw err;
        }
    }



    async findCompactionTableByID(projectid, tableid) {

        try {

            if (!projectid || !tableid) {
                return null;
            }

            const document = await CompactionTables.findOne(
                {
                    projectid,
                    'tables.tableid': tableid
                },
                {
                    tables: {
                        $elemMatch: { tableid }
                    }
                }
            ).lean();

            if (!document?.tables?.length) {
                return null;
            }

            return document.tables[0];

        } catch (err) {

            console.error(
                'Error finding compaction table:',
                err
            );

            throw err;
        }
    }




    async saveEngineerProfile(engineer_id, profile) {
        try {

            const engineer = await MyEngineer.findByIdAndUpdate(
                engineer_id,
                {
                    firstname: profile.firstname,
                    lastname: profile.lastname,
                    emailaddress: profile.emailaddress,
                    profileurl: profile.profileurl,
                    phonenumber: profile.phonenumber
                },
                {
                    new: true,
                    runValidators: true
                }
            );

            if (!engineer) {
                return {
                    Error: 'Engineer not found'
                };
            }

            return engineer;

        } catch (err) {

            return {
                Error: `Could not save engineer profile: ${err}`
            };

        }
    }

    async deleteProject(projectid) {

        try {

            let deleteproject = await MyProjects.updateOne(
                { "projects.projectid": projectid },
                {
                    $pull: {
                        projects: {
                            projectid
                        }
                    }
                }
            )

            return deleteproject;




        } catch (err) {
            return (`Cannot delete project ${err}`)
        }
    }

    async getBoringById(projectid, boringid) {

        try {
            const boring = await MyBorings.findOne(
                {
                    projectid: projectid,
                    borings: {
                        $elemMatch: {
                            projectid: projectid,
                            boringid: boringid
                        }
                    }
                },
                {
                    'borings.$': 1
                }
            );

            return boring?.borings?.[0] || null;

        } catch (error) {
            console.error('Error getting boring:', error);
            throw error;
        }
    }



    async getInvoiceTotal(projectid, invoiceid) {

    }

    async getExistingEngineer(uid) {
        try {
            const engineer = await MyEngineer.findOne({ uid });

            if (!engineer) {
                return {
                    success: false,
                    message: "Engineer not found"
                };
            }

            return {
                success: true,
                engineer
            };

        } catch (error) {
            console.error("Engineer login error:", error);
            throw error;
        }
    }


    async getExistingClient(uid) {
        try {

            const result = await GFKCompany.findOne(
                { "clients.uid": uid },
                { "clients.$": 1 }
            );

            if (!result || !result.clients || result.clients.length === 0) {
                return null;
            }

            return result.clients[0];

        } catch (error) {

            console.error("Error retrieving existing client:", error);
            throw error;
        }
    }

    async findClientByID(client_id) {
        try {
            const gfkCompany = await GFKCompany.findOne({
                company: 'gfk',
                'clients._id': client_id
            });

            if (!gfkCompany) {
                return null;
            }

            const client = gfkCompany.clients.find(
                client => client._id.toString() === client_id.toString()
            );

            return client || null;

        } catch (err) {
            throw new Error(
                `Could not find client by client_id: ${err.message}`
            );
        }
    }

    async findClientByClientID(clientid) {
        try {
            const gfkCompany = await GFKCompany.findOne({
                company: 'gfk',
                'clients.clientid': clientid
            });

            if (!gfkCompany) {
                return null;
            }

            const client = gfkCompany.clients.find(
                client => client.clientid === clientid
            );

            return client || null;

        } catch (err) {
            throw new Error(
                `Could not find client by clientid: ${err.message}`
            );
        }
    }

    async findClientByEmail(emailaddress) {
        try {
            const gfkCompany = await GFKCompany.findOne({
                company: 'gfk',
                'clients.emailaddress': emailaddress
            });

            if (gfkCompany) {
                return true;
            }

            return false;

        } catch (err) {
            throw new Error(`Could not find client by email: ${err.message}`);
        }
    }

  
async sendContactEmail(values) {

    const {
        emailaddress,
        fullname,
        company,
        description,
        created
    } = values;

    const name = this.escapeHTML(fullname);
    const companyName = this.escapeHTML(company || 'Not provided');
    const email = this.escapeHTML(emailaddress);
    const message = this.escapeHTML(description);

    const submitted = new Date(created).toLocaleString('en-US', {
        timeZone: 'America/Los_Angeles',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short'
    });

    await transporter.sendMail({

        from: '"GFK | CivilEngineer.io" <support@civilengineer.io>',

        to: 'support@civilengineer.io',

        replyTo: emailaddress,

        subject: `GFK Contact Inquiry — ${fullname}`,

        html: `
            <div style="
                font-family: Arial, Helvetica, sans-serif;
                background: #F0F3F8;
                padding: 30px 15px;
                color: #303845;
            ">

                <div style="
                    max-width: 650px;
                    margin: auto;
                    background: #FFFFFF;
                    border: 1px solid #DCE3EE;
                    border-top: 5px solid #6A7EA6;
                    border-radius: 8px;
                    padding: 30px;
                ">

                    <div style="
                        color: #6A7EA6;
                        font-size: 12px;
                        font-weight: bold;
                        letter-spacing: 2px;
                        margin-bottom: 15px;
                    ">
                        CIVILENGINEER.IO | GFK
                    </div>

                    <h2 style="
                        color: #303845;
                        margin: 0 0 10px;
                        font-size: 25px;
                    ">
                        New Contact Inquiry
                    </h2>

                    <p style="
                        color: #657084;
                        font-size: 14px;
                        margin-bottom: 30px;
                    ">
                        A visitor submitted a message through
                        the GFK contact form.
                    </p>

                    <table style="
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 15px;
                    ">

                        <tr>
                            <td style="padding: 10px 0; font-weight: bold;">
                                Name
                            </td>
                            <td style="padding: 10px 0;">
                                ${name}
                            </td>
                        </tr>

                        <tr>
                            <td style="padding: 10px 0; font-weight: bold;">
                                Company
                            </td>
                            <td style="padding: 10px 0;">
                                ${companyName}
                            </td>
                        </tr>

                        <tr>
                            <td style="padding: 10px 0; font-weight: bold;">
                                Email
                            </td>
                            <td style="padding: 10px 0;">
                                <a
                                    href="mailto:${email}"
                                    style="color: #4C6088;"
                                >
                                    ${email}
                                </a>
                            </td>
                        </tr>

                    </table>

                    <div style="
                        margin-top: 25px;
                        padding-top: 20px;
                        border-top: 1px solid #DCE3EE;
                    ">

                        <h3 style="
                            color: #303845;
                            font-size: 18px;
                        ">
                            Message
                        </h3>

                        <div style="
                            background: #F0F3F8;
                            padding: 20px;
                            border-radius: 6px;
                            line-height: 1.8;
                            font-size: 15px;
                            white-space: pre-wrap;
                            overflow-wrap: anywhere;
                        ">${message}</div>

                    </div>

                    <div style="
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #DCE3EE;
                        color: #657084;
                        font-size: 12px;
                    ">
                        Submitted: ${submitted}

                        <p style="margin-bottom: 0;">
                            GFK Contact Form |
                            CivilEngineer.io
                        </p>
                    </div>

                </div>
            </div>
        `
    });
}



   
async sendClientEmail(values) {

    const {
        emailaddress,
        fullname,
        company,
        description,
        created
    } = values;

    const name = this.escapeHTML(fullname);
    const companyName = this.escapeHTML(company || '');
    const message = this.escapeHTML(description);

    const submitted = new Date(created).toLocaleString('en-US', {
        timeZone: 'America/Los_Angeles',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short'
    });

    await transporter.sendMail({

        from: '"GFK | CivilEngineer.io" <support@civilengineer.io>',

        to: emailaddress,

        replyTo: 'support@civilengineer.io',

        subject: 'GFK | We Received Your Message',

        html: `
            <div style="
                font-family: Arial, Helvetica, sans-serif;
                background: #F0F3F8;
                padding: 30px 15px;
                color: #303845;
            ">

                <div style="
                    max-width: 650px;
                    margin: auto;
                    background: #FFFFFF;
                    border: 1px solid #DCE3EE;
                    border-top: 5px solid #6A7EA6;
                    border-radius: 8px;
                    padding: 30px;
                ">

                    <div style="
                        color: #6A7EA6;
                        font-size: 12px;
                        font-weight: bold;
                        letter-spacing: 2px;
                        margin-bottom: 15px;
                    ">
                        CIVILENGINEER.IO | GFK
                    </div>

                    <h2 style="
                        color: #303845;
                        font-size: 25px;
                        margin-bottom: 25px;
                    ">
                        Thank You for Contacting GFK
                    </h2>

                    <p style="
                        font-size: 16px;
                        line-height: 1.8;
                    ">
                        Hello ${name},
                    </p>

                    <p style="
                        font-size: 16px;
                        line-height: 1.8;
                    ">
                        Thank you for your interest in GFK,
                        the geotechnical engineering platform
                        powered by CivilEngineer.io.
                    </p>

                    <p style="
                        font-size: 16px;
                        line-height: 1.8;
                    ">
                        We've received your message and
                        will review your inquiry.
                        We'll respond as soon as possible.
                    </p>

                    <div style="
                        margin-top: 30px;
                        padding: 22px;
                        background: #F0F3F8;
                        border-left: 4px solid #6A7EA6;
                        border-radius: 5px;
                    ">

                        <h3 style="
                            color: #303845;
                            margin-top: 0;
                            font-size: 18px;
                        ">
                            Your Message
                        </h3>

                        ${companyName ? `
                            <p style="
                                font-size: 14px;
                                color: #657084;
                            ">
                                <strong>Company:</strong>
                                ${companyName}
                            </p>
                        ` : ''}

                        <div style="
                            font-size: 15px;
                            line-height: 1.8;
                            white-space: pre-wrap;
                            overflow-wrap: anywhere;
                        ">${message}</div>

                    </div>

                    <p style="
                        margin-top: 30px;
                        font-size: 15px;
                        line-height: 1.8;
                    ">
                        If you have additional questions
                        or information to share,
                        simply reply to this email.
                    </p>

                    <p style="
                        margin-top: 25px;
                        font-size: 15px;
                        line-height: 1.8;
                    ">
                        Best regards,<br />
                        <strong>
                            GFK | CivilEngineer.io
                        </strong>
                    </p>

                    <div style="
                        margin-top: 35px;
                        padding-top: 20px;
                        border-top: 1px solid #DCE3EE;
                        text-align: center;
                    ">

                        <a
                            href="https://gfk.civilengineer.io/"
                            style="
                                display: inline-block;
                                background: #6A7EA6;
                                color: #FFFFFF;
                                padding: 13px 25px;
                                text-decoration: none;
                                border-radius: 5px;
                                font-size: 14px;
                                font-weight: bold;
                            "
                        >
                            Visit GFK
                        </a>

                        <p style="
                            margin-top: 25px;
                            color: #657084;
                            font-size: 12px;
                        ">
                            Message received: ${submitted}
                        </p>

                        <p style="
                            font-size: 12px;
                            color: #657084;
                        ">
                            This is an automated confirmation
                            from CivilEngineer.io.
                        </p>

                    </div>

                </div>
            </div>
        `
    });
}


    escapeHTML(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    async insertContact(contact) {

        try {

            const contactus = await GFKContactUs.insertOne(contact);
            return contactus;


        } catch (err) {

            console.error('Error inserting contact form:', err);
            return { message: `Error: Could not insert contact form - ${err.message}` };
        }


    }

    async saveProjects(myProjects) {
        try {
            const filter = { companyid: myProjects.companyid };

            const options = {
                new: true,       // ✅ return the updated document
                upsert: true,    // ✅ create new if not found
                strict: false,   // ✅ allow flexible schema fields
            };

            const updatedProjects = await MyProjects.findOneAndUpdate(filter, myProjects, options);

            return updatedProjects;

        } catch (err) {
            console.error('Error saving project:', err);
            return { message: `Error: Could not save project - ${err.message}` };
        }
    }

    async loadBorings(projectid) {
        try {
            const filter = { projectid };

            const updatedBorings = await MyBorings.findOne(filter);

            // ✅ Return empty array if no document found
            if (!updatedBorings || !Array.isArray(updatedBorings.borings)) {
                return [];
            }

            // Sort borings by boringnumber
            updatedBorings.borings.sort((a, b) => {
                const numA = Number(a.boringnumber) || 0;
                const numB = Number(b.boringnumber) || 0;
                return numA - numB;
            });

            // Sort samples by depth inside each boring
            updatedBorings.borings.forEach(boring => {
                if (Array.isArray(boring.samples)) {
                    boring.samples.sort((a, b) => {
                        const depthA = Number(a.depth) || 0;
                        const depthB = Number(b.depth) || 0;
                        return depthA - depthB;
                    });
                }
            });

            return updatedBorings.borings;

        } catch (err) {
            console.error('Error loading borings:', err);
            return [];
        }
    }



    async saveBorings(myBorings) {
        try {
            const filter = { projectid: myBorings.projectid };

            const options = {
                new: true,       // ✅ return the updated document
                upsert: true,    // ✅ create new if not found
                strict: false,   // ✅ allow flexible schema fields
            };

            const updatedBorings = await MyBorings.findOneAndUpdate(filter, myBorings, options);

            return updatedBorings;

        } catch (err) {
            console.error('Error saving borings:', err);
            return { message: `Error: Could not save borings - ${err.message}` };
        }
    }

    async findFieldReportByID(projectid, fieldid) {
        try {
            const report = await FieldReports.findOne(
                {
                    projectid: projectid,
                    "fieldreports.fieldid": fieldid
                },
                {
                    "fieldreports.$": 1
                }
            );

            return report ?? { Error: "Field report not found." };

        } catch (err) {
            return { Error: `Could not find field report: ${err.message || err}` };
        }
    }

    async getClientByEmail(emailaddress) {

        const result = await GFKCompany.findOne(
            { "clients.emailaddress": emailaddress },
            { "clients.$": 1 }
        ).lean();

        return result?.clients?.[0] || null;
    }

    async createNewUserByEmail(emailaddress) {

        const client = {
            emailaddress: emailaddress.trim().toLowerCase()
        };

        const result = await GFKCompany.findOneAndUpdate(
            {},
            { $push: { clients: client } },
            {
                new: true,
                projection: { clients: { $slice: -1 } }
            }
        ).lean();

        return result?.clients?.[0] || null;
    }


    async loadFieldReports(projectid) {
        try {
            if (!projectid) {
                throw new Error("Missing project ID.");
            }

            const filter = { projectid };
            const fieldReportDoc = await FieldReports.findOne(filter);

            // Return empty array if no document found
            if (!fieldReportDoc || !Array.isArray(fieldReportDoc.fieldreports)) {
                console.warn(`⚠️ No field reports found for project ${projectid}`);
                return [];
            }

            // Sort field reports by datereport (ascending)
            const sortedReports = fieldReportDoc.fieldreports.sort((a, b) => {
                const dateA = new Date(a.datereport);
                const dateB = new Date(b.datereport);
                return dateA - dateB;
            });

            return sortedReports;

        } catch (err) {
            console.error("❌ Error loading field reports:", err);
            return [];
        }
    }

    async saveClients(myClients) {
        try {
            const filter = { company: myClients.company };

            const options = {
                new: true,       // return updated document
                upsert: true,    // create if not found
            };

            // Use $set to avoid replacing the entire document accidentally
            const update = {
                $set: { clients: myClients.clients }
            };

            const updated = await GFKCompany.findOneAndUpdate(filter, update, options);

            return updated.clients;

        } catch (err) {
            console.error('Error saving clients:', err);
            return { message: `Error: Could not save clients - ${err.message}` };
        }
    }



    async findClients() {
        try {
            // Find a single company document
            const companyDoc = await GFKCompany.findOne({ company: 'gfk' });

            // If no document found or no clients array, return empty array
            if (!companyDoc || !Array.isArray(companyDoc.clients)) {
                return [];
            }

            return companyDoc.clients;

        } catch (err) {
            console.error('Error: Could not find clients', err);
            return {
                message: `Error: Could not find clients - ${err.message}`
            };
        }
    }

    async addClient(newClient) {
        try {

            const gfkCompany = await GFKCompany.findOne({
                company: 'gfk'
            });

            if (!gfkCompany) {
                return null;
            }

            // Make sure clients is an array
            if (!Array.isArray(gfkCompany.clients)) {
                gfkCompany.clients = [];
            }

            // Add client to embedded clients array
            gfkCompany.clients.push(newClient);

            // Save document
            await gfkCompany.save();

            // Return newly created embedded client
            return gfkCompany.clients[gfkCompany.clients.length - 1];

        } catch (error) {

            console.error("Error adding client:", error);
            throw error;
        }
    }







    async saveFieldReports(fieldReports) {
        try {
            const filter = { projectid: fieldReports.projectid };

            const options = {
                new: true,       // ✅ return the updated document
                upsert: true,    // ✅ create new if not found
                strict: false,   // ✅ allow flexible schema fields
            };

            const updatedReports = await FieldReports.findOneAndUpdate(filter, fieldReports, options);

            return updatedReports;

        } catch (err) {
            console.error('Error saving fieldreports:', err);
            return { message: `Error: Could not save fieldreports - ${err.message}` };
        }
    }


    async saveCompactionCurves(myCompactionCurves) {
        try {
            const filter = { projectid: myCompactionCurves.projectid };

            // Always ensure compactioncurves is an array
            const curvesArray = Array.isArray(myCompactionCurves.compactioncurves)
                ? myCompactionCurves.compactioncurves
                : [];

            const update = {
                $set: { compactioncurves: curvesArray }
            };

            const options = {
                new: true,     // return updated doc
                upsert: true,  // create if not exists
            };

            const updatedDoc = await CompactionCurves.findOneAndUpdate(
                filter,
                update,
                options
            );

            // Return ONLY the curves array for the frontend
            return updatedDoc.compactioncurves || [];

        } catch (err) {
            console.error('Error saving compaction curves:', err);
            return { message: `Error: Could not save compaction curves - ${err.message}` };
        }
    }


    async loadCompactionCurves(projectid) {
        try {
            if (!projectid) {
                throw new Error("Missing project ID.");
            }

            const filter = { projectid };
            const compactionDoc = await CompactionCurves.findOne(filter);

            if (!compactionDoc || !Array.isArray(compactionDoc.compactioncurves)) {
                console.warn(`⚠️ No compaction curves found for project ${projectid}`);
                return [];
            }

            // ✅ Sort compaction curves by curvenumber (ascending)
            const sortedCurves = compactionDoc.compactioncurves.sort((a, b) => {
                const numA = Number(a.curvenumber) || 0;
                const numB = Number(b.curvenumber) || 0;
                return numA - numB;
            });

            return sortedCurves;

        } catch (err) {
            console.error("❌ Error loading compaction curves:", err);
            return [];
        }
    }



    async saveSeismic(seismic) {
        try {
            const filter = { projectid: seismic.projectid };

            const options = {
                new: true,       // ✅ return the updated document
                upsert: true,    // ✅ create new if not found
                strict: false,   // ✅ allow flexible schema fields
            };

            const updatedSeismic = await SeismicReport.findOneAndUpdate(filter, seismic, options);

            return updatedSeismic;

        } catch (err) {
            console.error('Error saving sesimic report:', err);
            return { message: `Error: Could not save seismic report - ${err.message}` };
        }
    }

    async loadSeismic(projectid) {
        try {
            if (!projectid) {
                throw new Error("Missing project ID.");
            }

            const filter = { projectid };
            const seismicDoc = await SeismicReport.findOne(filter);

            if (!seismicDoc) {
                console.warn(`⚠️ No seismic data found for project ${projectid}`);
                return {
                    vseismic: null,
                    hseismic: null,
                    points: []
                };
            }

            // ✅ Safely sort seismic points by depth (ascending)
            const sortedPoints = Array.isArray(seismicDoc.points)
                ? seismicDoc.points.sort((a, b) => {
                    const depthA = Number(a.depth) || 0;
                    const depthB = Number(b.depth) || 0;
                    return depthA - depthB;
                })
                : [];

            // ✅ Return clean, structured data
            return {
                siteacceleration: seismicDoc.siteacceleration || null,
                magnitude: seismicDoc.magnitude || null,
                points: sortedPoints
            };

        } catch (err) {
            console.error("❌ Error loading seismic data:", err);
            return {
                siteacceleration: null,
                magnitude: null,
                points: []
            };
        }
    }



    async savePTSlab(ptslab) {
        try {
            const filter = { projectid: ptslab.projectid };

            const options = {
                new: true,       // ✅ return the updated document
                upsert: true,    // ✅ create new if not found
                strict: false,   // ✅ allow flexible schema fields
            };

            const updatedPTSlab = await PTSlabs.findOneAndUpdate(filter, ptslab, options);

            return updatedPTSlab;

        } catch (err) {
            console.error('Error saving ptslab report:', err);
            return { message: `Error: Could not save ptslab report - ${err.message}` };
        }
    }

    async loadPTSlab(projectid) {
        try {
            if (!projectid) {
                throw new Error("Missing project ID.");
            }

            const filter = { projectid };
            const slabDoc = await PTSlabs.findOne(filter);

            if (!slabDoc) {
                console.warn(`⚠️ No PT slab data found for project ${projectid}`);
                return { projectid, sections: [] };
            }

            // ✅ Sort each section’s layers by numeric toplayer
            const sortedSections = (slabDoc.sections || []).map(section => {
                const sortedLayers = Array.isArray(section.layers)
                    ? [...section.layers].sort((a, b) => {
                        const topA = Number(a.toplayer) || 0;
                        const topB = Number(b.toplayer) || 0;
                        return topA - topB;
                    })
                    : [];

                return {
                    sectionid: section.sectionid || null,
                    sectionname: section.sectionname || null,
                    layers: sortedLayers
                };
            });

            // ✅ Return clean structured response
            return {
                projectid: slabDoc.projectid,
                sections: sortedSections
            };

        } catch (err) {
            console.error("❌ Error loading PT slab:", err);
            return { projectid, sections: [] };
        }
    }




    async saveSlope(slope) {
        try {
            const filter = { projectid: slope.projectid };

            const options = {
                new: true,       // ✅ return the updated document
                upsert: true,    // ✅ create new if not found
                strict: false,   // ✅ allow flexible schema fields
            };

            const updatedSlope = await Slopes.findOneAndUpdate(filter, slope, options);

            return updatedSlope;

        } catch (err) {
            console.error('Error saving slope report:', err);
            return { message: `Error: Could not save slope report - ${err.message}` };
        }
    }

    async saveTimesheet(myTimesheet) {
        try {
            if (!myTimesheet?.projectid) {
                throw new Error("Project ID is required to save a timesheet.");
            }

            const filter = { projectid: myTimesheet.projectid };
            const options = {
                new: true,    // return the updated document
                upsert: true, // create if not found
            };

            const update = {
                $set: {
                    labor: Array.isArray(myTimesheet.labor) ? myTimesheet.labor : [],
                    costs: Array.isArray(myTimesheet.costs) ? myTimesheet.costs : [],
                    invoices: Array.isArray(myTimesheet.invoices) ? myTimesheet.invoices : []
                }
            };

            const updatedTimesheet = await TimeSheets.findOneAndUpdate(filter, update, options);

            // Return only labor, costs, invoices
            return {
                labor: updatedTimesheet?.labor || [],
                costs: updatedTimesheet?.costs || [],
                invoices: updatedTimesheet?.invoices || []
            };

        } catch (err) {
            console.error('Error saving timesheet:', err);
            return {
                message: `Error: Could not save timesheet - ${err.message}`
            };
        }
    }



    async loadTimesheet(projectid) {
        try {
            if (!projectid) {
                throw new Error("Project ID is required to load a timesheet.");
            }

            // Find the timesheet but exclude projectid and _id from the result
            const timesheetDoc = await TimeSheets.findOne(
                { projectid },
                { projectid: 0, _id: 0 }  // ⬅️ exclude unwanted fields
            );

            // Return only the allowed structure
            if (!timesheetDoc) {
                return {
                    labor: [],
                    costs: [],
                    invoices: []
                };
            }

            return {
                labor: timesheetDoc.labor || [],
                costs: timesheetDoc.costs || [],
                invoices: timesheetDoc.invoices || []
            };

        } catch (err) {
            console.error("Error loading timesheet:", err);

            return {
                labor: [],
                costs: [],
                invoices: [],
                error: true,
                message: `Could not load timesheet: ${err.message}`
            };
        }
    }

    async getInvoice(projectid, invoiceid) {
        try {

            const timesheet = await TimeSheets.findOne(
                { projectid },
                {
                    invoices: 1,
                    labor: 1,
                    costs: 1
                }
            ).lean();

            if (!timesheet) {
                throw new Error("Timesheet not found");
            }

            const invoice = timesheet.invoices.find(
                i => i.invoiceid === invoiceid
            );

            if (!invoice) {
                throw new Error("Invoice not found");
            }

            // Labor
            const labor = timesheet.labor
                .filter(l => invoice.labor.includes(l.laborid))
                .map(l => {

                    const totalHours =
                        (new Date(l.timeout) - new Date(l.timein)) /
                        (1000 * 60 * 60);

                    return {
                        type: "labor",
                        date: l.timein,
                        amount: totalHours * l.laborrate,
                        totalhours: totalHours,
                        ...l
                    };

                });

            // Costs
            const costs = timesheet.costs
                .filter(c => invoice.costs.includes(c.costid))
                .map(c => ({
                    type: "cost",
                    date: c.datein,
                    amount: c.quantity * c.unitcost,
                    ...c
                }));

            // Chronological list
            const items = [...labor, ...costs].sort(
                (a, b) => new Date(a.date) - new Date(b.date)
            );

            // Totals
            const laborTotal = labor.reduce(
                (sum, item) => sum + item.amount,
                0
            );

            const costTotal = costs.reduce(
                (sum, item) => sum + item.amount,
                0
            );

            const invoiceTotal = laborTotal + costTotal;

            return {
                invoiceid: invoice.invoiceid,
                dateinvoice: invoice.dateinvoice,
                status: invoice.status,
                paymentstatus: invoice.paymentstatus,
                transactionid: invoice.transactionid,
                datepaid: invoice.datepaid,
                items,
                laborTotal,
                costTotal,
                invoiceTotal
            };

        } catch (err) {

            console.error("Error retrieving invoice:", err);

            return {
                message: `Error: Could not retrieve invoice - ${err.message}`
            };
        }
    }

    async getProposal(projectid, proposalid) {
        try {

            const schedule = await Schedules.findOne(
                { projectid },
                {
                    proposals: 1,
                    labor: 1,
                    costs: 1
                }
            ).lean();

            if (!schedule) {
                throw new Error("Schedule not found");
            }

            const proposal = schedule.proposals.find(
                p => p.proposalid === proposalid
            );

            if (!proposal) {
                throw new Error("Proposal not found");
            }

            // Proposal labor
            const labor = schedule.labor
                .filter(l => proposal.labor.includes(l.laborid))
                .map(l => {

                    const hours =
                        (new Date(l.timeout) - new Date(l.timein)) /
                        (1000 * 60 * 60);

                    return {
                        type: "labor",
                        date: l.timein,
                        amount: hours * l.laborrate,
                        ...l
                    };

                });

            // Proposal costs
            const costs = schedule.costs
                .filter(c => proposal.costs.includes(c.costid))
                .map(c => ({
                    type: "cost",
                    date: c.datein,
                    amount: c.unitcost * c.quantity,
                    ...c
                }));

            // Combined timeline
            const items = [...labor, ...costs].sort(
                (a, b) => new Date(a.date) - new Date(b.date)
            );

            const totalAmount = items.reduce(
                (total, item) => total + item.amount,
                0
            );

            return {
                proposalid: proposal.proposalid,
                proposalnumber: proposal.proposalnumber,
                version: proposal.version,
                status: proposal.status,
                dateproposal: proposal.dateproposal,
                expirationdate: proposal.expirationdate,
                dateapproved: proposal.dateapproved,
                approvedby: proposal.approvedby,
                comments: proposal.comments,
                items,
                totalAmount
            };

        } catch (err) {
            console.error("Error retrieving proposal:", err);

            return {
                message: `Error: Could not retrieve proposal - ${err.message}`
            };
        }
    }



    async loadSchedule(projectid) {
        try {
            if (!projectid) {
                throw new Error("Project ID is required to load a schedule.");
            }

            const scheduleDoc = await Schedules.findOne(
                { projectid },
                { projectid: 0, _id: 0 }
            ).lean();

            return {
                error: false,
                labor: scheduleDoc?.labor || [],
                costs: scheduleDoc?.costs || [],
                proposals: scheduleDoc?.proposals || []
            };

        } catch (err) {
            console.error("Error loading schedule:", err);

            return {
                error: true,
                message: `Could not load schedule: ${err.message}`,
                labor: [],
                costs: [],
                proposals: []
            };
        }
    }



    async saveReport(report) {
        try {
            if (!report?.reportid) {
                throw new Error('Report ID is required.');
            }

            const savedReport = await GFKReports.findOneAndUpdate(
                { reportid: report.reportid },
                { $set: report },
                {
                    new: true,
                    upsert: true,
                    runValidators: true
                }
            );

            return savedReport;

        } catch (err) {
            console.error('Error saving report:', err);

            throw err instanceof Error
                ? err
                : new Error(String(err));
        }
    }

    async getReportByID(projectid, reportid) {
        try {
            const report = await GFKReports.findOne({
                projectid,
                reportid
            });

            return report || null;

        } catch (err) {
            throw new Error(`Could not load report: ${err.message}`);
        }
    }

    async loadReports(projectid) {
        try {
            const reports = await GFKReports.find({ projectid });

            if (reports.length > 0) {
                return reports;
            }

            return [];

        } catch (err) {
            throw new Error(`Could not load reports: ${err.message}`);
        }
    }


    async saveSchedule(mySchedule) {
        try {
            if (!mySchedule?.projectid) {
                throw new Error("Project ID is required to save a timesheet.");
            }

            const filter = { projectid: mySchedule.projectid };
            const options = {
                new: true,    // return the updated document
                upsert: true, // create if not found
            };

            const update = {
                $set: {
                    labor: Array.isArray(mySchedule.labor) ? mySchedule.labor : [],
                    costs: Array.isArray(mySchedule.costs) ? mySchedule.costs : [],
                    proposals: Array.isArray(mySchedule.proposals) ? mySchedule.proposals : []
                }
            };

            const updatedSchedule = await Schedules.findOneAndUpdate(filter, update, options);

            // Return only labor, costs, proposals
            return {
                labor: updatedSchedule?.labor || [],
                costs: updatedSchedule?.costs || [],
                proposals: updatedSchedule?.proposals || []
            };

        } catch (err) {
            console.error('Error saving timesheet:', err);
            return {
                message: `Error: Could not save timesheet - ${err.message}`
            };
        }
    }




    async loadSlope(projectid) {
        try {
            if (!projectid) {
                throw new Error("Missing project ID.");
            }

            const filter = { projectid };
            const slopeDoc = await Slopes.findOne(filter);

            if (!slopeDoc) {
                console.warn(`⚠️ No slope data found for project ${projectid}`);
                return { projectid, sections: [] };
            }

            // ✅ Sort each layer’s points by numeric xcoord
            const sortedSections = (slopeDoc.sections || []).map(section => {
                const sortedLayers = (section.layers || []).map(layer => {
                    const sortedPoints = Array.isArray(layer.points)
                        ? [...layer.points].sort((a, b) => {
                            const xA = Number(a.xcoord) || 0;
                            const xB = Number(b.xcoord) || 0;
                            return xA - xB;
                        })
                        : [];

                    return {
                        layerid: layer.layerid || null,
                        layer: layer.layer || null,
                        layertype: layer.layertype || null,
                        linetype: layer.linetype || null,
                        color: layer.color || null,
                        layerorder: layer.layerorder || null,
                        points: sortedPoints,
                        strength: layer.strength || {},
                        failure: layer.failure || {}
                    };
                });

                return {
                    sectionid: section.sectionid || null,
                    sectionname: section.sectionname || null,
                    slices: section.slices || null,
                    layers: sortedLayers
                };
            });

            // ✅ Return cleaned + sorted data
            return {
                projectid: slopeDoc.projectid,
                vseismic: slopeDoc.vseismic || null,
                hseismic: slopeDoc.hseismic || null,
                sections: sortedSections
            };

        } catch (err) {
            console.error("❌ Error loading slope stability:", err);
            return { projectid, sections: [] };
        }
    }


    async getProjectById(projectid) {
        try {
            const doc = await MyProjects.findOne(
                { "projects.projectid": projectid },
                { "projects.$": 1 }
            );

            return doc?.projects?.[0] || null;

        } catch (err) {
            console.error("Error fetching project:", err);
            throw err; // or return null;
        }
    }




    async loadProjects(companyid) {

        try {

            let projects = await MyProjects.findOne({ companyid })
            return projects.projects;

        } catch (err) {

            console.error('Error loading projects:', err);
            return { message: `Error: Could not load projects - ${err.message}` };

        }
    }


    async clientLogin(myEngineer) {
        try {
            // Firebase UID is required
            if (!myEngineer?.uid) {
                return { message: 'Firebase uid string missing' };
            }



            // Find existing engineer by Firebase UID
            const getEngineer = await this.getExistingEngineer(myEngineer.uid);

            if (getEngineer.success) {
                return {
                    status: 'served',
                    engineer: getEngineer.engineer
                };
            }

            return {
                status: 'not_found',
                message: 'Engineer not found'
            };

        } catch (err) {
            console.error('Client login error:', err);

            return {
                message: `Error during client login: ${err.message}`
            };
        }
    }



    hashPassword(password) {

        return bcrypt.hashSync(password, 10);
    }

    async getAppleUser(appleId) {
        try {
            const allEngineers = await MyEngineer.find({ apple: { $exists: true } });

            for (const engineer of allEngineers) {
                const isMatch = bcrypt.compareSync(appleId, engineer.apple);
                if (isMatch) {
                    return engineer; // Found
                }
            }

            // Return null if no match found (important!)
            return null;

        } catch (err) {
            console.error('Error finding Apple engineer:', err);
            throw err; // Let clientLogin handle it
        }
    }


    async getGoogleUser(googleId) {
        try {
            const allEngineers = await MyEngineer.find({ google: { $exists: true } });

            for (const engineer of allEngineers) {
                const isMatch = bcrypt.compareSync(googleId, engineer.google);
                if (isMatch) {
                    return engineer; // Found
                }
            }

            // Return null if no match found (important!)
            return null;

        } catch (err) {
            console.error('Error finding Google engineer:', err);
            throw err; // Let clientLogin handle it
        }
    }



    calculateLabSummary(project, borings = []) {

        const unconfinedcalcs = new UnconfinedCalcs();

        const validNumber = (value, decimals = null) => {

            if (value === null || value === undefined || value === '') {
                return '';
            }

            const number = Number(value);

            if (!Number.isFinite(number)) return '';

            return decimals === null
                ? number
                : number.toFixed(decimals);
        };

        const samples = [];

        for (const boring of borings) {

            for (const sample of boring.samples || []) {

                const sampleno =
                    `${boring.boringnumber ?? ''}-` +
                    `${sample.sampleset ?? ''}` +
                    `(${sample.samplenumber ?? ''})`;

                // Dry density
                const dryden = calcdryden(
                    sample.wetwgt_2,
                    sample.wetwgt,
                    sample.tarewgt,
                    sample.drywgt,
                    sample.diameter,
                    sample.samplelength
                );

                // Moisture content
                const moisture = calcmoist(
                    sample.drywgt,
                    sample.tarewgt,
                    sample.wetwgt,
                    sample.wetwgt_2
                );

                const ll = Number(sample.ll) > 0
                    ? Number(sample.ll)
                    : '';

                const pi = Number(sample.pi) > 0
                    ? Number(sample.pi)
                    : '';

                // Unconfined compression
                const stress = unconfinedcalcs.getMaxStress(sample);
                const strain = unconfinedcalcs.getMaxStrain(sample);

                // Sieve analysis
                let sieveresult = '';

                if (sample.sieve) {

                    const sieve = sample.sieve;

                    const netwgt =
                        Number(sample.drywgt) -
                        Number(sample.tarewgt);

                    const SC = new SoilClassification(
                        netwgt,
                        ll,
                        pi,
                        Number(sieve.wgt34),
                        Number(sieve.wgt38),
                        Number(sieve.wgt4),
                        Number(sieve.wgt10),
                        Number(sieve.wgt30),
                        Number(sieve.wgt40),
                        Number(sieve.wgt100),
                        Number(sieve.wgt200)
                    );

                    const gravel = Number(SC.getGravFrac());
                    const sand = Number(SC.getSandFrac());
                    const fines = Number(SC.getFines());

                    const parts = [];

                    if (Number.isFinite(gravel) && gravel > 0) {
                        parts.push(`Gravel ${gravel}%`);
                    }

                    if (Number.isFinite(sand) && sand > 0) {
                        parts.push(`Sand ${sand}%`);
                    }

                    if (Number.isFinite(fines) && fines > 0) {
                        parts.push(`Fines ${fines}%`);
                    }

                    sieveresult = parts.join(', ');
                }

                samples.push({
                    boringid: boring.boringid,
                    sampleid: sample.sampleid,
                    sampleno,
                    depth: sample.depth ?? '',
                    dryden: validNumber(dryden),
                    moist: validNumber(moisture) === ''
                        ? ''
                        : validNumber(Number(moisture) * 100, 1),
                    ll,
                    pi,
                    un: Number(stress) > 0
                        ? validNumber(stress)
                        : '',
                    strain: Number(strain) > 0
                        ? validNumber(strain)
                        : '',
                    sieve: sieveresult
                });
            }
        }

        return {
            projectid: project.projectid,
            projectnumber: project.projectnumber,
            reporttitle: 'SUMMARY OF LABORATORY TEST RESULTS',
            title: project.title,
            projecttitle: project.title,
            projectaddress: project.projectaddress,
            projectcity: project.projectcity,
            samples
        };
    }


    async loadLabSummary(projectid, options = {}) {

        const gfk = new GFK();
        const unconfinedcalcs = new UnconfinedCalcs();

        // Reuse project/borings if already loaded by
        // the complete geotechnical report route.
        const [project, borings] = await Promise.all([
            options.project ?? gfk.getProjectById(projectid),
            options.borings ?? gfk.loadBorings(projectid)
        ]);

        if (!project) {
            throw new Error(`Project not found: ${projectid}`);
        }

        const validNumber = (value, decimals = null) => {

            if (value === null || value === undefined || value === '') {
                return '';
            }

            const number = Number(value);

            if (!Number.isFinite(number)) {
                return '';
            }

            return decimals === null
                ? number
                : number.toFixed(decimals);
        };

        const samples = [];

        for (const boring of Array.isArray(borings) ? borings : []) {

            if (!Array.isArray(boring.samples)) continue;

            for (const sample of boring.samples) {

                const sampleno =
                    `${boring.boringnumber ?? ''}-` +
                    `${sample.sampleset ?? ''}` +
                    `(${sample.samplenumber ?? ''})`;

                // DRY DENSITY
                const dryden = calcdryden(
                    sample.wetwgt_2,
                    sample.wetwgt,
                    sample.tarewgt,
                    sample.drywgt,
                    sample.diameter,
                    sample.samplelength
                );

                // MOISTURE CONTENT
                const moistureResult = calcmoist(
                    sample.drywgt,
                    sample.tarewgt,
                    sample.wetwgt,
                    sample.wetwgt_2
                );

                const moist =
                    validNumber(moistureResult) === ''
                        ? ''
                        : validNumber(Number(moistureResult) * 100, 1);

                // ATTERBERG LIMITS
                const ll = Number(sample.ll) > 0
                    ? Number(sample.ll)
                    : '';

                const pi = Number(sample.pi) > 0
                    ? Number(sample.pi)
                    : '';

                // UNCONFINED COMPRESSION
                const stress = unconfinedcalcs.getMaxStress(sample);
                const strain = unconfinedcalcs.getMaxStrain(sample);

                // SIEVE ANALYSIS
                let sieveresult = '';

                if (sample.sieve) {

                    const sieve = sample.sieve;

                    const netwgt =
                        Number(sample.drywgt) -
                        Number(sample.tarewgt);

                    const SC = new SoilClassification(
                        netwgt,
                        ll,
                        pi,
                        Number(sieve.wgt34),
                        Number(sieve.wgt38),
                        Number(sieve.wgt4),
                        Number(sieve.wgt10),
                        Number(sieve.wgt30),
                        Number(sieve.wgt40),
                        Number(sieve.wgt100),
                        Number(sieve.wgt200)
                    );

                    const gravel = Number(SC.getGravFrac());
                    const sand = Number(SC.getSandFrac());
                    const fines = Number(SC.getFines());

                    const parts = [];

                    if (Number.isFinite(gravel) && gravel > 0) {
                        parts.push(`Gravel ${gravel}%`);
                    }

                    if (Number.isFinite(sand) && sand > 0) {
                        parts.push(`Sand ${sand}%`);
                    }

                    if (Number.isFinite(fines) && fines > 0) {
                        parts.push(`Fines ${fines}%`);
                    }

                    sieveresult = parts.join(', ');
                }

                // STORE CALCULATED SAMPLE
                samples.push({
                    boringid: boring.boringid,
                    sampleid: sample.sampleid,
                    sampleno,
                    depth: sample.depth ?? '',
                    dryden: validNumber(dryden),
                    moist,
                    ll,
                    pi,
                    un: Number(stress) > 0 ? validNumber(stress) : '',
                    strain: Number(strain) > 0 ? validNumber(strain) : '',
                    sieve: sieveresult
                });
            }
        }

        // RETURN LAB SUMMARY OBJECT
        return {
            projectid,
            projectnumber: project.projectnumber,
            reporttitle: 'SUMMARY OF LABORATORY TEST RESULTS',
            title: project.title,
            projecttitle: project.title,
            projectaddress: project.projectaddress,
            projectcity: project.projectcity,
            samples
        };
    }




    async registerNewUser(newEngineer) {
        try {
            // ✅ Hash Apple ID if it exists
            if (newEngineer.apple) {
                const salt = await bcrypt.genSalt(10);
                newEngineer.apple = await bcrypt.hash(newEngineer.apple, salt);
            }

            // ✅ Hash Google ID if it exists
            if (newEngineer.google) {
                const salt = await bcrypt.genSalt(10);
                newEngineer.google = await bcrypt.hash(newEngineer.google, salt);
            }

            // ✅ Create engineer in DB
            const createdEngineer = await MyEngineer.create(newEngineer);

            return createdEngineer;

        } catch (err) {
            console.error('Error registering new engineer:', err);
            return { message: `Error: Could not register engineer - ${err.message}` };
        }
    }

    async saveProfile(engineer_id) {

    }

    async loadMyEngineers() {
        try {
            const engineers = await MyEngineer.find({});

            return engineers.map(engineer => ({
                engineer_id: engineer._id,
                firstname: engineer.firstname,
                lastname: engineer.lastname,
                emailaddress: engineer.emailaddress,
                phonenumber: engineer.phonenumber
            }));

        } catch (err) {
            console.error(`Error loading all engineers: ${err}`);
            throw err;
        }
    }

    async findEngineerByID(engineerId) {
        try {
            const engineer = await MyEngineer.findById(engineerId);
            return engineer || { message: "Engineer not found" };
        } catch (err) {
            return { message: `Error finding engineer: ${err.message}` };
        }
    }








}

export default GFK;
export { GFKCompany, MyProjects, TimeSheets, Schedules, GFKFigures, CompactionTables, GraphicLogs };       // named export