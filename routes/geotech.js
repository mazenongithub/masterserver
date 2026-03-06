import Geotech from "../classes/geotech.js"
import CivilEngineer from '../classes/civilengineer.js'
import mongoose from 'mongoose';
export default (app) => {

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






}