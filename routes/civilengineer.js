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
    phonenumber: { type: String, required: false },
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
            const { question } = req.body || {};

            if (typeof question !== 'string' || !question.trim()) {
                return res.status(400).json({
                    success: false,
                    error: 'Please provide a question.'
                });
            }

            if (!process.env.OPEN_AI_SECRET) {
                return res.status(500).json({
                    success: false,
                    error: 'OpenAI API key is not configured.'
                });
            }

            const openai = new OpenAI({
                apiKey: process.env.OPEN_AI_SECRET
            });

            const response = await openai.responses.create({
                model: 'gpt-6-luna',
                input: question.trim(),
                max_output_tokens: 2000
            });

            if (response.status !== 'completed') {
                return res.status(502).json({
                    success: false,
                    error: 'OpenAI did not complete the response.'
                });
            }

            const answer = response.output_text;

            if (!answer) {
                return res.status(502).json({
                    success: false,
                    error: 'No answer was returned by OpenAI.'
                });
            }

            return res.status(200).json({
                success: true,
                answer
            });

        } catch (error) {
            console.error('OpenAI API error:', {
                message: error.message,
                status: error.status,
                code: error.code
            });

            return res.status(error.status || 500).json({
                success: false,
                error: error.status === 429
                    ? 'OpenAI quota or rate limit exceeded. Check API billing and usage.'
                    : error.status === 401
                        ? 'OpenAI authentication failed. Check the API key.'
                        : 'Failed to get a response from OpenAI.'
            });
        }
    });

    app.post('/civilengineer/generatereportsection', async (req, res) => {
        try {
            const {
                question,
                parameters = {},
                instructions = ''
            } = req.body || {};

            if (typeof question !== 'string' || !question.trim()) {
                return res.status(400).json({
                    success: false,
                    error: 'Please provide a question.'
                });
            }

            if (!process.env.OPEN_AI_SECRET) {
                return res.status(500).json({
                    success: false,
                    error: 'OpenAI API key is not configured.'
                });
            }

            const openai = new OpenAI({
                apiKey: process.env.OPEN_AI_SECRET
            });

            const response = await openai.responses.create({
                model: 'gpt-6-luna',

                input: [
                    {
                        role: 'system',
                        content: `
You generate professional geotechnical engineering report sections
for CivilEngineer.io.

Generate only the requested report section.

Follow the supplied report-specific instructions and project parameters.
Use known project information where applicable.
Do not invent project facts, measurements, laboratory results,
field observations, or engineering conclusions.
Preserve placeholders for missing information.

SUBSECTION ORGANIZATION:
- Keep introductory and summary text in the parent section's content.
- Place distinct topics, procedures, or lists into appropriately
  titled subsections when that improves readability.
- Give each subsection its own title and content.
- Do not duplicate content between the parent and its subsections.
- If no subsections are needed, return an empty array.
- Preserve the existing parent section title.

Return JSON matching the required schema exactly.
`
                    },
                    {
                        role: 'user',
                        content: JSON.stringify({
                            question: question.trim(),
                            instructions,
                            parameters
                        })
                    }
                ],

                text: {
                    format: {
                        type: 'json_schema',
                        name: 'report_section',
                        strict: true,
                        schema: {
                            type: 'object',
                            properties: {
                                section: {
                                    type: 'string'
                                },
                                content: {
                                    type: 'string'
                                },
                                subsections: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            section: {
                                                type: 'string'
                                            },
                                            content: {
                                                type: 'string'
                                            }
                                        },
                                        required: [
                                            'section',
                                            'content'
                                        ],
                                        additionalProperties: false
                                    }
                                }
                            },
                            required: [
                                'section',
                                'content',
                                'subsections'
                            ],
                            additionalProperties: false
                        }
                    }
                },

                max_output_tokens: 4000
            });

            if (response.status !== 'completed') {
                console.error(
                    'Incomplete report section:',
                    response.status,
                    response.incomplete_details
                );

                return res.status(502).json({
                    success: false,
                    error: 'The report section was incomplete. Please try again.'
                });
            }

            if (!response.output_text) {
                return res.status(502).json({
                    success: false,
                    error: 'OpenAI returned no report section.'
                });
            }

            const specification = JSON.parse(response.output_text);

            return res.status(200).json({
                success: true,
                specification
            });

        } catch (error) {
            console.error('Generate report section API error:', {
                message: error.message,
                status: error.status,
                code: error.code
            });

            return res.status(
                error.status >= 400 && error.status < 600
                    ? error.status
                    : 500
            ).json({
                success: false,
                error: error.status === 429
                    ? 'OpenAI quota or rate limit exceeded.'
                    : error.status === 401
                        ? 'OpenAI authentication failed.'
                        : 'Failed to generate the report section.'
            });
        }
    });


    app.post('/civilengineer/generatereport', async (req, res) => {
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

            const { question, instructions, parameters } = req.body;


            const response = await openai.responses.create({
                model: 'gpt-6-luna',
                input: [
                    {
                        role: 'system',
                        content: instructions,
                    },
                    {
                        role: 'user',
                        content: JSON.stringify({
                            request: question,
                            reportInstructions: instructions,
                            projectParameters: parameters
                        })
                    }
                ],
                text: {
                    format: {
                        type: 'json_schema',
                        name: 'report_specification',
                        strict: true,
                        schema: {
                            type: 'object',
                            properties: {
                                reporttitle: {
                                    type: 'string'
                                },
                                sections: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            section: {
                                                type: 'string'
                                            },
                                            content: {
                                                type: 'string'
                                            },
                                            subsections: {
                                                type: 'array',
                                                items: {
                                                    type: 'object',
                                                    properties: {
                                                        section: {
                                                            type: 'string'
                                                        },
                                                        content: {
                                                            type: 'string'
                                                        }
                                                    },
                                                    required: [
                                                        'section',
                                                        'content'
                                                    ],
                                                    additionalProperties: false
                                                }
                                            }
                                        },
                                        required: [
                                            'section',
                                            'content',
                                            'subsections'
                                        ],
                                        additionalProperties: false
                                    }
                                }
                            },
                            required: [
                                'reporttitle',
                                'sections'
                            ],
                            additionalProperties: false
                        }
                    }
                },
                max_output_tokens: 8000
            });

            if (response.status !== 'completed') {
                console.error('Response status:', response.status);
                console.error('Incomplete details:', response.incomplete_details);

                return res.status(502).json({
                    success: false,
                    error: 'The specification was incomplete. Please try again.'
                });
            }

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
