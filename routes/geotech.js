import Geotech from "../classes/geotech.js"
import CivilEngineer from '../classes/civilengineer.js'
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




}