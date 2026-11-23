import GFK from '../classes/gfk.js';
import Geotech from '../classes/geotech.js'
import mysql from 'mysql2/promise'
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { checkSessionGFK } from '../middleware/gfk-ms.js'
import { create } from 'xmlbuilder2';
import { streamFOP } from '../xsl/fopHelper.js';
import { calcdryden, calcmoist, calculateCost, calculateLaborCost, escapeXml, formatDate, formatDateReport, formatDateTime } from '../functions/gfkfunctions.js';
import UnconfinedCalcs from '../classes/unconfinedcalcs.js';
import SoilClassification from '../classes/soilclassification.js';
import ChatUser from '../classes/chatuser.js'
import CivilEngineer from '../classes/civilengineer.js'
import { rateLimiter } from '../middleware/ratelimit.js';
import { uploadImage, getImage, downloadImage } from '../functions/b2storage.js';
import { randomUUID } from 'node:crypto';
import { Readable } from 'node:stream';
import { pathToFileURL } from 'node:url';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { pipeline } from 'node:stream/promises';
import { spawn } from 'node:child_process';
import { createWriteStream, createReadStream } from 'node:fs';
import CompactionTables from '../classes/compactiontables.js';
import GraphicLogs from '../classes/graphiclogs.js';
import SDC from '../classes/sdc.js';
import Figures from '../classes/figures.js';




export default (app) => {



  const folders = [
    'uploads/gfk/fieldimages',
    'uploads/gfk/logdraft'
  ];

  folders.forEach(folder => {
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
  });

  // Dynamic storage function based on route
  function createStorage(folder) {
    return multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, folder);
      },
      filename: function (req, file, cb) {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
      }
    });
  }

  // Routes
  const uploadFieldImage = multer({ storage: createStorage('uploads/gfk/fieldimages') });

  const uploadFileImage = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
      if (['image/jpeg', 'image/png'].includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only JPEG and PNG images are allowed'));
      }
    }
  })


  app.ws("/:clientid/projects/:projectid/websocketapi", function (ws, req, next) {

    // req.session.myuser = {};
    // req.session.myuser._id = 'RX28A8I1MA3SRLS4'
    // req.session.myuser.userid = 'maison'
    // req.session.myuser.companyid ='661d45d677fdcfa48c8e8ed1'

    // console.log("myuser", req.session.myuser)
    const { clientid, projectid } = req.params;


    try {
      const user = new ChatUser(
        ws.send.bind(ws), // fn to call to message this user
        `geotech:${projectid}`, // name of room for user
        clientid // username
      );


      // register handlers for message-received, connection-closed

      ws.on("message", function (jsonData) {
        try {

          // console.log("message", jsonData)

          // compare saved company to data

          // save company



          user.projectHandler(jsonData, projectid)


        } catch (err) {
          console.error(err);
        }
      });


      ws.on("close", function () {
        // console.log("close")
        try {
          user.handleClose();
        } catch (err) {
          console.error(err);
        }
      });
    } catch (err) {
      console.error(err);
    }


  })



  app.post('/gfk/:companyid/savegraphiclogs', checkSessionGFK, async (req, res) => {

    try {

      const { companyid } = req.params;
      const { graphics } = req.body;

      if (!companyid) {
        return res.status(400).json({
          Error: 'Company ID is required.'
        });
      }

      if (!Array.isArray(graphics)) {
        return res.status(400).json({
          Error: 'Graphics must be an array.'
        });
      }

      // Verify that the authenticated user has
      // permission to modify this company's library.
      // Use your actual GFK session/company authorization.

      const graphicLogsHandler = new GraphicLogs();

      const graphiclogs = await graphicLogsHandler.saveGraphicLogs(
        companyid,
        graphics
      );

      return res.status(200).json({
        graphiclogs
      });

    } catch (err) {

      console.error('Error saving graphic logs:', err);

      return res.status(500).json({
        Error: `Could not save graphic logs: ${err.message}`
      });
    }
  });






  app.get("/gfk/:companyid/loadgraphiclogs", async (req, res) => {

    try {
      const { companyid } = req.params;
      const graphicLogsHandler = new GraphicLogs();

      const graphiclogs = await graphicLogsHandler.loadGraphicLogs(companyid)

      return res.status(200).json({
        graphiclogs
      });

    } catch (err) {
      console.error("Error loading graphic logs:", err);

      return res.status(500).json({
        Error: `Could not load graphic logs: ${err.message}`
      });
    }

  });



  app.get('/gfk/:projectid/compactiontables',
    async (req, res) => {

      try {

        const { projectid } = req.params;

        const tables = new CompactionTables();

        const result = await tables.loadCompactionTables(
          projectid
        );

        return res.status(200).json(result);

      } catch (err) {

        console.error(err);

        return res.status(500).json({
          success: false,
          Error: 'Could not load compaction tables.'
        });
      }
    }
  );

  // ============================================
  // SAVE COMPACTION TABLES
  // ============================================

  app.post('/gfk/:projectid/compactiontables', async (req, res) => {

    try {

      const { projectid } = req.params;
      const { tables } = req.body;

      const handler = new CompactionTables();

      const result = await handler.saveCompactionTables(
        projectid,
        tables
      );

      return res.status(200).json(result);

    } catch (err) {

      console.error(err);

      return res.status(500).json({
        success: false,
        Error: 'Could not save compaction tables.'
      });
    }
  }
  );


  app.post('/gfk/savecontactus', rateLimiter, async (req, res) => {
    const gfk = new GFK();
    const civilengineer = new CivilEngineer();

    try {
      const {
        fullname,
        company,
        emailaddress,
        phonenumber,
        lab,
        liquefaction,
        logdraft,
        field,
        ptslab,
        slope,
        reports,
        invoice,
        description,
        captchaToken
      } = req.body;

      if (!captchaToken) {
        return res.status(400).json({ message: "Captcha required" });
      }

      // Required field validation
      if (!fullname || !emailaddress) {
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
        lab: Boolean(lab),
        liquefaction: Boolean(liquefaction),
        logdraft: Boolean(logdraft),
        description: description || "",
        emailaddress,
        fullname,
        field: Boolean(field),
        phonenumber: phonenumber || '',
        ptslab: Boolean(ptslab),
        slope: Boolean(slope),
        reports: Boolean(reports),
        invoice: Boolean(invoice),
        created: new Date()
      };

      const contactus = await gfk.insertContact(values)

      // Send both emails in parallel
      await Promise.all([
        gfk.sendContactEmail(contactus),
        gfk.sendClientEmail(contactus)
      ]);

      return res.status(201).json({ contactus, message: `Your request have been submitted successfully ` });

    } catch (err) {
      console.error('save contact us error:', err);

      return res.status(500).json({
        error: 'could not save contact us form'
      });
    }
  })


  app.post("/gfk/upload/fieldimage", checkSessionGFK, uploadFieldImage.single("fieldimage"), async (req, res) => {

    try {
      const gfk = new GFK();

      const { projectid, fieldid, imageid } = req.body;
      let { fieldreports } = req.body
      fieldreports = JSON.parse(fieldreports);


      if (!projectid || !fieldid || !imageid || !fieldreports) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: projectid, fieldid, imageid, fieldreports",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      const fileUrl = `/uploads/gfk/fieldimages/${req.file.filename}`;

      // Find field report
      const reportIndex = fieldreports.findIndex(
        (r) => r.fieldid === fieldid
      );

      if (reportIndex === -1) {
        return res.status(404).json({
          success: false,
          message: "Field report not found",
        });
      }

      const report = fieldreports[reportIndex];

      // Ensure images array exists
      if (!Array.isArray(report.images)) {
        report.images = [];
      }

      const imageIndex = report.images.findIndex(
        (img) => img.imageid === imageid
      );

      if (imageIndex === -1) {
        return res.status(404).json({
          success: false,
          message: "Image record not found",
        });
      }

      // Update only the image URL
      report.images[imageIndex].image = fileUrl;

      const timestamp = new Date().toLocaleString("en-US", {
        timeZone: "America/Los_Angeles",
      });

      const payload = { projectid, fieldreports };

      const savedReports = await gfk.saveFieldReports(payload);

      return res.status(200).json({
        success: true,
        fieldreports: savedReports,
        message: `Field Report Image Saved Successfully - ${timestamp}`,
        url: fileUrl,
      });
    } catch (err) {
      console.error("❌ Error uploading field image:", err);

      return res.status(500).json({
        success: false,
        message: "Error: Could not upload field image",
        error: err.message,
      });
    }
  }
  );



 
