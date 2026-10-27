import mongoose from 'mongoose';
import CivilEngineer from '../classes/civilengineer.js'
import { rateLimiter } from '../middleware/ratelimit.js';
import OpenAI from 'openai';

const contactSchema = new mongoose.Schema({
    company: String,
    construction: { type: Boolean, default: false },
    customapp: { type: Boolean, default: false },
    design: { type: Boolean, default: false },
    detail: String,
    emailaddress: { type: String, required: true },
    fullname: { type: String, required: true },
    geotechnical: { type: Boolean, default: false },
    phonenumber: { type: String, required: false},
    projectmanagement: { type: Boolean, default: false },
    created: { type: Date, default: Date.now }

})

const ContactUs = mongoose.model("ContactUs", contactSchema);

export default (app) => {

    app.post('/civilengineer/savecontactus', rateLimiter, async (req, res) => {
        try {
            const civilengineer = new CivilEngineer();
            const {
                company,
                construction,
                customapp,
                design,
                detail,
                emailaddress,
                fullname,
                geotechnical,
                phonenumber,
                projectmanagement,
                captchaToken
            } = req.body;

            if (!captchaToken) {
                return res.status(400).json({ message: "Captcha required" });
            }

            // Required field validation
            if (!fullname || !emailaddress || !detail) {
                return res.status(400).json({
                    error: 'fullname, emailaddress, and detail are required'
                });
            }


            const verification = await civilengineer.verifyTurnstile(
                captchaToken,
                req.ip
            );

            if (!verification.success) {
                return res.status(403).json({
                    error: "Captcha verification failed"
                });
            }

            // Build document matching schema
            const values = {
                company: company || '',
                construction: Boolean(construction),
                customapp: Boolean(customapp),
                design: Boolean(design),
                detail,
                emailaddress,
                fullname,
                geotechnical: Boolean(geotechnical),
                phonenumber: phonenumber || '',
                projectmanagement: Boolean(projectmanagement),
                created: new Date()
            };

            const contactus = await ContactUs.insertOne(values);

           

            // Send both emails in parallel
            await Promise.all([
                civilengineer.sendContactEmail(contactus),
                civilengineer.sendClientEmail(contactus)
            ]);

            return res.status(201).json({ contactus, message: `Your request have been submitted successfully ` });

        } catch (err) {
            console.error('save contact us error:', err);

            return res.status(500).json({
                error: `could not save contact us form ${err}`
            });
        }
    })


    app.get('/civilengineer/sendemail', async (req, res) => {
        const _id = '694a326e8c22248329cbfa9c';

        try {
            const contact = await ContactUs.findById(_id);

            if (!contact) {
                return res.status(404).json({
                    error: 'contact not found'
                });
            }

            const civilengineer = new CivilEngineer();

            // Send both emails in parallel
            await Promise.all([
                civilengineer.sendContactEmail(contact),
                civilengineer.sendClientEmail(contact)
            ]);

            return res.status(200).json({
                message: 'emails sent successfully',
                contact
            });

        } catch (err) {
            console.error('send email error:', err);

            return res.status(500).json({
                error: 'could not send email'
            });
        }
    });


    app.post('/civilengineer/askopenai', async (req, res) => {
        try {
            if (!process.env.OPEN_AI_SECRET) {
                return res.status(500).json({
                    success: false,
                    error: 'OpenAI API key is not configured.'
                });
            }
    
            const openai = new OpenAI({
                apiKey: process.env.OPEN_AI_SECRET
            });
    
            const {question} = req.body;
    
            const response = await openai.responses.create({
                model: 'gpt-6-luna',
                input: question,
                max_output_tokens: 500
            });
    
            return res.status(200).json({
                success: true,
                answer: response.output_text
            });
    
        } catch (error) {
            console.error('OpenAI API error:', error.message);
    
            const status = error.status || 500;
    
            if (status === 401) {
                return res.status(401).json({
                    success: false,
                    error: 'OpenAI API authentication failed. Check your API key.'
                });
            }
    
            if (status === 429) {
                return res.status(429).json({
                    success: false,
                    error: 'OpenAI API quota or rate limit exceeded. Check your billing and usage.'
                });
            }
    
            return res.status(500).json({
                success: false,
                error: 'Failed to get a response from OpenAI.'
            });
        }
    });
    


}
