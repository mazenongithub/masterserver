import Geotech from "../classes/geotech.js"
import CivilEngineer from '../classes/civilengineer.js'
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from "crypto";
import GFK, { GFKCompany, MyProjects, Schedules } from '../classes/gfk.js';
import validategeotechclient from '../middleware/validategeotechclient.js'
import validateProfile from "../middleware/validateprofile.js";
import Stripe from "stripe";
import express from 'express';

export default (app) => {

    // Multer storage
    // Temporary upload folder
    const upload = multer({ dest: "uploads/temp" }); // multer saves to temp first

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    app.post("/geotech/uploadprofilephoto", upload.single("profilephoto"), async (req, res) => {
        try {


            const myuser = req.body.myuser ? JSON.parse(req.body.myuser) : null;

            if (!req.file || !myuser || !myuser._id) {
                return res.status(400).send({ message: "File or user data missing" });
            }

            const clientObjectId = new mongoose.Types.ObjectId(req.session.clientID);

            // Find company and client
            const company = await GFKCompany.findOne({ company: "gfk" });
            if (!company) return res.status(404).send({ message: "Company not found" });

            const client = company.clients.id(clientObjectId);
            if (!client) return res.status(404).send({ message: "Client not found" });

            // Build final filename: clientid + random string + extension
            const ext = path.extname(req.file.originalname);
            const random = crypto.randomBytes(6).toString("hex");
            const finalFilename = `${myuser.clientid || client._id}-${random}${ext}`;
            const finalPath = path.join("uploads/profilephotos", finalFilename);



            // Move file from temp to final folder
            fs.renameSync(req.file.path, finalPath);

            const newProfileUrl = `/uploads/profilephotos/${finalFilename}`;

            // Delete old profile photo if exists
            if (client.profileurl) {
                const oldPath = path.join(process.cwd(), client.profileurl.replace(/^\//, ""));
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }

            // Update client object with new profile URL and any other fields from myuser
            Object.assign(client, { ...myuser, profileurl: newProfileUrl });

            await company.save();

            const createdAt = new Date().toLocaleString('en-US', {
                timeZone: 'America/Los_Angeles',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });

            return res.send({ myuser: client, message: `Profile Saved ${createdAt}` });

        } catch (err) {
            console.error("Upload error:", err);
            res.status(500).send({ message: "Could not upload profile photo" });
        }
    });

    app.post("/geotech/savecontactus", async (req, res) => {
        const geotech = new Geotech();
        const civilEngineer = new CivilEngineer();

        try {
            const values = req.body;
            const { captchaToken, fullname, emailaddress } = values;

            // Basic validation
            if (!captchaToken) {
                return res.status(400).json({ message: "Captcha required" });
            }

            if (!fullname || !emailaddress) {
                return res.status(400).json({
                    message: "Full name and email address are required"
                });
            }

            // Verify captcha
            const verification = await civilEngineer.verifyTurnstile(
                captchaToken,
                req.ip || req.headers["x-forwarded-for"]
            );

            if (!verification?.success) {
                return res.status(403).json({
                    message: "Captcha verification failed"
                });
            }

            // Save contact
            const contact = await geotech.insertContact(values);

            // Send emails in parallel
            await geotech.sendContactEmail(contact);


            return res.status(201).json({
                contact,
                created: contact.createdAt,
                message: "Your request has been submitted successfully"
            });
        } catch (err) {
            console.error("save contact us error:", err);

            return res.status(500).json({
                message: "Could not save contact us form"
            });
        }
    });

    app.get("/geotech/checkuser", async (req, res) => {
        const geotech = new Geotech();

        try {
            // 1️⃣ Check session
            const clientID = req.session?.clientID;

            if (!clientID) {
                return res.status(401).json({ message: "Not authenticated" });
            }

            // 2️⃣ Fetch client
            const client = await geotech.findClientByID(clientID);
            if (!client) {
                return res.status(404).json({ message: "Client not found" });
            }



            // 3️⃣ Fetch client's projects
            const projects = await geotech.findProjectsByClientID(clientID);

            // 4️⃣ Return client and projects
            return res.status(200).json({ client, projects });

        } catch (err) {
            console.error("Check user error:", err);
            return res.status(500).json({ message: "Server error" });
        }
    });


    app.post('/geotech/login', async (req, res) => {
        const geotech = new Geotech();
        const clientInfo = req.body; // no need to spread


        try {
            // 1️⃣ Attempt client login
            const result = await geotech.clientLogin(clientInfo);

            // 2️⃣ Login failed
            if (!result.client) {
                return res.status(400).json({ message: result.message || 'Login failed' });
            }

            const client = result.client;


            // 3️⃣ Save session
            req.session.clientID = client._id;
            await req.session.save();

            // 4️⃣ Load client projects
            const projects = await geotech.findProjectsByClientID(client._id);

            // 5️⃣ Return client and projects
            return res.status(200).json({ client, projects });

        } catch (err) {
            console.error('Error during client login:', err);
            return res.status(500).json({
                message: `Could not log in client - ${err.message || err}`,
            });
        }
    });

    app.get("/geotech/:clientid/logout", (req, res) => {
        const { clientid } = req.params;

        // 1️⃣ Check session
        if (!req.session) {
            return res.status(400).json({ message: "No active session found" });
        }

        // 2️⃣ Destroy session
        req.session.destroy(err => {
            if (err) {
                console.error("Session destruction error:", err);
                return res.status(500).json({ message: "Error logging out" });
            }

            // 3️⃣ Clear session cookie
            res.clearCookie("connect.sid");

            // 4️⃣ Success response
            return res.status(200).json({
                message: `${clientid} has been logged out successfully`
            });
        });
    });






    app.get("/payments/status/:paymentIntentId", async (req, res) => {

        try {

            const { paymentIntentId } = req.params;

            const paymentIntent =
                await stripe.paymentIntents.retrieve(
                    paymentIntentId
                );



            res.json({
                success: true,
                status: paymentIntent.status,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                nextAction: paymentIntent.next_action
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                success: false,
                message: error.message
            });

        }

    }
    );

    app.get("/geotech/:projectid/payments/:invoiceid/create-payment-intent", async (req, res) => {
        try {
            const geotech = new Geotech();
            const { projectid, invoiceid } = req.params;

            const calc = await geotech.calculateInvoiceTotal(projectid, invoiceid)
            const amount = (calc.total) * 100;

            if (amount <= 0) {
                throw new Error(
                    "Invoice has already been paid."
                );
            }

            const paymentIntent = await stripe.paymentIntents.create({
                amount, // in cents (e.g. 5000 = $50)
                currency: "usd",

                // THIS enables cards + ACH automatically (important)
                automatic_payment_methods: {
                    enabled: true,
                },

                metadata: {
                    projectid,
                    invoiceid
                }
            });

            res.send({
                clientSecret: paymentIntent.client_secret,
            });

        } catch (err) {
            console.error(err);
            res.status(500).send({ error: err.message });
        }
    });

    app.post('/geotech/saveprofile', validateProfile, validategeotechclient, async (req, res) => {
        const geotech = new Geotech();


        try {
            const myuser = req.body.myuser;


            // Save the profile
            const savedUser = await geotech.saveProfile(myuser);

            const createdAt = new Date().toLocaleString('en-US', {
                timeZone: 'America/Los_Angeles',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });

            // Send success response
            res.status(200).json({ success: true, user: savedUser, message: `Profile Saved ${createdAt}` });
        } catch (err) {
            console.error('Error saving profile:', err);

            // Send error response
            res.status(500).json({
                success: false,
                message: `Could not save profile: ${err.message || err}`
            });
        }
    });

    app.post('/geotech/:companyid/saveproject/:projectid', async (req, res) => {
        try {
            const { companyid, projectid } = req.params;
            const { updatedProject } = req.body;

            if (!updatedProject) {
                return res.status(400).json({ error: "Missing updatedProject" });
            }

            // ensure projectid consistency
            updatedProject.projectid = projectid;

            // Update if exists
            const result = await MyProjects.updateOne(
                { companyid, "projects.projectid": projectid },
                { $set: { "projects.$": updatedProject } }
            );

            // Insert if not found
            if (result.matchedCount === 0) {
                await MyProjects.updateOne(
                    { companyid },
                    { $push: { projects: updatedProject } },
                    { upsert: true }
                );
            }

            // 🔥 Fetch ONLY the saved project
            const doc = await MyProjects.findOne(
                { companyid, "projects.projectid": projectid },
                { "projects.$": 1 } // returns only the matched project
            );

            const savedProject = doc?.projects?.[0] || null;

            const createdAt = new Date().toLocaleString('en-US', {
                timeZone: 'America/Los_Angeles',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });

            return res.status(200).json({
                message: `Project saved ${createdAt}`,
                updatedproject: savedProject
            });

        } catch (err) {
            console.error("Save project error:", err);
            return res.status(500).json({
                error: `Could not save project: ${err.message || err}`
            });
        }
    });

    app.post('/geotech/:companyid/saveprojects/:clientid', async (req, res) => {
        try {
            const { companyid, clientid } = req.params;
            const { projects } = req.body;

            // 1. Remove old projects for this client
            await MyProjects.updateOne(
                { companyid },
                { $pull: { projects: { clientid } } }
            );

            // 2. Add updated projects
            await MyProjects.updateOne(
                { companyid },
                { $push: { projects: { $each: projects } } },
                { upsert: true }
            );

            // 3. Fetch updated document
            const doc = await MyProjects.findOne({ companyid });

            // 4. Return ONLY this client's projects
            const clientProjects = doc?.projects.filter(
                p => p.clientid === clientid
            ) || [];

            const createdAt = new Date().toLocaleString('en-US', {
                timeZone: 'America/Los_Angeles',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });

            const message = `Projects saved ${createdAt}`

            res.json({ projects: clientProjects, message });

        } catch (err) {
            console.error(err);
            res.status(500).send("Server error");
        }

    })

    app.post('/geotech/:projectid/approveproposal/:proposalid', async (req, res) => {

        try {

            const { projectid, proposalid } = req.params;
            const proposalUpdate = req.body;

            const schedule = await Schedules.findOne({ projectid });

            if (!schedule) {
                return res.status(404).json({
                    error: true,
                    message: "Schedule not found."
                });
            }

            const proposal = schedule.proposals.find(
                p => p.proposalid === proposalid
            );

            if (!proposal) {
                return res.status(404).json({
                    error: true,
                    message: "Proposal not found."
                });
            }

            // Merge updated values into the proposal
            Object.assign(proposal, proposalUpdate);

            await schedule.save();

            // Return the updated proposal from MongoDB
            const updatedProposal = schedule.proposals.find(
                p => p.proposalid === proposalid
            );

            res.json({
                error: false,
                proposal: updatedProposal
            });

        } catch (err) {

            console.error(err);

            res.status(500).json({
                error: true,
                message: err.message
            });

        }

    });


    app.get("/geotech/:projectid/loadproject", async (req, res) => {
        try {
            const { projectid } = req.params;
            const gfk = new GFK();

            if (!projectid) {
                return res.status(400).json({
                    success: false,
                    message: "Missing project ID in request parameters.",
                });
            }

            // Load borings and field reports in parallel
            const [borings = [], fieldreports = [], compactioncurves = [], seismic = [], ptslab = [], slope = [], timesheet = [], schedule = []] = await Promise.all([
                gfk.loadBorings(projectid).catch(() => []),
                gfk.loadFieldReports(projectid).catch(() => []),
                gfk.loadCompactionCurves(projectid).catch(() => []),
                gfk.loadSeismic(projectid).catch(() => []),
                gfk.loadPTSlab(projectid).catch(() => []),
                gfk.loadSlope(projectid).catch(() => []),
                gfk.loadTimesheet(projectid).catch(() => []),
                gfk.loadSchedule(projectid).catch(() => [])

            ]);

            // Return response with projectid attached
            return res.status(200).json({
                success: true,
                projectid,
                borings,
                fieldreports,
                compactioncurves,
                seismic,
                ptslab,
                slope,
                timesheet,
                schedule,
                hasData: borings.length > 0 || fieldreports.length > 0 || compactioncurves.length > 0 || seismic.length > 0 || ptslab.length > 0 || slope.length > 0 || timesheet.length > 0,

            });
        } catch (err) {
            console.error("❌ Error loading project:", err);
            return res.status(500).json({
                success: false,
                message: "Error: Could not load project data.",
                error: err.message,
            });
        }
    });






}