app.get(
    '/gfk/:projectid/figures/:figureid/reportxml',

    async (req, res) => {

        const gfk = new GFK();
        const figureHandler = new Figures();

        const { projectid, figureid } = req.params;

        const FIGURE_DEFAULT_FORMAT = 'pdf';
        const FIGURE_XSL = path.resolve('xsl/figure.xsl');

        let tempDir;

        // ============================================
        // HELPERS
        // ============================================

        const escapeXML = value => {
            return String(value ?? '')
                .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&apos;');
        };

        const safeFilePart = value =>
            String(value ?? 'unknown')
                .replace(/[^a-zA-Z0-9._-]/g, '_');

        const runFOPToFile = (xmlFile, xslFile, pdfFile) => {

            return new Promise((resolve, reject) => {

                const fop = spawn('/usr/bin/fop', [
                    '-xml', xmlFile,
                    '-xsl', xslFile,
                    '-pdf', pdfFile
                ], {
                    stdio: ['ignore', 'ignore', 'pipe']
                });

                let stderr = '';
                let timedOut = false;

                const timeout = setTimeout(() => {
                    timedOut = true;
                    fop.kill('SIGKILL');
                }, 60000);

                fop.stderr.on('data', data => {
                    stderr = (
                        stderr + data.toString()
                    ).slice(-8000);
                });

                fop.once('error', error => {
                    clearTimeout(timeout);
                    reject(error);
                });

                fop.once('close', (code, signal) => {

                    clearTimeout(timeout);

                    if (code === 0 && !timedOut) {
                        resolve();
                    } else {
                        reject(new Error(
                            timedOut
                                ? 'FOP timed out'
                                : `FOP failed (${signal || code}): ${stderr.trim()}`
                        ));
                    }
                });
            });
        };

        // ============================================
        // OUTPUT FORMAT
        // ============================================

        const requestedFormat = String(
            req.query.format || FIGURE_DEFAULT_FORMAT
        ).toLowerCase();

        const format =
            requestedFormat === 'fop'
                ? 'pdf'
                : requestedFormat;

        if (!['xml', 'pdf'].includes(format)) {
            return res.status(400).json({
                Error: 'Format must be xml or pdf'
            });
        }

        try {

            // ========================================
            // LOAD PROJECT AND FIGURE
            // ========================================

            const [project, figures] = await Promise.all([
                gfk.getProjectById(projectid),
                figureHandler.loadProjectFigures(projectid)
            ]);

            if (!project) {
                return res.status(404).json({
                    Error: 'Project not found'
                });
            }

            // Keep your existing project authorization
            // middleware/checks in place.

            const figureList = Array.isArray(figures)
                ? figures
                : [];

            const figure = figureList.find(
                f => String(f.figureid) === String(figureid)
            );

            if (!figure) {
                return res.status(404).json({
                    Error: 'Figure not found'
                });
            }

            // ========================================
            // CONFIGURATION
            // ========================================

            const baseURL = String(
                process.env.GFK_API_PUBLIC_URL ||
                `${req.protocol}://${req.get('host')}`
            ).replace(/\/+$/, '');

            const orientation =
                figure.orientation === 'landscape'
                    ? 'landscape'
                    : 'portrait';

            // Existing HTTP image endpoint for Oxygen.
            const imageURL = figure.figureurl
                ? `${baseURL}/gfk/${encodeURIComponent(projectid)}/figures/${encodeURIComponent(figureid)}/image`
                : '';

            const logoURL =
                process.env.GFK_REPORT_LOGO_URI || '';

            let figureImagePath = imageURL;
            let logoImagePath = logoURL;

            // ========================================
            // PREPARE LOCAL IMAGES FOR APACHE FOP
            // ========================================

            if (format === 'pdf') {

                tempDir = await mkdtemp(
                    path.join(tmpdir(), 'gfk-figure-')
                );

                if (figure.figureurl) {

                    const imageKey = String(
                        figure.figureurl
                    ).trim();

                    // B2 image key must be relative.
                    if (
                        imageKey.startsWith('/') ||
                        imageKey.includes('..') ||
                        !/^[a-zA-Z0-9_./-]+\.(jpg|jpeg|png)$/i.test(imageKey)
                    ) {
                        throw new Error(
                            `Invalid figure image key: ${imageKey}`
                        );
                    }

                    const localImage = path.join(
                        tempDir,
                        `figure-${path.basename(imageKey)}`
                    );

                    await downloadImage(
                        imageKey,
                        localImage
                    );

                    figureImagePath =
                        pathToFileURL(localImage).href;
                }

                // Logo handling:
                // FOP can use a public HTTP(S) logo URI,
                // or a local file URI. For a private logo,
                // download it locally using your existing
                // storage helper before rendering.
            }

            // ========================================
            // BUILD FIGURE XML
            // ========================================

            const x = escapeXML;

            const xml = `<?xml version="1.0" encoding="UTF-8"?>
<figure>
    <projectid>${x(projectid)}</projectid>
    <projecttitle>${x(project.title)}</projecttitle>
    <projectaddress>${x(project.projectaddress)}</projectaddress>
    <projectcity>${x(project.projectcity)}</projectcity>
    <projectnumber>${x(project.projectnumber)}</projectnumber>

    <figureid>${x(figure.figureid)}</figureid>
    <figuretitle>${x(figure.figuretitle)}</figuretitle>
    <figurecaption>${x(figure.figurecaption)}</figurecaption>
    <orientation>${x(orientation)}</orientation>

    <figureurl>${x(figure.figureurl)}</figureurl>
    <imageurl>${x(figureImagePath)}</imageurl>
    <logourl>${x(logoImagePath)}</logourl>
</figure>`;

            res.setHeader('Cache-Control', 'no-store');

            // ========================================
            // OXYGEN XML OUTPUT
            // ========================================

            if (format === 'xml') {

                return res.status(200)
                    .type('application/xml; charset=utf-8')
                    .send(xml);
            }

            // ========================================
            // APACHE FOP PDF OUTPUT
            // ========================================

            const xmlFile = path.join(
                tempDir,
                'figure.xml'
            );

            const pdfFile = path.join(
                tempDir,
                'figure.pdf'
            );

            await writeFile(
                xmlFile,
                xml,
                'utf8'
            );

            await runFOPToFile(
                xmlFile,
                FIGURE_XSL,
                pdfFile
            );

            // ========================================
            // STREAM PDF
            // ========================================

            const filename =
                `GFK-Project-${safeFilePart(project.projectnumber)}` +
                `-Figure-${safeFilePart(figure.figureid)}.pdf`;

            res.status(200)
                .type('application/pdf')
                .set(
                    'Content-Disposition',
                    `inline; filename="${filename}"`
                );

            await pipeline(
                createReadStream(pdfFile),
                res
            );

        } catch (err) {

            console.error(
                'GFK figure generation error:',
                err
            );

            if (!res.headersSent) {

                return res.status(500).json({
                    Error: `Server error: ${err.message}`
                });
            }

            if (!res.destroyed) {
                res.destroy(err);
            }

        } finally {

            // ========================================
            // CLEAN UP TEMPORARY FILES
            // ========================================

            if (tempDir) {

                await rm(tempDir, {
                    recursive: true,
                    force: true
                }).catch(error => {

                    console.error(
                        'Temporary figure cleanup error:',
                        error
                    );
                });
            }
        }
    }
);
;

  app.get(
    '/gfk/:projectid/figures/:figureid/image',

    async (req, res) => {

      try {
        const { projectid, figureid } = req.params;

        const figureHandler = new Figures();

        // Load project figures
        const figures = await figureHandler.loadProjectFigures(
          projectid
        );

        // Find requested figure
        const figure = figures.find(
          f => f.figureid === figureid
        );

        if (!figure?.figureurl) {
          return res.status(404).json({
            message: 'Figure image not found'
          });
        }

        // Also verify that the authenticated user
        // is authorized to view this project.

        const key = figure.figureurl;

        // Validate B2 storage location
        if (
          !key.startsWith(
            `gfk/figures/${encodeURIComponent(projectid)}/`
          )
        ) {
          return res.status(400).json({
            message: 'Invalid B2 image key'
          });
        }

        // Download image using existing helper
        const image = await getImage(key);

        res.setHeader(
          'Content-Type',
          image.ContentType || 'image/jpeg'
        );

        res.setHeader(
          'Cache-Control',
          'private, max-age=300'
        );

        Readable.fromWeb(
          image.Body.transformToWebStream()
        )
          .on('error', err => {
            console.error('Figure image stream error:', err);
            res.destroy(err);
          })
          .pipe(res);

      } catch (err) {

        console.error('Figure image error:', err);

        if (!res.headersSent) {
          return res.status(500).json({
            message: 'Unable to retrieve figure image'
          });
        }

        res.destroy();
      }
    }
  );



  app.get(
    '/gfk/:companyid/graphiclogs/:graphicid/image',

    async (req, res) => {

      try {

        const { companyid, graphicid } = req.params;

        const graphicLogs = new GraphicLogs();

        // =====================================
        // VERIFY COMPANY ACCESS
        // =====================================

        // Adjust this to your actual session structure.

        // =====================================
        // FIND GRAPHIC IN MONGODB
        // =====================================

        const graphic = await graphicLogs.findGraphicByID(
          companyid,
          graphicid
        );

        if (!graphic?.graphiclog) {
          return res.status(404).json({
            Error: 'Graphic log not found'
          });
        }

        // =====================================
        // BACKBLAZE IMAGE KEY
        // =====================================

        const key = graphic.graphiclog;

        // Support existing and new image folders.
        if (
          !key.startsWith('gfk/logdraft/') &&
          !key.startsWith('gfk/graphiclogs/')
        ) {
          return res.status(400).json({
            Error: 'Invalid B2 image key'
          });
        }

        // =====================================
        // LOAD IMAGE FROM BACKBLAZE
        // =====================================

        const image = await getImage(key);

        if (!image?.Body) {
          return res.status(404).json({
            Error: 'Image not found in Backblaze'
          });
        }

        // =====================================
        // IMAGE RESPONSE
        // =====================================

        const extension = key.split('.').pop().toLowerCase();

        const contentType = {
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          png: 'image/png'
        }[extension];

        if (!contentType) {
          return res.status(415).json({
            Error: 'Unsupported image format'
          });
        }

        res.setHeader(
          'Content-Type',
          contentType
        );

        res.setHeader(
          'Cache-Control',
          'private, max-age=300'
        );

        res.setHeader(
          'X-Content-Type-Options',
          'nosniff'
        );

        // =====================================
        // STREAM IMAGE
        // =====================================

        const body = image.Body;

        const source =
          typeof body.pipe === 'function'
            ? body
            : Readable.fromWeb(
              body.transformToWebStream()
            );

        await pipeline(source, res);

      } catch (err) {

        console.error('Graphic log error:', err);

        if (!res.headersSent) {
          return res.status(500).json({
            Error: `Unable to retrieve image: ${err.message}`
          });
        }

        res.destroy(err);
      }
    }
  );



  app.post('/gfk/:projectid/figures/savefigures', checkSessionGFK, async (req, res) => {

    try {
      const { projectid } = req.params;
      const { figures } = req.body;

      const figureHandler = new Figures();

      if (!Array.isArray(figures)) {
        return res.status(400).json({
          Error: 'Invalid figures array'
        });
      }

      const savedFigures = await figureHandler.updateProjectFigures(
        projectid,
        figures
      );

      return res.status(200).json({
        message: `Figures saved ${formatDateTime(new Date())}`,
        figures: savedFigures
      });

    } catch (err) {

      console.error('Error saving project figures:', err);

      return res.status(500).json({
        Error: `Could not save project figures: ${err.message}`
      });
    }

  });

  app.post(
    '/gfk/:projectid/uploadfileimage/:figureid',
    checkSessionGFK,
    uploadFileImage.single('fileimage'),
    async (req, res) => {

      try {
        const { projectid, figureid } = req.params;

        const figureHandler = new Figures();

        // Validate uploaded file
        if (!req.file?.buffer) {
          return res.status(400).json({
            Error: 'No image file uploaded'
          });
        }

        // Parse figures from FormData
        const projectFigures = JSON.parse(
          req.body.figures || '[]'
        );

        if (!Array.isArray(projectFigures)) {
          return res.status(400).json({
            Error: 'Invalid figures array'
          });
        }

        // Determine file extension
        const extensions = {
          'image/jpeg': '.jpg',
          'image/png': '.png',
          'image/webp': '.webp'
        };

        const extension = extensions[req.file.mimetype];

        if (!extension) {
          return res.status(400).json({
            Error: 'Unsupported image format'
          });
        }

        // Generate unique filename
        const filename = `${randomUUID()}${extension}`;

        // Generate Backblaze B2 file key
        const fileKey = `gfk/figures/${encodeURIComponent(projectid)}/${encodeURIComponent(figureid)}/${filename}`;

        // Upload image to Backblaze B2
        await uploadImage(
          fileKey,
          req.file.buffer,
          req.file.mimetype
        );

        // Find figure within project figures
        const figureIndex = projectFigures.findIndex(
          figure => figure.figureid === figureid
        );

        if (figureIndex >= 0) {

          // Update existing figure
          projectFigures[figureIndex].figureurl = fileKey;

        } else {

          // Add new figure
          projectFigures.push({
            figureid,
            figuretitle: req.body.figuretitle || '',
            figureurl: fileKey,
            figurecaption: req.body.figurecaption || ''
          });
        }

        // Save entire figures array to MongoDB
        const updatedFigures = await figureHandler.updateProjectFigures(
          projectid,
          projectFigures
        );

        // Return updated figures
        return res.status(200).json(updatedFigures);

      } catch (err) {

        console.error('Error uploading figure:', err);

        return res.status(500).json({
          Error: `Could not upload fileimage: ${err.message}`
        });
      }
    }
  );


 
app.post(
    '/gfk/:companyid/uploadgraphiclog',
    checkSessionGFK,
    uploadFileImage.single('graphiclog'),
    async (req, res) => {

        try {

            const { companyid } = req.params;
            const { graphicid } = req.body;

            const graphics = JSON.parse(
                req.body.graphics || '[]'
            );

            // Verify the logged-in user has
            // write access to this company.

            const graphicLogsHandler = new GraphicLogs();

            const updatedGraphics =
                await graphicLogsHandler.uploadGraphicLogImage(
                    req.file,
                    companyid,
                    graphicid,
                    graphics
                );

            return res.status(200).json({
                graphiclogs: {
                    companyid,
                    graphics: updatedGraphics
                }
            });

        } catch (error) {

            console.error(
                'Upload graphic log error:',
                error
            );

            return res.status(500).json({
                Error: error.message
            });
        }
    }
);



  app.get("/gfk/loadprojects", checkSessionGFK, async (req, res) => {
    try {
      const gfk = new GFK();
      const companyid = 'gfk'

      // 1️⃣ Load projects from Mongo (or wherever GFK retrieves them)
      const projects = await gfk.loadProjects(companyid);

      // 2️⃣ Handle empty results gracefully
      if (!projects || projects.length === 0) {
        return res.json({
          success: true,
          count: 0,
          projects: [],
          message: `No projects found for company '${companyid}'.`,
        });
      }

      // 3️⃣ Respond with data
      res.json({
        success: true,
        count: projects.length,
        projects
      });
    } catch (err) {
      console.error("❌ Error fetching projects:", err);
      res.status(500).json({
        success: false,
        message: "Error: Could not load projects.",
        error: err.message,
      });
    }
  });

  app.post("/gfk/:engineer_id/saveprofile", checkSessionGFK, async (req, res) => {

    try {
      const gfk = new GFK();
      const { engineer_id } = req.params;
      const { profile } = req.body



      const engineer = await gfk.saveEngineerProfile(engineer_id, profile)

      if (!engineer) {
        return res.status(404).send({
          Error: 'Engineer not found'
        });
      }

      res.status(200).send(engineer);

    } catch (err) {
      res.status(500).send({
        Error: `Could not save engineer profile: ${err}`
      });
    }


  })

  app.post('/gfk/savereport', checkSessionGFK, async (req, res) => {
    const report = req.body;
    const gfk = new GFK();

    try {
      const savedreport = await gfk.saveReport(report);

      return res.status(200).send({
        savedreport,
        timestamp: new Date()
      });

    } catch (err) {
      console.error('Error saving report:', err);

      return res.status(500).send({
        error: `Server error: unable to save report. ${err.message}`
      });
    }
  });

  app.post("/gfk/saveprojects", checkSessionGFK, async (req, res) => {
    try {
      const gfk = new GFK();
      const { companyid, projects } = req.body;

      if (!companyid || !Array.isArray(projects)) {
        return res.status(400).json({
          success: false,
          message: "Invalid request: 'companyid' and 'projects' are required.",
        });
      }

      const savedProjects = await gfk.saveProjects({ companyid, projects });

      res.status(200).json({
        success: true,
        count: savedProjects?.length || projects.length,
        projects: savedProjects || projects,
      });
    } catch (err) {
      console.error("❌ Error saving projects:", err);
      res.status(500).json({
        success: false,
        message: "Error: Could not save projects.",
        error: err.message,
      });
    }
  });


  app.post('/:gfk/saveborings', checkSessionGFK, async (req, res) => {
    try {
      const gfk = new GFK();
      const { projectid, borings } = req.body;
      const myBorings = { projectid, borings }

      const updatedBorings = await gfk.saveBorings(myBorings);
      const timestamp = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });

      return res.status(200).json({
        message: `Borings Saved Successfully - ${timestamp}`,
        borings: {
          projectid,
          borings: updatedBorings
        }
      });

    } catch (err) {
      console.error("Error saving borings:", err);
      return res.status(500).json({
        message: `Error saving borings: ${err.message}`
      });
    }
  });

  app.post('/:gfk/savefieldreports', checkSessionGFK, async (req, res) => {
    try {
      const gfk = new GFK();
      const { projectid, fieldreports } = req.body;

      const myFieldReports = { projectid, fieldreports }

      const updatedFieldReports = await gfk.saveFieldReports(myFieldReports);
      const timestamp = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });

      return res.status(200).json({
        message: `FieldReports Saved Successfully - ${timestamp}`,
        fieldreports: {
          projectid: updatedFieldReports.projectid,
          fieldreports: updatedFieldReports.fieldreports
        }
      });

    } catch (err) {
      console.error("Error saving fieldreports:", err);
      return res.status(500).json({
        message: `Error saving fieldreports: ${err.message}`
      });
    }
  });


  app.post('/gfk/saveseismic', checkSessionGFK, async (req, res) => {
    try {
      const gfk = new GFK();
      const { projectid, seismic } = req.body;



      // Validate input
      if (!projectid || !seismic || typeof seismic !== "object") {
        return res.status(400).json({
          success: false,
          message: "Invalid request: 'projectid' and 'seismic' (object) are required.",
        });
      }

      const payload = { projectid, seismic };

      // Save seismic data
      const savedSeismic = await gfk.saveSeismic(payload);

      // Local timestamp
      const timestamp = new Date().toLocaleString("en-US", {
        timeZone: "America/Los_Angeles",
      });

      return res.status(200).json({
        success: true,
        seismic: savedSeismic,
        message: `Seismic Saved Successfully - ${timestamp}`,
      });

    } catch (err) {
      console.error("❌ Error saving seismic:", err);

      return res.status(500).json({
        success: false,
        message: "Error: Could not save seismic.",
        error: err.message,
      });
    }
  });


  app.post('/gfk/saveptslab', checkSessionGFK, async (req, res) => {
    try {
      const gfk = new GFK();
      const { projectid, ptslab } = req.body;


      // Validate input
      if (!projectid || !ptslab || typeof ptslab !== "object") {
        return res.status(400).json({
          success: false,
          message: "Invalid request: 'projectid' and 'ptslab' (object) are required.",
        });
      }

      const payload = { projectid, ptslab };

      // Save ptslab data
      const savedPTSlab = await gfk.savePTSlab(ptslab);


      // Local timestamp
      const timestamp = new Date().toLocaleString("en-US", {
        timeZone: "America/Los_Angeles",
      });

      return res.status(200).json({
        success: true,
        ptslab: savedPTSlab,
        message: `PTSlab Saved Successfully - ${timestamp}`,
      });

    } catch (err) {
      console.error("❌ Error saving ptslab:", err);

      return res.status(500).json({
        success: false,
        message: "Error: Could not save ptslab.",
        error: err.message,
      });
    }
  });


  app.post('/gfk/saveslope', checkSessionGFK, async (req, res) => {
    try {
      const gfk = new GFK();
      const { projectid, slope } = req.body;



      // Validate input
      if (!projectid || !slope || typeof slope !== "object") {
        return res.status(400).json({
          success: false,
          message: "Invalid request: 'projectid' and 'slope' (object) are required.",
        });
      }



      // Save slope data
      const savedSlope = await gfk.saveSlope(slope);


      // Local timestamp
      const timestamp = new Date().toLocaleString("en-US", {
        timeZone: "America/Los_Angeles",
      });

      return res.status(200).json({
        success: true,
        slope: savedSlope,
        message: `Slope Saved Successfully - ${timestamp}`,
      });

    } catch (err) {
      console.error("❌ Error saving slope:", err);

      return res.status(500).json({
        success: false,
        message: "Error: Could not save slope.",
        error: err.message,
      });
    }
  });

  app.post('/:gfk/savecompactioncurves', checkSessionGFK, async (req, res) => {
    try {
      const gfk = new GFK();
      const { projectid, compactioncurves } = req.body;

      const myCompactionCurves = { projectid, compactioncurves };

      const updatedCompactionCurves = await gfk.saveCompactionCurves(myCompactionCurves);

      // Always ensure it's an array
      const cleanedCurves = Array.isArray(updatedCompactionCurves)
        ? updatedCompactionCurves
        : [];

      const timestamp = new Date().toLocaleString("en-US", {
        timeZone: "America/Los_Angeles"
      });

      return res.status(200).json({
        message: `Compaction Curves Saved Successfully - ${timestamp}`,

        // Frontend expects this shape:
        compactioncurves: {
          projectid,
          compactioncurves: cleanedCurves
        }
      });

    } catch (err) {
      console.error("Error saving compactioncurves:", err);

      return res.status(500).json({
        message: `Error saving compactioncurves: ${err.message}`
      });
    }
  });

  app.post('/:company/saveclients', checkSessionGFK, async (req, res) => {
    try {
      const gfk = new GFK();
      const company = req.params.company?.trim();
      const clients = req.body?.clients;

      console.log({ company, clients })

      if (!company) {
        return res.status(400).json({ message: "Company is required in URL." });
      }

      if (!Array.isArray(clients)) {
        return res.status(400).json({ message: "Clients must be an array." });
      }

      const updatedClients = await gfk.saveClients({ company, clients });

      // safety check
      if (!updatedClients) {
        return res.status(500).json({
          message: "Error: Clients could not be saved."
        });
      }

      const timestamp = new Date().toLocaleString("en-US", {
        timeZone: "America/Los_Angeles"
      });

      return res.status(200).json({
        message: `Clients Saved Successfully - ${timestamp}`,
        company,
        clients: updatedClients
      });

    } catch (err) {
      console.error("Error saving clients:", err);

      return res.status(500).json({
        message: `Error saving clients: ${err.message}`
      });
    }
  });


  app.post('/gfk/savetimesheet', checkSessionGFK, async (req, res) => {
    try {
      const gfk = new GFK();
      const { projectid, timesheet } = req.body;

      if (!projectid) {
        return res.status(400).json({ message: "Project ID is required." });
      }

      if (!timesheet ||
        !Array.isArray(timesheet.labor) ||
        !Array.isArray(timesheet.costs) ||
        !Array.isArray(timesheet.invoices)) {
        return res.status(400).json({ message: "All timesheet properties (labor, costs, invoices) must be arrays." });
      }

      // Save timesheet
      const updatedTimesheet = await gfk.saveTimesheet({ projectid, ...timesheet });

      if (!updatedTimesheet) {
        return res.status(500).json({ message: "Error: Timesheet could not be saved." });
      }

      const timestamp = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });

      return res.status(200).json({
        message: `Timesheet Saved Successfully - ${timestamp}`,
        timesheet: updatedTimesheet
      });

    } catch (err) {
      console.error("Error saving timesheet:", err);
      return res.status(500).json({
        message: `Error saving timesheet: ${err.message}`
      });
    }
  });


  app.post('/gfk/saveschedule', checkSessionGFK, async (req, res) => {
    try {
      const gfk = new GFK();
      const { projectid, schedule } = req.body;

      if (!projectid) {
        return res.status(400).json({ message: "Project ID is required." });
      }

      if (!schedule ||
        !Array.isArray(schedule.labor) ||
        !Array.isArray(schedule.costs) ||
        !Array.isArray(schedule.proposals)) {
        return res.status(400).json({ message: "All schedule properties (labor, costs, invoices) must be arrays." });
      }

      // Save schedule
      const updatedSchedule = await gfk.saveSchedule({ projectid, ...schedule });

      if (!updatedSchedule) {
        return res.status(500).json({ message: "Error: Schedule could not be saved." });
      }

      const timestamp = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });

      return res.status(200).json({
        message: `Schedule Saved Successfully - ${timestamp}`,
        schedule: updatedSchedule
      });

    } catch (err) {
      console.error("Error saving schedule:", err);
      return res.status(500).json({
        message: `Error saving schedule: ${err.message}`
      });
    }
  });


  app.post("/gfk/:projectid/sdc", async (req, res) => {
    try {
      const sdcHandler = new SDC();

      const { projectid } = req.params;
      const { sdc } = req.body;

      if (!projectid) {
        return res.status(400).json({
          error: "ProjectID is required"
        });
      }

      const response = await sdcHandler.handleCriteria(projectid, sdc);

      return res.status(200).json(response);

    } catch (err) {
      console.error("Error updating Seismic Design Criteria:", err);

      return res.status(500).json({
        error: "Could not update Seismic Design Criteria"
      });
    }
  });



  app.get("/gfk/:projectid/loadproject", checkSessionGFK, async (req, res) => {
    try {
      const { projectid } = req.params;

      if (!projectid) {
        return res.status(400).json({
          success: false,
          message: "Missing project ID."
        });
      }

      const gfk = new GFK();
      const sdcHandler = new SDC();
      const figureHandler = new Figures();
      const compactionTablesHandler = new CompactionTables();

      const [
        borings,
        fieldreports,
        compactioncurves,
        seismic,
        ptslab,
        slope,
        timesheet,
        schedule,
        reports,
        sdc,
        figures,
        compactionTableData
      ] = await Promise.all([
        gfk.loadBorings(projectid),
        gfk.loadFieldReports(projectid),
        gfk.loadCompactionCurves(projectid),
        gfk.loadSeismic(projectid),
        gfk.loadPTSlab(projectid),
        gfk.loadSlope(projectid),
        gfk.loadTimesheet(projectid),
        gfk.loadSchedule(projectid),
        gfk.loadReports(projectid),
        sdcHandler.loadSeismicDesignCriteria(projectid),
        figureHandler.loadProjectFigures(projectid),
        compactionTablesHandler.loadCompactionTables(projectid)
      ]);

      const projectData = {
        borings: borings ?? [],
        fieldreports: fieldreports ?? [],
        compactioncurves: compactioncurves ?? [],
        seismic: seismic ?? [],
        ptslab: ptslab ?? [],
        slope: slope ?? [],
        timesheet: timesheet ?? [],
        schedule: schedule ?? [],
        reports: reports ?? [],
        SDC: sdc ?? null,
        figures: figures ?? [],
        tables: compactionTableData.tables ?? []
      };

      const hasData = Object.values(projectData).some(value =>
        Array.isArray(value)
          ? value.length > 0
          : value !== null && value !== undefined
      );

      return res.status(200).json({
        success: true,
        projectid,
        ...projectData,
        hasData,
        message: hasData
          ? "Project data loaded successfully."
          : "No project data found."
      });

    } catch (err) {
      console.error("Error loading project:", err);

      return res.status(500).json({
        success: false,
        message: "Could not load project data."
      });
    }
  });


  app.post('/:gfk/users/clientlogin', async (req, res) => {
    try {
      const gfk = new GFK();
      const geotech = new Geotech();

      const engineerInfo = req.body;

      // Verify Firebase authentication token
      if (!engineerInfo.authToken) {
        return res.status(401).json({
          message: 'Firebase authentication token missing'
        });
      }

      const getUser = await geotech.getFireBaseUser(
        engineerInfo.authToken
      );
  


      if (!getUser?.uid) {
        return res.status(401).json({
          message: 'Invalid Firebase authentication'
        });
      }

      // Assign verified Firebase UID
      engineerInfo.uid = getUser.uid;

      // Find existing engineer
      const result = await gfk.clientLogin(engineerInfo);

      if (!result.engineer) {
        return res.status(404).json({
          message: result.message || 'Engineer not found'
        });
      }

      // Save session for authenticated engineer
      req.session.engineerId = result.engineer._id;
      await req.session.save();

      // Load application data
      const [clients, projects] = await Promise.all([
        gfk.findClients(),
        gfk.loadProjects('gfk')
      ]);

      return res.status(200).json({
        engineer: result.engineer,
        projects,
        gfk: {
          clients
        }
      });

    } catch (err) {
      console.error('Error during engineer login:', err);

      return res.status(500).json({
        message: 'Could not log in engineer'
      });
    }
  });

  app.get("/gfk/:engineerid/logout", (req, res) => {
    const { engineerid } = req.params;

    // Check if a session exists
    if (!req.session) {
      return res.status(400).json({ message: "No active session found" });
    }

    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error:", err);
        return res.status(500).json({ message: "Error logging out" });
      }

      res.clearCookie("connect.sid"); // ✅ clear the session cookie
      res.json({ message: `${engineerid} has been logged out successfully` });
    });
  })





  app.get('/gfk/checkuser', async (req, res) => {
    const engineerId = req.session.engineerId;
    const gfk = new GFK();

    try {
      // No session found → user is not logged in
      if (!engineerId) {
        return res.status(401).json({ message: "No engineer is logged in" });
      }

      // Look up engineer
      const engineer = await gfk.findEngineerByID(engineerId);

      // Engineer does not exist
      if (!engineer) {
        return res.status(404).json({ message: "Engineer not found" });
      }

      const [clients, projects] = await Promise.all([
        gfk.findClients(),
        gfk.loadProjects("gfk")
      ])

      return res.status(200).json({
        engineer,
        projects,
        gfk: {
          clients
        }
      });

    } catch (err) {
      console.error("Error checking user:", err);
      return res.status(500).json({
        message: `Error checking engineer: ${err.message}`,
      });
    }
  });




  app.get('/gfk/xml/:projectid/boring/:boringid', async (req, res) => {

    const gfk = new GFK();
    const graphicLogsHandler = new GraphicLogs();

    const { projectid, boringid } = req.params;

    // ============================================
    // CONFIGURATION
    // ============================================

    // Change to 'pdf' for Apache FOP.
    const BORING_LOG_DEFAULT_FORMAT = 'pdf';

    const BORING_LOG_XSL = path.resolve('xsl/logdraft.xsl');

    const SIEVE_FIELDS = [
      'wgt34',
      'wgt38',
      'wgt4',
      'wgt10',
      'wgt30',
      'wgt40',
      'wgt100',
      'wgt200'
    ];

    // ============================================
    // XML HELPERS
    // ============================================

    const xmlEscape = value => {

      if (value === null || value === undefined) {
        return '';
      }

      return String(value)
        .replace(
          /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,
          ''
        )
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    const measuredNumber = value => {

      if (
        value === null ||
        value === undefined ||
        String(value).trim() === ''
      ) {
        return null;
      }

      const number = Number(value);

      return Number.isFinite(number) ? number : null;
    };

    // ============================================
    // SIEVE ANALYSIS VALIDATION
    // ============================================

    const hasMeasuredSieve = sieve => {

      if (
        !sieve ||
        typeof sieve !== 'object' ||
        Array.isArray(sieve)
      ) {
        return false;
      }

      const values = SIEVE_FIELDS
        .map(field => measuredNumber(sieve[field]))
        .filter(value => value !== null);

      return (
        values.length > 0 &&
        values.every(value => value >= 0) &&
        (
          values.some(value => value > 0) ||
          sieve.isComplete === true
        )
      );
    };

    // ============================================
    // CALCULATE MOISTURE AND DRY DENSITY
    // ============================================

    const calculateSampleMeasurements = sample => {

      const tare = measuredNumber(sample.tarewgt);
      const wetOriginal = measuredNumber(sample.wetwgt);

      const wetSplit = [
        sample.wetwgt_2,
        sample.wet_wgt2,
        sample.wet_wgt_2
      ]
        .map(measuredNumber)
        .find(value => value !== null && value > 0);

      const dryMeasured = measuredNumber(sample.drywgt);
      const diameter = measuredNumber(sample.diameter);
      const sampleLength = measuredNumber(sample.samplelength);

      let moistureRatio = null;
      let dryMassGrams = null;

      const isSplit =
        wetSplit !== undefined && wetSplit > 0;

      if (
        tare !== null &&
        tare >= 0 &&
        dryMeasured !== null &&
        dryMeasured > tare
      ) {

        const netDryMass = dryMeasured - tare;

        if (isSplit) {

          // Split sample moisture measurement.

          if (wetSplit >= dryMeasured) {

            moistureRatio =
              (wetSplit - dryMeasured) / netDryMass;

            // Back-calculate original dry mass.

            if (
              wetOriginal !== null &&
              wetOriginal > tare
            ) {

              dryMassGrams =
                (wetOriginal - tare) /
                (1 + moistureRatio);
            }
          }

        } else {

          dryMassGrams = netDryMass;

          if (
            wetOriginal !== null &&
            wetOriginal >= dryMeasured
          ) {

            moistureRatio =
              (wetOriginal - dryMeasured) /
              netDryMass;
          }
        }
      }

      // ========================================
      // DRY DENSITY (PCF)
      // ========================================

      let drydensity = '';

      if (
        dryMassGrams !== null &&
        dryMassGrams > 0 &&
        diameter !== null &&
        diameter > 0 &&
        sampleLength !== null &&
        sampleLength > 0
      ) {

        const volumeIn3 =
          Math.PI / 4 *
          Math.pow(diameter, 2) *
          sampleLength;

        const pcf =
          (dryMassGrams / 453.59237) *
          (1728 / volumeIn3);

        if (Number.isFinite(pcf) && pcf > 0) {
          drydensity = String(Math.round(pcf));
        }
      }

      // ========================================
      // MOISTURE CONTENT (%)
      // ========================================

      const moisturecontent =
        moistureRatio !== null &&
          Number.isFinite(moistureRatio) &&
          moistureRatio >= 0
          ? (moistureRatio * 100).toFixed(1)
          : '';

      return {
        drydensity,
        moisturecontent
      };
    };

    // ============================================
    // APACHE FOP PDF GENERATOR
    // ============================================

    const runFOPToFile = (xmlFile, xslFile, pdfFile) => {

      return new Promise((resolve, reject) => {

        const fop = spawn('/usr/bin/fop', [
          '-xml', xmlFile,
          '-xsl', xslFile,
          '-pdf', pdfFile
        ], {
          stdio: ['ignore', 'ignore', 'pipe']
        });

        let stderr = '';
        let timedOut = false;

        const timeout = setTimeout(() => {
          timedOut = true;
          fop.kill('SIGKILL');
        }, 60000);

        fop.stderr.on('data', data => {
          stderr = (
            stderr + data.toString()
          ).slice(-8000);
        });

        fop.once('error', error => {
          clearTimeout(timeout);
          reject(error);
        });

        fop.once('close', (code, signal) => {

          clearTimeout(timeout);

          if (code === 0 && !timedOut) {

            resolve();

          } else {

            reject(new Error(
              timedOut
                ? 'FOP timed out'
                : `FOP failed (${signal || code}): ${stderr.trim()}`
            ));
          }
        });
      });
    };

    const safeFilePart = value =>
      String(value === null || value === undefined
        ? 'unknown'
        : value
      ).replace(/[^a-zA-Z0-9._-]/g, '_');

    // ============================================
    // OUTPUT FORMAT
    // ============================================

    const requestedFormat = String(
      req.query.format || BORING_LOG_DEFAULT_FORMAT
    ).toLowerCase();

    const format = requestedFormat === 'fop'
      ? 'pdf'
      : requestedFormat;

    if (!['xml', 'pdf'].includes(format)) {
      return res.status(400).json({
        Error: 'Format must be xml or pdf'
      });
    }

    let tempDir;

    try {

      // ========================================
      // LOAD PROJECT AND BORING
      // ========================================

      const [project, boring] = await Promise.all([
        gfk.getProjectById(projectid),
        gfk.getBoringById(projectid, boringid)
      ]);

      if (!project) {
        return res.status(404).json({
          Error: 'Project not found'
        });
      }

      if (!boring) {
        return res.status(404).json({
          Error: 'Boring not found'
        });
      }

      // Protect this route with session and
      // project/company-level authorization.

      // ========================================
      // LOAD COMPANY GRAPHIC LIBRARY
      // ========================================

      const companyid = String(
        project.companyid || 'gfk'
      );

      const graphicDocument =
        await graphicLogsHandler.loadGraphicLogs(
          companyid
        );

      const companyGraphics =
        graphicDocument &&
          Array.isArray(graphicDocument.graphics)
          ? graphicDocument.graphics
          : [];

      // Map graphicid to its graphic record.
      // This avoids repeated MongoDB queries.

      const graphicByID = new Map(
        companyGraphics.map(graphic => [
          String(graphic.graphicid),
          graphic
        ])
      );

      // Avoid downloading the same image twice.

      const localImageCache = new Map();

      // Public URL used by Oxygen XML Developer.

      const baseURL = String(
        process.env.SERVER_API || ''
      ).replace(/\/+$/, '');

      // ========================================
      // TEMP DIRECTORY FOR APACHE FOP
      // ========================================

      if (format === 'pdf') {

        tempDir = await mkdtemp(
          path.join(tmpdir(), 'gfk-logdraft-')
        );
      }

      // ========================================
      // PREPARE BORING SAMPLES
      // ========================================

      const samples = [];

      for (
        const [index, sample] of
        (boring.samples || []).entries()
      ) {

        const sampleData =
          typeof sample.toObject === 'function'
            ? sample.toObject()
            : sample;

        const graphicid = String(
          sampleData.graphicid || ''
        ).trim();

        let graphiclogPath = '';

        // ====================================
        // RESOLVE GRAPHIC ID
        // ====================================

        if (graphicid) {

          const graphic = graphicByID.get(graphicid);

          if (!graphic) {

            throw new Error(
              `Graphic ID ${graphicid} not found ` +
              `for sample ${sampleData.sampleid}`
            );
          }

          const imageKey = String(
            graphic.graphiclog || ''
          ).trim();

          if (imageKey) {

            // Allow existing and new B2 image keys.

            const validKey =
              /^gfk\/(?:logdraft\/[a-zA-Z0-9._-]+|graphiclogs\/[a-zA-Z0-9_./-]+)\.(jpg|jpeg|png)$/i.test(imageKey) &&
              !imageKey.split('/').includes('..');

            if (!validKey) {
              throw new Error(
                `Invalid graphic B2 key: ${imageKey}`
              );
            }

            // ================================
            // APACHE FOP IMAGE
            // ================================

            if (format === 'pdf') {

              if (localImageCache.has(imageKey)) {

                graphiclogPath =
                  localImageCache.get(imageKey);

              } else {

                const localPath = path.join(
                  tempDir,
                  `graphic-${index}-${path.basename(imageKey)}`
                );

                // Download Backblaze image before
                // invoking Apache FOP.

                await downloadImage(
                  imageKey,
                  localPath
                );

                graphiclogPath =
                  pathToFileURL(localPath).href;

                localImageCache.set(
                  imageKey,
                  graphiclogPath
                );
              }

            } else {

              // ============================
              // OXYGEN XML IMAGE
              // ============================

              if (!baseURL) {
                throw new Error(
                  'SERVER_API is required for Oxygen image URLs'
                );
              }

              graphiclogPath =
                `${baseURL}/gfk/` +
                `${encodeURIComponent(companyid)}/` +
                `graphiclogs/` +
                `${encodeURIComponent(graphicid)}/image`;
            }
          }
        }

        // ====================================
        // CALCULATE LAB MEASUREMENTS
        // ====================================

        const measurements =
          calculateSampleMeasurements(sampleData);

        // ====================================
        // VALIDATE SIEVE ANALYSIS
        // ====================================

        const sieveanalysis =
          hasMeasuredSieve(sampleData.sieve)
            ? (sampleData.sieveanalysis || '')
            : '';

        // ====================================
        // COMBINE SAMPLE INFORMATION
        // ====================================

        samples.push({
          ...sampleData,
          ...measurements,

          graphicid,
          graphiclogPath,
          sieveanalysis
        });
      }

      // ========================================
      // GENERATE XML
      // ========================================

      const x = xmlEscape;

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<log>
    <boring>
        <boringid>${x(boring.boringid)}</boringid>
        <projectid>${x(boring.projectid || projectid)}</projectid>
        <boringnumber>${x(boring.boringnumber)}</boringnumber>
        <datedrilled>${x(boring.datedrilled)}</datedrilled>
        <loggedby>${x(boring.loggedby)}</loggedby>
        <drillrig>${x(boring.drillrig)}</drillrig>
        <elevation>${x(boring.elevation)}</elevation>
        <diameter>${x(boring.diameter)}</diameter>
        <gwdepth>${x(boring.gwdepth)}</gwdepth>
        <latitude>${x(boring.latitude)}</latitude>
        <longitude>${x(boring.longitude)}</longitude>
        <samples>
            ${samples.map(sample => `
            <sample>
                <sampleid>${x(sample.sampleid)}</sampleid>
                <sampleset>${x(sample.sampleset)}</sampleset>
                <samplenumber>${x(sample.samplenumber)}</samplenumber>
                <sampledepth>${x(sample.sampledepth)}</sampledepth>
                <depth>${x(sample.depth)}</depth>
                <diameter>${x(sample.diameter)}</diameter>
                <samplelength>${x(sample.samplelength)}</samplelength>
                <description>${x(sample.description)}</description>
                <uscs>${x(sample.uscs)}</uscs>
                <spt>${x(sample.spt)}</spt>
                <sptlength>${x(sample.sptlength)}</sptlength>

                <graphicid>${x(sample.graphicid)}</graphicid>
                <graphiclog>${x(sample.graphiclogPath)}</graphiclog>
                <imageurl>${x(sample.graphiclogPath)}</imageurl>

                <remarks>${x(sample.remarks)}</remarks>
                <drydensity>${x(sample.drydensity)}</drydensity>
                <moisturecontent>${x(sample.moisturecontent)}</moisturecontent>
                <unconfinedstrength>${x(sample.unconfinedstrength)}</unconfinedstrength>
                <sieveanalysis>${x(sample.sieveanalysis)}</sieveanalysis>
            </sample>`).join('')}
        </samples>
    </boring>
</log>`;

      // ========================================
      // OXYGEN XML DEVELOPER
      // ========================================

      if (format === 'xml') {

        return res.status(200)
          .type('application/xml; charset=utf-8')
          .send(xml);
      }

      // ========================================
      // APACHE FOP PDF
      // ========================================

      const xmlFile = path.join(
        tempDir,
        'boring.xml'
      );

      const pdfFile = path.join(
        tempDir,
        'boring.pdf'
      );

      await writeFile(
        xmlFile,
        xml,
        'utf8'
      );

      await runFOPToFile(
        xmlFile,
        BORING_LOG_XSL,
        pdfFile
      );

      // ========================================
      // STREAM PDF
      // ========================================

      const filename =
        `GFK-Project-${safeFilePart(project.projectnumber)}` +
        `-Boring-${safeFilePart(boring.boringnumber)}.pdf`;

      res.status(200)
        .type('application/pdf')
        .set(
          'Content-Disposition',
          `inline; filename="${filename}"`
        );

      await pipeline(
        createReadStream(pdfFile),
        res
      );

    } catch (err) {

      console.error(
        'GFK boring log generation error:',
        err
      );

      if (!res.headersSent) {

        return res.status(500).json({
          Error: `Server error: ${err.message}`
        });
      }

      if (!res.destroyed) {
        res.destroy(err);
      }

    } finally {

      // ========================================
      // CLEAN UP TEMPORARY PDF FILES
      // ========================================

      if (tempDir) {

        await rm(tempDir, {
          recursive: true,
          force: true
        }).catch(error => {

          console.error(
            'Temporary boring log cleanup error:',
            error
          );
        });
      }
    }
  });



  // Assuming you have a MongoDB `db` instance ready
  // e.g., const db = client.db("yourDb");




  app.get('/gfk/xml/:projectid/reportletter/:reportid', async (req, res) => {

    const OUTPUT_FORMAT = 'pdf'; // Change to 'pdf' for Apache FOP 'xml' for oxygen
    const gfk = new GFK();

    // ============================================
    // HELPERS
    // ============================================

    const list = value => Array.isArray(value) ? value : [];

    const first = (...values) =>
      values.find(v => v !== undefined && v !== null && v !== '') ?? '';

    const escapeXML = value => String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

    const element = (name, value) =>
      `<${name}>${escapeXML(value)}</${name}>`;

    const normalizeType = value =>
      String(value ?? '')
        .toLowerCase()
        .replace(/[\s_-]+/g, '');

    const isCompactionTable = type => [
      'compactiontable',
      'compactiontables',
      'compactiontests',
      'compaction'
    ].includes(type);

    const formatDate = value => {
      if (!value) return '';

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return String(value);
      }

      return new Intl.DateTimeFormat('en-US', {
        timeZone: 'UTC',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }).format(date);
    };

    const numeric = value =>
      value !== undefined &&
        value !== null &&
        value !== '' &&
        Number.isFinite(Number(value))
        ? Number(value)
        : null;

    const money = value =>
      Math.round((value + Number.EPSILON) * 100) / 100;

    // ============================================
    // DYNAMIC OBJECT TO XML
    // Used for compaction curves
    // ============================================

    const objectFieldsXML = value => {

      if (!value || typeof value !== 'object') {
        return '';
      }

      const obj = typeof value.toObject === 'function'
        ? value.toObject()
        : value;

      return Object.entries(obj).map(([name, v]) => {

        if (
          !/^[A-Za-z_][A-Za-z0-9_.-]*$/.test(name) ||
          /^xml/i.test(name) ||
          name === '__v'
        ) {
          return '';
        }

        if (v === undefined || v === null) {
          return element(name, '');
        }

        if (v instanceof Date) {
          return element(name, v.toISOString());
        }

        if (typeof v?.toHexString === 'function') {
          return element(name, v.toHexString());
        }

        if (Array.isArray(v)) {

          return `<${name}>${v.map(item => {

            if (
              item &&
              typeof item === 'object' &&
              !(item instanceof Date) &&
              typeof item.toHexString !== 'function'
            ) {
              return `<item>${objectFieldsXML(item)}</item>`;
            }

            const output = item instanceof Date
              ? item.toISOString()
              : typeof item?.toHexString === 'function'
                ? item.toHexString()
                : item;

            return element('item', output);

          }).join('')}</${name}>`;
        }

        if (typeof v === 'object') {
          return `<${name}>${objectFieldsXML(v)}</${name}>`;
        }

        return element(name, v);

      }).join('');
    };

    // ============================================
    // COMPACTION TEST XML
    // ============================================


    const toNumber = value => {

      if (
        value === undefined ||
        value === null ||
        String(value).trim() === ''
      ) {
        return null;
      }

      const number = Number(value);

      return Number.isFinite(number) ? number : null;
    };

    const formatNumber = (value, decimals = 1) =>
      value === null || !Number.isFinite(value)
        ? ''
        : value.toFixed(decimals);


    // ============================================
    // COMPACTION TEST XML WITH CALCULATIONS
    // ============================================

    const testXML = (test, curvesByID) => {

      // ========================================
      // FIND ASSOCIATED LABORATORY CURVE
      // ========================================

      const curveid = String(test.curveid ?? '').trim();

      const curve = curvesByID.get(curveid);

      // ========================================
      // FIELD MEASUREMENTS
      // ========================================

      const wetpcf = toNumber(test.wetpcf);
      const moistpcf = toNumber(test.moistpcf);

      // ========================================
      // LABORATORY COMPACTION CURVE
      // ========================================

      const maxden = toNumber(
        curve?.maxden ?? curve?.MaxDen
      );

      const optmoist = toNumber(
        curve?.moist ?? curve?.Moist
      );

      // ========================================
      // CALCULATE DRY DENSITY (PCF)
      // ========================================

      const drydensity =
        wetpcf !== null &&
          moistpcf !== null &&
          wetpcf > moistpcf &&
          moistpcf >= 0
          ? wetpcf - moistpcf
          : null;

      // ========================================
      // CALCULATE MOISTURE CONTENT (%)
      // ========================================

      const moisture =
        drydensity !== null &&
          drydensity > 0
          ? (moistpcf / drydensity) * 100
          : null;

      // ========================================
      // CALCULATE RELATIVE COMPACTION (%)
      // ========================================

      const relativecompaction =
        drydensity !== null &&
          maxden !== null &&
          maxden > 0
          ? (drydensity / maxden) * 100
          : null;

      // ========================================
      // RETURN TEST XML
      // ========================================

      return `
        <test>

            ${element('testid', test.testid)}
            ${element('testnumber', test.testnum)}
            ${element('timetest', test.timetest)}
            ${element('testdate', test.timetest)}
            ${element('elevation', test.elevation)}
            ${element('location', test.location)}

            ${element('curveid', curveid)}
            ${element('curvenumber', curve?.curvenumber)}

            <!-- Original Field Measurements -->

            ${element('wetpcf', test.wetpcf)}
            ${element('moistpcf', test.moistpcf)}

            <!-- Calculated Field Values -->

            ${element('drydensity', formatNumber(drydensity))}
            ${element('moisture', formatNumber(moisture))}
            ${element('relativecompaction', formatNumber(relativecompaction))}

            <!-- Laboratory Curve Values -->

            ${element('maxdrydensity', formatNumber(maxden))}
            ${element('optimummoisture', formatNumber(optmoist))}

            <!-- Criteria, if separately provided -->

            ${element('requirement', test.requirement)}
            ${element('result', test.result)}

        </test>
    `;
    };


    // ============================================
    // GENERATE COST ESTIMATE XML
    // One proposal per section
    // ============================================

    const costEstimateXML = proposal => {

      const items = [];

      // Resolve labor line items
      for (const labor of list(proposal.laboritems)) {

        const hours =
          (new Date(labor.timeout) - new Date(labor.timein))
          / 3600000;

        const rate = numeric(labor.laborrate);

        const validHours =
          Number.isFinite(hours) &&
          hours >= 0;

        items.push({
          description: labor.description,
          quantity: validHours ? hours : '',
          unit: 'hr',
          unitprice: rate ?? '',
          amount: validHours && rate !== null
            ? money(hours * rate)
            : ''
        });
      }

      // Resolve cost line items
      for (const cost of list(proposal.costitems)) {

        const quantity = numeric(cost.quantity ?? 1);
        const unitprice = numeric(cost.unitcost);

        items.push({
          description: cost.description,
          quantity: quantity ?? '',
          unit: cost.unit || 'each',
          unitprice: unitprice ?? '',
          amount: quantity !== null && unitprice !== null
            ? money(quantity * unitprice)
            : ''
        });
      }

      const calculatedTotal = items.every(
        item => numeric(item.amount) !== null
      )
        ? money(items.reduce(
          (sum, item) => sum + Number(item.amount), 0
        ))
        : '';

      const total = first(
        proposal.total,
        calculatedTotal
      );

      const itemsXML = items.map((item, index) => `
            <item>
                ${element('itemnumber', index + 1)}
                ${element('description', item.description)}
                ${element('quantity', item.quantity)}
                ${element('unit', item.unit)}
                ${element('unitprice', item.unitprice)}
                ${element('amount', item.amount)}
            </item>
        `).join('');

      return `
            <costestimate>
                ${element('proposalid', proposal.proposalid)}
                ${element('proposalnumber', proposal.proposalnumber)}
                ${element('dateproposal', formatDate(proposal.dateproposal))}
                ${element('status', proposal.status)}

                <items>
                    ${itemsXML}
                </items>

                ${element('total', total)}
            </costestimate>
        `;
    };

    try {

      const { projectid, reportid } = req.params;

      // ============================================
      // LOAD PROJECT
      // ============================================

      const project = await gfk.getProjectById(projectid);

      if (!project) {
        return res.status(404).json({
          Error: 'Project not found.'
        });
      }

      // Apply your existing project-level access
      // authorization here.

      // ============================================
      // LOAD CLIENT AND REPORT
      // ============================================

      const [client, report] = await Promise.all([

        gfk.findClientByID(project.clientid),

        gfk.getReportByID(projectid, reportid)

      ]);

      if (!client) {
        return res.status(404).json({
          Error: 'Client not found.'
        });
      }

      if (!report) {
        return res.status(404).json({
          Error: 'Report not found.'
        });
      }

      // ============================================
      // RECURSIVE SPECIAL SECTION DETECTION
      // ============================================

      const proposalIDs = new Set();
      const tableIDs = new Set();
      const missingReferences = [];

      const scanSections = sections => {

        for (const section of list(sections)) {

          if (!section || typeof section !== 'object') {
            continue;
          }

          const type = normalizeType(section.type);

          const id = String(
            section.referenceid ?? ''
          ).trim();

          if (
            type === 'costestimate' ||
            isCompactionTable(type)
          ) {

            if (!id) {

              missingReferences.push({
                sectionid: section.sectionid,
                type: section.type
              });

            } else if (type === 'costestimate') {

              proposalIDs.add(id);

            } else {

              tableIDs.add(id);
            }
          }

          // Check every nested section
          scanSections(section.subsections);
        }
      };

      scanSections(report.sections);

      if (missingReferences.length) {

        return res.status(422).json({
          Error: 'Special sections require a referenceid.',
          missingReferences
        });
      }

      // ============================================
      // LOAD ONLY REQUIRED DATABASE RECORDS
      // ============================================

      const [
        proposals,
        tables,
        fieldreports,
        compactionCurves
      ] = await Promise.all([

        // Proposals referenced by sections
        Promise.all(
          [...proposalIDs].map(id =>
            gfk.findProposalByID(projectid, id)
          )
        ),

        // Compaction tables referenced by sections
        Promise.all(
          [...tableIDs].map(id =>
            gfk.findCompactionTableByID(projectid, id)
          )
        ),

        // Only load field reports when needed
        tableIDs.size
          ? gfk.loadFieldReports(projectid)
          : Promise.resolve([]),

        // Only load compaction curves when needed
        tableIDs.size
          ? gfk.loadCompactionCurves(projectid)
          : Promise.resolve([])

      ]);

      const curvesByID = new Map();

      for (const curve of Array.isArray(compactionCurves)
        ? compactionCurves
        : []) {

        const curveid = String(
          curve.curveid ?? curve.CurveID ?? ''
        ).trim();

        if (curveid) {
          curvesByID.set(curveid, curve);
        }
      }

      // ============================================
      // CREATE DATA LOOKUP MAPS
      // ============================================

      const proposalMap = new Map(
        proposals
          .filter(Boolean)
          .map(proposal => [
            String(proposal.proposalid),
            proposal
          ])
      );

      const tableMap = new Map(
        tables
          .filter(Boolean)
          .map(table => [
            String(table.tableid),
            table
          ])
      );

      // ============================================
      // VALIDATE REFERENCED RECORDS
      // ============================================

      const missingProposals = [...proposalIDs].filter(
        id => !proposalMap.has(id)
      );

      const missingTables = [...tableIDs].filter(
        id => !tableMap.has(id)
      );

      if (missingProposals.length || missingTables.length) {

        return res.status(422).json({
          Error: 'Referenced proposal or compaction table not found.',
          missingProposals,
          missingTables
        });
      }

      // ============================================
      // INDEX COMPACTION TESTS FROM FIELD REPORTS
      // ============================================

      const testsByID = new Map();

      for (const fieldreport of list(fieldreports)) {

        for (const test of list(fieldreport.compactiontests)) {

          const id = String(first(
            test.testid,
            test.compactiontestid,
            test.id
          )).trim();

          if (id && !testsByID.has(id)) {
            testsByID.set(id, test);
          }
        }
      }

      // ============================================
      // RESOLVE COMPACTION TABLE TESTS
      // ============================================

      const resolvedTableMap = new Map();
      const incompleteTables = [];

      for (const table of tables.filter(Boolean)) {

        const selectedIDs = list(table.compactiontests)
          .map(id => String(id).trim())
          .filter(Boolean);

        const missingTestIDs = selectedIDs.filter(
          id => !testsByID.has(id)
        );

        if (missingTestIDs.length) {

          incompleteTables.push({
            tableid: table.tableid,
            missingTestIDs
          });
        }

        // Preserve the saved order of selected tests
        const tests = selectedIDs
          .filter(id => testsByID.has(id))
          .map(id => testsByID.get(id));

        resolvedTableMap.set(
          String(table.tableid),
          {
            table,
            tests
          }
        );
      }

      if (incompleteTables.length) {

        return res.status(422).json({
          Error: 'Some selected compaction tests were not found in project field reports.',
          incompleteTables
        });
      }

      // ============================================
      // GENERATE COMPACTION TABLE XML
      // One compaction table per section
      // ============================================

      const compactionTableXML = ({ table, tests }) => {

        ;

        const testsXML = tests
          .map(test => testXML(test, curvesByID))
          .join('');


        // ============================================
        // INCLUDE ONLY CURVES USED BY SELECTED TESTS
        // ============================================

        const usedCurveIDs = new Set(
          tests
            .map(test => String(test.curveid ?? '').trim())
            .filter(Boolean)
        );

        const curvesXML = list(compactionCurves)
          .filter(curve =>
            usedCurveIDs.has(
              String(curve.curveid ?? curve.CurveID ?? '').trim()
            )
          )
          .map(curve => `
        <curve>
            ${element('curveid', curve.curveid ?? curve.CurveID)}
            ${element('curvenumber', curve.curvenumber)}
            ${element('description', curve.description)}
            ${element('maxden', curve.maxden)}
            ${element('moist', curve.moist)}
        </curve>
    `)
          .join('');


        return `
                <compactiontable>

                    ${element('tableid', table.tableid)}

                    ${element('tabletitle', table.tabletitle)}

                    <compactiontests>
                        ${testsXML}
                    </compactiontests>

                    <compactioncurves>
                        ${curvesXML}
                    </compactioncurves>

                </compactiontable>
            `;
      };

      // ============================================
      // RECURSIVE SECTION XML
      // EMBED SPECIAL DATA INTO EACH SECTION
      // ============================================

      const sectionXML = section => {

        const type = normalizeType(section.type);

        const referenceid = String(
          section.referenceid ?? ''
        ).trim();

        let specialXML = '';

        switch (type) {

          case 'costestimate': {

            const proposal = proposalMap.get(referenceid);

            specialXML = costEstimateXML(proposal);

            break;
          }

          case 'compactiontable':
          case 'compactiontables':
          case 'compactiontests':
          case 'compaction': {

            const table = resolvedTableMap.get(referenceid);

            specialXML = compactionTableXML(table);

            break;
          }

          default:
            break;
        }

        return `
                <section>

                    ${element('sectionid', section.sectionid)}

                    ${element('section', first(
          section.section,
          section.title
        ))}

                    ${element('type', section.type)}

                    ${element('content', section.content)}

                    ${element('referenceid', section.referenceid)}

                    ${specialXML}

                    <subsections>
                        ${list(section.subsections).map(sectionXML).join('')}
                    </subsections>

                </section>
            `;
      };

      // ============================================
      // CLIENT INFORMATION
      // ============================================

      const clientName = first(
        client.companyname,
        client.clientname,
        `${client.firstname ?? ''} ${client.lastname ?? ''}`.trim(),
        client.name,
        client.company
      );

      // ============================================
      // COMPANY LOGO
      // ============================================

      const logoURI = OUTPUT_FORMAT === 'pdf'
        ? (process.env.GFK_LOGO_FILE_URI || '')
        : (process.env.GFK_LOGO_PUBLIC_URL || '');

      // ============================================
      // GENERATE REPORT XML
      // ============================================

      const xml = `<?xml version="1.0" encoding="UTF-8"?>

<report>

    ${element('reportid', first(report.reportid, reportid))}

    ${element('projectid', projectid)}

    ${element('reporttitle', report.reporttitle)}

    ${element('datereport', formatDate(report.datereport))}

    ${element('projectnumber', project.projectnumber)}

    ${element('projecttitle', first(
        project.projecttitle,
        project.title
      ))}

    ${element('projectaddress', first(
        project.projectaddress,
        project.address
      ))}

    ${element('projectcity', first(
        project.projectcity,
        project.city
      ))}

    ${element('client', clientName)}

    ${element('clientaddress', first(
        client.address,
        client.streetaddress
      ))}

    ${element('clientcity',
        [client.city, client.state].filter(Boolean).join(', ') +
        (client.zip ? ' ' + client.zip : '')
      )}

    ${element('attention', report.attention)}

    ${element('companylogo', logoURI)}

    ${element('companyinfo',
        process.env.GFK_COMPANY_INFO || ''
      )}

    <sections>
        ${list(report.sections).map(sectionXML).join('')}
    </sections>

</report>`;

      // ============================================
      // OXYGEN XML MODE
      // ============================================

      if (OUTPUT_FORMAT === 'xml') {

        res.set(
          'Content-Type',
          'application/xml; charset=utf-8'
        );

        return res.status(200).send(xml);
      }

      // ============================================
      // APACHE FOP PDF MODE
      // ============================================

      const xslPath = path.join(
        process.cwd(),
        'xsl',
        'reportletter.xsl'
      );

      return streamFOP(
        xml,
        xslPath,
        res,
        `GFK-Letter-${reportid}.pdf`,
        'pdf'
      );

    } catch (err) {

      console.error(
        'Could not retrieve report letter:',
        err
      );

      if (!res.headersSent) {

        return res.status(500).json({
          Error: 'Could not retrieve report letter.'
        });
      }
    }
  });





  app.get('/gfk/xml/:projectid/report/:reportid', async (req, res) => {

    const gfk = new GFK();
    const sdcHandler = new SDC();
    const figureHandler = new Figures();
    const graphicLogsHandler = new GraphicLogs();

    // ============================================
    // OUTPUT MODE
    // ============================================

    const DEFAULT_OUTPUT_MODE = 'pdf';

    // 'xml' = Oxygen XML Developer
    // 'pdf' = Apache FOP
    // Also supports ?format=xml or ?format=pdf

    const outputMode = String(
      req.query.format || DEFAULT_OUTPUT_MODE
    ).toLowerCase();

    const isFOP = outputMode === 'pdf';

    let tempDir = null;
    let cleanupStarted = false;

    const cleanup = async () => {

      if (!tempDir || cleanupStarted) return;

      cleanupStarted = true;

      try {
        await rm(tempDir, {
          recursive: true,
          force: true
        });
      } catch (error) {
        console.error('Temporary image cleanup error:', error);
      }
    };

    try {

      const { projectid, reportid } = req.params;

      if (!['xml', 'pdf'].includes(outputMode)) {
        return res.status(400).json({
          Error: 'format must be xml or pdf'
        });
      }

      const publicBaseUrl = String(
        process.env.GFK_PUBLIC_BASE_URL ||
        `${req.protocol}://${req.get('host')}`
      ).replace(/\/+$/, '');

      // ============================================
      // LOAD PROJECT
      // ============================================

      const project = await gfk.getProjectById(projectid);

      if (!project) {
        return res.status(404).json({
          Error: 'Project not found.'
        });
      }

      const companyid = String(project.companyid || 'gfk');

      // Add session/project authorization middleware
      // if it is not already applied to this route.

      // ============================================
      // LOAD REPORT DATA
      // ============================================

      const [
        report,
        loadedBorings,
        loadedFigures,
        getclient,
        sdc,
        graphicDocument
      ] = await Promise.all([
        gfk.getReportByID(projectid, reportid),
        gfk.loadBorings(projectid),
        figureHandler.loadProjectFigures(projectid),
        gfk.findClientByID(project.clientid),
        sdcHandler.loadSeismicDesignCriteria(projectid),
        graphicLogsHandler.loadGraphicLogs(companyid)
      ]);

      if (!report) {
        return res.status(404).json({
          Error: 'Report not found.'
        });
      }

      if (!getclient) {
        return res.status(404).json({
          Error: 'Client not found.'
        });
      }

      const rawBorings = Array.isArray(loadedBorings)
        ? loadedBorings
        : [];

      const figures = Array.isArray(loadedFigures)
        ? loadedFigures
        : [];

      //
      // COMPANY GRAPHIC LOG LIBRARY
      //

      const companyGraphics = Array.isArray(graphicDocument?.graphics)
        ? graphicDocument.graphics
        : [];

      // Build lookup by graphicid.
      // This avoids individual database queries for samples.

      const graphicByID = new Map(
        companyGraphics.map(graphic => [
          String(graphic.graphicid),
          graphic
        ])
      );

      const client = [
        getclient.prefix,
        getclient.firstname,
        getclient.lastname
      ].filter(Boolean).join(' ');

      // ============================================
      // CALCULATE LABORATORY SUMMARY
      // ============================================

      // Calculate results using the borings already loaded.
      // No additional boring database queries required.

      const labsummary = await gfk.calculateLabSummary(
        project,
        rawBorings
      );

      // ============================================
      // LAB RESULT HELPERS
      // ============================================

      const asObject = value =>
        value && typeof value.toObject === 'function'
          ? value.toObject()
          : value;

      const labValue = value =>
        value === null || value === undefined
          ? ''
          : value;

      const rowKey = (boringid, sampleid) =>
        `${String(boringid)}\u0000${String(sampleid)}`;

      // Create a lookup for calculated sample results.

      const labRows = new Map();

      for (
        const row of (
          Array.isArray(labsummary?.samples)
            ? labsummary.samples
            : []
        )
      ) {

        if (
          row?.boringid != null &&
          row?.sampleid != null
        ) {

          labRows.set(
            rowKey(row.boringid, row.sampleid),
            row
          );

        }
      }

      // ============================================
      // VALIDATE SIEVE ANALYSIS
      // ============================================

      const sieveFields = [
        'wgt34',
        'wgt38',
        'wgt4',
        'wgt10',
        'wgt30',
        'wgt40',
        'wgt100',
        'wgt200'
      ];

      const hasSieveMeasurements = sieve => {

        if (
          !sieve ||
          typeof sieve !== 'object' ||
          Array.isArray(sieve)
        ) {
          return false;
        }

        const numbers = sieveFields
          .map(field => sieve[field])
          .filter(value =>
            value !== null &&
            value !== undefined &&
            String(value).trim() !== ''
          )
          .map(Number);

        return (
          numbers.length > 0 &&
          numbers.every(value =>
            Number.isFinite(value) && value >= 0
          ) &&
          (
            numbers.some(value => value > 0) ||
            sieve.isComplete === true
          )
        );
      };

      // ============================================
      // VALIDATE UNCONFINED TEST
      // ============================================

      const hasUnconfinedTest = unconfined => {

        if (Array.isArray(unconfined)) {
          return unconfined.length > 0;
        }

        return Boolean(
          unconfined &&
          typeof unconfined === 'object' &&
          Object.keys(unconfined).length > 0
        );
      };

      // ============================================
      // ENRICH BORINGS WITH LABORATORY RESULTS
      // ============================================

      // This becomes the master boring/sample dataset.
      // Both the boring logs and laboratory summary
      // will use these same calculated sample properties.

      const borings = rawBorings.map(sourceBoring => {

        const boring = asObject(sourceBoring);

        return {
          ...boring,

          samples: (
            Array.isArray(boring.samples)
              ? boring.samples
              : []
          ).map(sourceSample => {

            const sample = asObject(sourceSample);

            const result = labRows.get(
              rowKey(boring.boringid, sample.sampleid)
            );

            // Dry density (pcf)
            const dryden = labValue(result?.dryden);

            // Moisture content (%)
            const moist = labValue(result?.moist);

            // Atterberg limits
            const ll = labValue(
              result?.ll ??
              (
                Number(sample.ll) > 0
                  ? sample.ll
                  : ''
              )
            );

            const pi = labValue(
              result?.pi ??
              (
                Number(sample.pi) > 0
                  ? sample.pi
                  : ''
              )
            );

            // Unconfined compression results
            const validUnconfined =
              hasUnconfinedTest(sample.unconfined);

            const un = validUnconfined
              ? labValue(result?.un)
              : '';

            const strain = validUnconfined
              ? labValue(result?.strain)
              : '';

            // Sieve analysis text
            const validSieve =
              hasSieveMeasurements(sample.sieve);

            const sieveanalysis = validSieve
              ? labValue(result?.sieve)
              : '';

            const sampleno = labValue(
              result?.sampleno ??
              `${boring.boringnumber}-${sample.sampleset ?? ''}(${sample.samplenumber ?? ''})`
            );

            return {

              // Preserve original sample properties
              ...sample,

              boringid: boring.boringid,
              sampleno,

              // Laboratory summary properties
              dryden,
              moist,
              ll,
              pi,
              un,
              strain,

              // Boring log properties
              drydensity: dryden,
              moisturecontent: moist,
              unconfinedstrength: un,
              maxstress: un,
              maxstrain: strain,
              sieveanalysis

              // The original sample.sieve object
              // and sample.unconfined data are preserved.
            };

          })
        };
      });

      // ============================================
      // XML HELPERS
      // ============================================

      const escapeXML = value => {

        return String(value ?? '')
          .replace(
            /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,
            ''
          )
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;');
      };

      const tag = (name, value) =>
        `<${name}>${escapeXML(value)}</${name}>`;

      const reportDate = report.datereport
        ? formatDateReport(report.datereport)
        : '';

      // ============================================
      // APACHE FOP TEMPORARY IMAGES
      // ============================================

      const localImages = new Map();
      let imageCount = 0;

      if (isFOP) {

        tempDir = await mkdtemp(
          path.join(tmpdir(), 'gfk-report-')
        );
      }

      const getLocalImageUrl = async key => {

        if (!key) return '';

        // Avoid duplicate downloads
        if (localImages.has(key)) {
          return localImages.get(key);
        }

        if (/^(?:https?:\/\/|file:\/\/|\/)/i.test(key)) {
          throw new Error(
            `Expected Backblaze image key: ${key}`
          );
        }

        const image = await getImage(key);

        if (!image?.Body) {
          throw new Error(
            `Backblaze image not found: ${key}`
          );
        }

        const allowedExtensions = new Set([
          '.jpg',
          '.jpeg',
          '.png',
          '.gif',
          '.svg',
          '.tif',
          '.tiff'
        ]);

        const keyExtension =
          path.extname(key).toLowerCase();

        const extension =
          allowedExtensions.has(keyExtension)
            ? keyExtension
            : '.jpg';

        const destination = path.join(
          tempDir,
          `image-${++imageCount}${extension}`
        );

        const body = image.Body;

        const source =
          typeof body.pipe === 'function'
            ? body
            : Readable.fromWeb(
              typeof body.transformToWebStream === 'function'
                ? body.transformToWebStream()
                : body
            );

        await pipeline(
          source,
          createWriteStream(destination)
        );

        const fileUrl =
          pathToFileURL(destination).href;

        localImages.set(key, fileUrl);

        return fileUrl;
      };

      // ============================================
      // IMAGE URL RESOLVER
      // ============================================

      const resolveImageUrl = async (key, httpUrl) => {

        if (!key) return '';

        // Oxygen Developer uses public HTTP URLs.
        if (!isFOP) {
          return httpUrl;
        }

        // Apache FOP uses local file:/// URLs.
        return await getLocalImageUrl(key);
      };

      // ============================================
      // RECURSIVE REPORT SECTIONS
      // ============================================

      const buildSectionXML = section => {

        const type = String(
          section.type ?? ''
        ).trim().toLowerCase();

        const referenceid =
          section.referenceid || (
            type === 'figure'
              ? section.figureid
              : type === 'boringlog'
                ? section.boringid
                : ''
          );

        let xml = '<section>';

        xml += tag('sectionid', section.sectionid);
        xml += tag('title', section.section);
        xml += tag('type', section.type);
        xml += tag('content', section.content);
        xml += tag('referenceid', referenceid);

        xml += '<subsections>';

        for (const subsection of section.subsections || []) {
          xml += buildSectionXML(subsection);
        }

        xml += '</subsections>';
        xml += '</section>';

        return xml;
      };

      // ============================================
      // BORING XML
      // ============================================


      const buildBoringXML = async boring => {

        let xml = '<boring>';

        // ============================================
        // BORING INFORMATION
        // ============================================

        const boringFields = [
          'boringid',
          'boringnumber',
          'datedrilled',
          'loggedby',
          'drillrig',
          'elevation',
          'diameter',
          'gwdepth',
          'latitude',
          'longitude'
        ];

        for (const field of boringFields) {
          xml += tag(field, boring[field]);
        }

        xml += '<samples>';

        // ============================================
        // BORING SAMPLES
        // ============================================

        for (const sample of boring.samples || []) {

          // Samples only store graphicid.
          const graphicid = String(
            sample.graphicid || ''
          ).trim();

          let imageKey = '';
          let imageUrl = '';

          // ========================================
          // RESOLVE GRAPHIC ID
          // ========================================

          if (graphicid) {

            const graphic = graphicByID.get(graphicid);

            if (!graphic) {
              throw new Error(
                `Graphic ${graphicid} not found in company ${companyid}` +
                ` (boring ${boring.boringid}, sample ${sample.sampleid})`
              );
            }

            // Retrieve the B2 key from GraphicLogs.
            imageKey = String(
              graphic.graphiclog || ''
            ).trim();

            if (imageKey) {

              // Support old and new B2 storage folders.
              const validKey =
                /^gfk\/(?:logdraft\/[A-Za-z0-9._-]+|graphiclogs\/[A-Za-z0-9_./-]+)\.(?:jpg|jpeg|png)$/i.test(imageKey) &&
                !imageKey.split('/').includes('..') &&
                !imageKey.includes('//');

              if (!validKey) {
                throw new Error(
                  `Invalid graphic B2 image key: ${imageKey}`
                );
              }

              // ====================================
              // OXYGEN IMAGE URL
              // ====================================

              const httpUrl =
                `${publicBaseUrl}/gfk/` +
                `${encodeURIComponent(companyid)}/` +
                `graphiclogs/` +
                `${encodeURIComponent(graphicid)}/image`;

              // ====================================
              // RESOLVE IMAGE FOR OUTPUT MODE
              // ====================================

              // Oxygen returns the HTTP URL.
              // FOP downloads the Backblaze image
              // and returns a local file:/// URL.

              imageUrl = await resolveImageUrl(
                imageKey,
                httpUrl
              );
            }
          }

          // ========================================
          // BUILD SAMPLE XML
          // ========================================

          xml += '<sample>';

          const sampleFields = [
            'sampleid',
            'boringid',
            'samplenumber',
            'sampleset',
            'sampleno',
            'sampledepth',
            'depth',
            'diameter',
            'samplelength',
            'description',
            'uscs',
            'spt',
            'sptlength',
            'remarks',

            // Original laboratory measurements
            'wetwgt',
            'wetwgt_2',
            'drywgt',
            'tarewgt',
            'tareno',

            // Calculated laboratory results
            'dryden',
            'moist',
            'll',
            'pi',
            'un',
            'strain',
            'drydensity',
            'moisturecontent',
            'unconfinedstrength',
            'maxstress',
            'maxstrain',
            'sieveanalysis'
          ];

          for (const field of sampleFields) {
            xml += tag(field, sample[field]);
          }

          // ========================================
          // GRAPHIC LOG PROPERTIES
          // ========================================

          xml += tag('graphicid', graphicid);

          // Existing XSL compatibility.
          // Both fields contain the resolved URL.
          xml += tag('graphiclog', imageUrl);
          xml += tag('imageurl', imageUrl);

          // Original Backblaze key for reference only.
          xml += tag('graphiclogkey', imageKey);

          // Laboratory summary compatibility.
          xml += tag('sieve', sample.sieveanalysis);

          xml += '</sample>';
        }

        xml += '</samples>';
        xml += '</boring>';

        return xml;
      };


      // ============================================
      // FIGURE XML
      // ============================================

      const buildFigureXML = async figure => {

        const key = figure.figureurl || '';

        const httpUrl =
          `${publicBaseUrl}/gfk/` +
          `${encodeURIComponent(projectid)}/figures/` +
          `${encodeURIComponent(figure.figureid)}/image`;

        const imageUrl = await resolveImageUrl(
          key,
          httpUrl
        );

        let xml = '<figure>';

        xml += tag('figureid', figure.figureid);
        xml += tag('figuretitle', figure.figuretitle);
        xml += tag('figureurl', figure.figureurl);
        xml += tag('figurecaption', figure.figurecaption);

        xml += tag(
          'orientation',
          figure.orientation || 'portrait'
        );

        xml += tag('imageurl', imageUrl);

        xml += '</figure>';

        return xml;
      };



      // ============================================
      // SEISMIC DESIGN CRITERIA XML
      // ============================================

      const buildSDCXML = criteria => {

        let xml = '<sdc>';

        const fields = new Set([
          'SS',
          'S1',
          'SiteClass',
          'FA',
          'FV',
          'SMS',
          'SM1',
          'SDS',
          'SD1',
          ...Object.keys(criteria ?? {})
        ]);

        for (const field of fields) {

          if (
            !/^[A-Za-z_][A-Za-z0-9_.-]*$/.test(field) ||
            /^xml/i.test(field)
          ) {
            continue;
          }

          const value = criteria?.[field];

          xml += tag(
            field,
            value instanceof Date
              ? value.toISOString()
              : value
          );
        }

        xml += '</sdc>';

        return xml;
      };

      // ============================================
      // BUILD COMPLETE REPORT XML
      // ============================================

      let xml = '<?xml version="1.0" encoding="UTF-8"?>';

      xml += '<report>';

      // Project and report information

      xml += tag('reportid', report.reportid);
      xml += tag('projectid', projectid);
      xml += tag('projectnumber', project.projectnumber);
      xml += tag('projectaddress', project.projectaddress);
      xml += tag('projectcity', project.projectcity);
      xml += tag('projecttitle', project.title);
      xml += tag('reporttitle', report.reporttitle);
      xml += tag('client', client);
      xml += tag('type', report.type);
      xml += tag('datereport', reportDate);
      xml += tag('author', report.author);

      // Seismic design criteria

      xml += buildSDCXML(sdc);

      // Recursive report sections

      xml += '<sections>';

      for (const section of report.sections || []) {
        xml += buildSectionXML(section);
      }

      xml += '</sections>';

      // ============================================
      // BORINGS WITH CALCULATED LABORATORY DATA
      // ============================================

      xml += '<borings>';

      for (const boring of borings) {
        xml += await buildBoringXML(boring);
      }

      xml += '</borings>';

      // ============================================
      // FIGURES
      // ============================================

      xml += '<figures>';

      for (const figure of figures) {
        xml += await buildFigureXML(figure);
      }

      xml += '</figures>';

      // ============================================
      // LAB SUMMARY
      // ============================================



      xml += '</report>';

      // ============================================
      // OXYGEN XML DEVELOPER
      // ============================================

      if (!isFOP) {

        return res.status(200)
          .type('application/xml; charset=utf-8')
          .send(xml);
      }

      // ============================================
      // APACHE FOP PDF GENERATION
      // ============================================

      res.once('finish', () => {
        void cleanup();
      });

      res.once('close', () => {
        void cleanup();
      });

      const filename =
        `GFK-Report-${String(
          project.projectnumber ?? 'unknown'
        ).replace(/[^a-zA-Z0-9._-]/g, '_')}.pdf`;

      return streamFOP(
        xml,
        'xsl/gfkreport.xsl',
        res,
        filename,
        'pdf'
      );

    } catch (error) {

      console.error(
        'GFK report generation error:',
        error
      );

      await cleanup();

      if (!res.headersSent) {

        return res.status(500).json({
          Error: `Could not generate report: ${error.message}`
        });
      }

      res.destroy(error);
    }

  });







  app.get('/gfk/xml/:projectid/labsummary', async (req, res) => {

    // ============================================
    // OUTPUT MODE
    // ============================================

    const outputMode = 'pdf'; // Oxygen Developer
    // Change 'xml' to 'pdf' for Apache FOP

    try {

      const gfk = new GFK();
      const unconfinedcalcs = new UnconfinedCalcs();

      const { projectid } = req.params;

      // ============================================
      // LOAD PROJECT AND BORINGS
      // ============================================

      const [project, borings] = await Promise.all([
        gfk.getProjectById(projectid),
        gfk.loadBorings(projectid)
      ]);

      if (!project) {
        return res.status(404).json({
          message: 'Project not found'
        });
      }

      // ============================================
      // XML HELPERS
      // ============================================

      const escapeXML = (value) => {
        return String(value ?? '')
          .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;');
      };

      const xmlTag = (name, value) => {
        return `<${name}>${escapeXML(value)}</${name}>`;
      };

      // Avoid printing NaN or Infinity in XML.
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

      // ============================================
      // REPORT INFORMATION
      // ============================================

      const reportDate = new Date().toLocaleDateString(
        'en-US',
        {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: 'America/Los_Angeles'
        }
      );

      let xml = '<?xml version="1.0" encoding="UTF-8"?>';

      xml += '<labsummary>';

      xml += xmlTag('projectid', projectid);
      xml += xmlTag('projectnumber', project.projectnumber);
      xml += xmlTag('reporttitle', 'Laboratory Test Summary');
      xml += xmlTag('title', project.title);
      xml += xmlTag('projecttitle', project.title);
      xml += xmlTag('projectaddress', project.projectaddress);
      xml += xmlTag('projectcity', project.projectcity);
      xml += xmlTag('datereport', reportDate);

      // ============================================
      // PROCESS BORINGS AND SAMPLES
      // ============================================

      if (Array.isArray(borings)) {

        for (const boring of borings) {

          if (!Array.isArray(boring.samples)) {
            continue;
          }

          for (const sample of boring.samples) {

            // --------------------------------
            // SAMPLE NUMBER AND DEPTH
            // --------------------------------

            const sampleno =
              `${boring.boringnumber ?? ''}-` +
              `${sample.sampleset ?? ''}` +
              `(${sample.samplenumber ?? ''})`;

            const depth = sample.depth;

            // --------------------------------
            // DRY DENSITY
            // --------------------------------

            const dryden = calcdryden(
              sample.wetwgt_2,
              sample.wetwgt,
              sample.tarewgt,
              sample.drywgt,
              sample.diameter,
              sample.samplelength
            );

            // --------------------------------
            // MOISTURE CONTENT
            // --------------------------------

            const moistureResult = calcmoist(
              sample.drywgt,
              sample.tarewgt,
              sample.wetwgt,
              sample.wetwgt_2
            );

            const moist = validNumber(
              Number(moistureResult) * 100,
              1
            );

            // --------------------------------
            // ATTERBERG LIMITS
            // --------------------------------

            const ll = Number(sample.ll) > 0
              ? Number(sample.ll)
              : '';

            const pi = Number(sample.pi) > 0
              ? Number(sample.pi)
              : '';

            // --------------------------------
            // UNCONFINED COMPRESSION
            // --------------------------------

            const calculatedStress =
              unconfinedcalcs.getMaxStress(sample);

            const calculatedStrain =
              unconfinedcalcs.getMaxStrain(sample);

            const maxstress =
              Number(calculatedStress) > 0
                ? calculatedStress
                : '';

            const maxstrain =
              Number(calculatedStrain) > 0
                ? calculatedStrain
                : '';

            // --------------------------------
            // SIEVE ANALYSIS
            // --------------------------------

            let sieveresult = '';

            const sieve = sample.sieve;

            if (sieve) {

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

              const gravelfrac = Number(SC.getGravFrac());
              const sandfrac = Number(SC.getSandFrac());
              const fines = Number(SC.getFines());

              const sieveParts = [];

              if (Number.isFinite(gravelfrac) && gravelfrac > 0) {
                sieveParts.push(`Gravel ${gravelfrac}%`);
              }

              if (Number.isFinite(sandfrac) && sandfrac > 0) {
                sieveParts.push(`Sand ${sandfrac}%`);
              }

              if (Number.isFinite(fines) && fines > 0) {
                sieveParts.push(`Fines ${fines}%`);
              }

              sieveresult = sieveParts.join(', ');
            }

            // --------------------------------
            // BUILD SAMPLE XML
            // --------------------------------

            xml += '<sample>';

            xml += xmlTag('sampleno', sampleno);
            xml += xmlTag('depth', depth);
            xml += xmlTag('dryden', validNumber(dryden));
            xml += xmlTag('moist', moist);
            xml += xmlTag('ll', ll);
            xml += xmlTag('pi', pi);
            xml += xmlTag('un', validNumber(maxstress));
            xml += xmlTag('strain', validNumber(maxstrain));
            xml += xmlTag('sieve', sieveresult);

            xml += '</sample>';
          }
        }
      }

      xml += '</labsummary>';

      // ============================================
      // OXYGEN XML DEVELOPER - DEFAULT
      // ============================================

      if (outputMode === 'xml') {

        return res.status(200)
          .type('application/xml; charset=utf-8')
          .send(xml);
      }

      // ============================================
      // APACHE FOP - INTERNAL PDF
      // ============================================

      if (outputMode === 'pdf') {

        const filename =
          `labsummary-${project.projectnumber}.pdf`;

        return streamFOP(
          xml,
          'xsl/labsummary.xsl',
          res,
          filename,
          'pdf'
        );
      }

      return res.status(400).json({
        message: `Invalid output mode: ${outputMode}`
      });

    } catch (err) {

      console.error('Lab Summary XML Error:', err);

      if (!res.headersSent) {
        return res.status(500).json({
          message: `Could not load lab summary: ${err.message}`
        });
      }

      res.destroy(err);
    }
  });


  app.get("/gfk/xml/:projectid/proposal/:proposalid", async (req, res) => {

    try {

      const gfk = new GFK();
      const { projectid, proposalid } = req.params;

      const project = await gfk.getProjectById(projectid);

      if (!project) {
        return res.status(404).send({
          Error: "Project Not Found"
        });
      }

      const client = await gfk.findClientByID(project.clientid);

      if (!client) {
        return res.status(404).send({
          Error: "Client Not Found"
        });
      }


      const proposal = await gfk.getProposal(projectid, proposalid);

      if (!proposal) {
        return res.status(404).send({
          Error: "Proposal Not Found"
        });
      }


      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<proposal>

<Client>
    <ClientID>${escapeXml(client.clientid)}</ClientID>
    <Company>${escapeXml(client.company)}</Company>
    <Contact>${escapeXml(client.firstname)} ${escapeXml(client.lastname)}</Contact>
    <Email>${escapeXml(client.emailaddress)}</Email>
    <Phone>${escapeXml(client.phonenumber)}</Phone>
    <Address>${escapeXml(client.address)}</Address>
    <City>${escapeXml(client.city)}</City>
    <State>${escapeXml(client.contactstate)}</State>
    <Zip>${escapeXml(client.zipcode)}</Zip>
</Client>

<Project>
    <ProjectID>${escapeXml(project.projectid)}</ProjectID>
    <Title>${escapeXml(project.title)}</Title>
    <Description>${escapeXml(project.sow)}</Description>
    <address>${escapeXml(project.projectaddress)}</address>
    <city>${escapeXml(project.projectcity)}</city>
    <projectnumber>${escapeXml(project.projectnumber)}</projectnumber>
</Project>


<Proposal>
    <ProposalID>${escapeXml(proposal.proposalid)}</ProposalID>
    <ProposalDate>${formatDate(proposal.dateproposal)}</ProposalDate>
    <status>${escapeXml(proposal.status || "")}</status>
    <version>${escapeXml(proposal.version || "")}</version>
    <dateapproved>${formatDateTime(proposal.dateapproved) || ""}</dateapproved>
    <expirationdate>${formatDate(proposal.expirationdate) || ""}</expirationdate>
    <approvedby>${escapeXml(proposal.approvedby) || ""}</approvedby>
    <comments>${escapeXml(proposal.comments) || ""}</comments>
    <totalAmount>${proposal.totalAmount}</totalAmount>
    <proposalnumber>${escapeXml(proposal.proposalnumber)}</proposalnumber>

    <Items>`;


      proposal.items.forEach(item => {

        if (item.type === "labor") {

          const hours =
            (new Date(item.timeout) -
              new Date(item.timein)) /
            (1000 * 60 * 60);

          xml += `
        <Labor>
            <LaborID>${escapeXml(item.laborid)}</LaborID>
            <EngineerID>${escapeXml(item.engineerid)}</EngineerID>
            <Date>${formatDate(item.timein)}</Date>
            <TimeIn>${item.timein}</TimeIn>
            <TimeOut>${item.timeout}</TimeOut>
            <Description>${escapeXml(item.description)}</Description>
            <Hours>${hours.toFixed(2)}</Hours>
            <Rate>${item.laborrate}</Rate>
            <Total>${calculateLaborCost(item.timein, item.timeout, item.laborrate).toFixed(2)}</Total>
        </Labor>`;

        } else if (item.type === "cost") {

          xml += `
        <Cost>
            <CostID>${escapeXml(item.costid)}</CostID>
            <Date>${formatDate(item.datein)}</Date>
            <Description>${escapeXml(item.description)}</Description>
            <Quantity>${item.quantity}</Quantity>
            <Unit>${escapeXml(item.unit)}</Unit>
            <UnitCost>${item.unitcost}</UnitCost>
            <Total>${calculateCost(item.quantity, item.unitcost).toFixed(2)}</Total>
        </Cost>`;
        }

      });


      xml += `
    </Items>

</Proposal>

</proposal>`

      streamFOP(xml, 'xsl/proposal.xsl', res, `proposal-${proposalid}.pdf`, 'pdf');




    } catch (err) {

      console.error(err);

      return res.status(500).send({
        Error: `Could not load proposal. ${err.message}`
      });

    }


  })

  app.get("/gfk/xml/:projectid/invoice/:invoiceid", async (req, res) => {



    try {

      const gfk = new GFK();
      const { projectid, invoiceid } = req.params;

      const project = await gfk.getProjectById(projectid);

      if (!project) {
        return res.status(404).send({
          Error: "Project Not Found"
        });
      }

      const client = await gfk.findClientByID(project.clientid);

      if (!client) {
        return res.status(404).send({
          Error: "Client Not Found"
        });
      }

      const invoice = await gfk.getInvoice(projectid, invoiceid);

      if (!invoice) {
        return res.status(404).send({
          Error: "Invoice Not Found"
        });
      }


      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<invoice>

<Client>
    <ClientID>${escapeXml(client.clientid)}</ClientID>
    <Company>${escapeXml(client.company)}</Company>
    <Contact>${escapeXml(client.firstname)} ${escapeXml(client.lastname)}</Contact>
    <Email>${escapeXml(client.emailaddress)}</Email>
    <Phone>${escapeXml(client.phonenumber)}</Phone>
    <Address>${escapeXml(client.address)}</Address>
    <City>${escapeXml(client.city)}</City>
    <State>${escapeXml(client.contactstate)}</State>
    <Zip>${escapeXml(client.zipcode)}</Zip>
</Client>

<Project>
    <ProjectID>${escapeXml(project.projectid)}</ProjectID>
    <Title>${escapeXml(project.title)}</Title>
    <Description>${escapeXml(project.sow)}</Description>
    <address>${escapeXml(project.projectaddress)}</address>
    <city>${escapeXml(project.projectcity)}</city>
    <projectnumber>${escapeXml(project.projectnumber)}</projectnumber>
</Project>

<Invoice>
    <InvoiceID>${escapeXml(invoice.invoiceid)}</InvoiceID>
    <InvoiceDate>${formatDate(invoice.dateinvoice)}</InvoiceDate>
    <PaymentStatus>${escapeXml(invoice.paymentstatus || "")}</PaymentStatus>
    <TransactionID>${escapeXml(invoice.transactionid || "")}</TransactionID>
    <DatePaid>${formatDate(invoice.datepaid) || ""}</DatePaid>
    <invoicetotal>${invoice.invoiceTotal}</invoicetotal>

    <Items>`;


      invoice.items.forEach(item => {

        if (item.type === "labor") {

          const hours =
            (new Date(item.timeout) -
              new Date(item.timein)) /
            (1000 * 60 * 60);

          xml += `
        <Labor>
            <LaborID>${escapeXml(item.laborid)}</LaborID>
            <EngineerID>${escapeXml(item.engineerid)}</EngineerID>
            <Date>${formatDate(item.timein)}</Date>
            <TimeIn>${item.timein}</TimeIn>
            <TimeOut>${item.timeout}</TimeOut>
            <Description>${escapeXml(item.description)}</Description>
            <Hours>${hours.toFixed(2)}</Hours>
            <Rate>${item.laborrate}</Rate>
            <Total>${calculateLaborCost(item.timein, item.timeout, item.laborrate).toFixed(2)}</Total>
        </Labor>`;

        } else if (item.type === "cost") {

          xml += `
        <Cost>
            <CostID>${escapeXml(item.costid)}</CostID>
            <Date>${formatDate(item.datein)}</Date>
            <Description>${escapeXml(item.description)}</Description>
            <Quantity>${item.quantity}</Quantity>
            <Unit>${escapeXml(item.unit)}</Unit>
            <UnitCost>${item.unitcost}</UnitCost>
            <Total>${calculateCost(item.quantity, item.unitcost).toFixed(2)}</Total>
        </Cost>`;
        }

      });


      xml += `
    </Items>

</Invoice>

</invoice>`;


      streamFOP(xml, 'xsl/invoice.xsl', res, `invoice-${invoiceid}.pdf`, 'pdf');


    } catch (err) {

      console.error(err);

      return res.status(500).send({
        Error: `Could not load invoice. ${err.message}`
      });

    }

  });

  app.get('/gfk/xml/:projectid/fieldreport/:fieldid', async (req, res) => {
    try {

      const gfk = new GFK();
      const { projectid, fieldid } = req.params;

      const [project, report] = await Promise.all([
        gfk.getProjectById(projectid),
        gfk.findFieldReportByID(projectid, fieldid)
      ]);

      let xml = `<fieldreport>`;

      // ---- PROJECT INFO ----
      if (project) {
        const { projectnumber, title, projectaddress, projectcity } = project;
        xml += `
        <projectnumber>${projectnumber}</projectnumber>
        <title>${title}</title>
        <address>${projectaddress}</address>
        <city>${projectcity}</city>`;
      }

      // ---- FIELD REPORT ----
      if (report && Array.isArray(report.fieldreports)) {

        const fieldreport = report.fieldreports[0];
        const { content } = fieldreport;

        const formattedDate = new Date(fieldreport.datereport).toLocaleDateString(
          "en-US",
          { month: "2-digit", day: "2-digit", year: "numeric" }
        );

        xml += `
        <datereport>${formattedDate}</datereport>
        <content>${content}</content>`;

        // ---- COMPACTION CURVES ----
        if (Array.isArray(fieldreport.compactiontests)) {

          if (fieldreport.compactiontests.length > 0) {

            const curves = await gfk.loadCompactionCurves(projectid);

            if (Array.isArray(curves)) {
              xml += `<curves>`;

              curves.forEach(c => {
                xml += `
              <curve>
                <curvenumber>${c.curvenumber}</curvenumber>
                <description>${c.description}</description>
                <maxden>${c.maxden}</maxden>
                <moist>${c.moist}</moist>
              </curve>`;
              });

              xml += `</curves>`;
            }

            // ---- TESTS ----
            xml += `<tests>`;

            const compactiontests = fieldreport.compactiontests.sort(
              (a, b) => Number(a.testnum) - Number(b.testnum)
            );

            compactiontests.forEach(test => {
              const {
                testnum,
                elevation,
                location,
                wetpcf,
                moistpcf,
                timetest,
                curveid
              } = test;

              const curve = curves.find(c => c.curveid === curveid) || {};

              const dryden = wetpcf && moistpcf
                ? (wetpcf - moistpcf).toFixed(1)
                : 0;

              const moist = wetpcf && moistpcf
                ? ((moistpcf / (wetpcf - moistpcf)) * 100).toFixed(1)
                : 0;

              const maxden = curve.maxden ? Number(curve.maxden) : 0;

              const relative =
                curve.maxden && wetpcf && moistpcf
                  ? Math.round(((wetpcf - moistpcf) / curve.maxden) * 100)
                  : 0;

              const curvenumber = curve.curvenumber || "";

              xml += `
            <test>
              <testno>${testnum}</testno>
              <elevation>${elevation}</elevation>
              <location>${location}</location>
              <wetpcf>${wetpcf}</wetpcf>
              <moistpcf>${moistpcf}</moistpcf>
              <dryden>${dryden}</dryden>
              <moist>${moist}</moist>
              <maxden>${maxden}</maxden>
              <relative>${relative}</relative>
              <curvenumber>${curvenumber}</curvenumber>
            </test>`;
            });

            xml += `</tests>`;

          }
        }

        // ---- IMAGES ----
        if (Array.isArray(fieldreport.images)) {
          if (fieldreport.images.length > 0) {
            const isProduction = process.env.NODE_ENV === "production";

            const serverAPI = isProduction
              ? "https://masterserver.civilengineer.io"   // production API
              : "http://192.168.1.6:3002";                    // local/dev API

            xml += `<images>`;
            fieldreport.images.forEach(img => {
              xml += `
            <image>
              <url>${serverAPI}${img.image}</url>
              <caption>${img.caption}</caption>
            </image>`;
            });
            xml += `</images>`;
          }

        }
      }

      xml += `</fieldreport>`;
      streamFOP(xml, 'xsl/fieldreport.xsl', res, `fieldreport-${fieldid}.pdf`, 'pdf');

    } catch (err) {
      res.send({ Error: `Could not load field report ${err}` });
    }
  });




  app.get('/api/xml/:companyid', async (req, res) => {
    try {
      const gfk = new GFK();

      const companyid = req.params.companyid;

      // 1️⃣ Fetch the record from MongoDB
      const safeProjects = JSON.parse(JSON.stringify(await gfk.loadProjects(companyid)))

      if (!safeProjects) return res.status(404).send("Record not found");

      // 2️⃣ Convert the record to XML
      const xml = create({ projects: { project: safeProjects } })
        .end({ prettyPrint: true })

      res.setHeader("Content-Type", "application/xml");
      res.send(xml);


      // streamFOP(xml, 'xsl/project.xsl', res, 'gfkprojects.rtf','rtf');



    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  });









}