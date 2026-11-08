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
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import SDC from '../classes/sdc.js';
import Figures from '../classes/figures.js';
import { GetObjectCommand } from '@aws-sdk/client-s3';




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

        try {
            const { projectid, figureid } = req.params;

            const gfk = new GFK();
            const figureHandler = new Figures();

            // Load project and figures
            const [project, figures] = await Promise.all([
                gfk.getProjectById(projectid),
                figureHandler.loadProjectFigures(projectid)
            ]);

            if (!project) {
                return res.status(404).json({
                    Error: 'Project not found'
                });
            }

            // Verify that the authenticated user
            // is authorized to access this project.

            const figure = figures.find(
                f => f.figureid === figureid
            );

            if (!figure) {
                return res.status(404).json({
                    Error: 'Figure not found'
                });
            }

            // XML escaping
            const escapeXML = value => {
                return String(value ?? '')
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&apos;');
            };

            // Image retrieval URL for preview purposes
            const baseURL = (
                process.env.GFK_API_PUBLIC_URL ||
                `${req.protocol}://${req.get('host')}`
            ).replace(/\/$/, '');

            const imageURL = figure.figureurl
                ? `${baseURL}/gfk/${encodeURIComponent(projectid)}/figures/${encodeURIComponent(figureid)}/image`
                : '';

            // Configure this to your actual company logo URI
            const logoURL =
                process.env.GFK_REPORT_LOGO_URI || '';

            const orientation =
                figure.orientation === 'landscape'
                    ? 'landscape'
                    : 'portrait';

            // Build figure XML
            const xml = `<?xml version="1.0" encoding="UTF-8"?>
<figure>
    <projectid>${escapeXML(projectid)}</projectid>
    <projecttitle>${escapeXML(project.title)}</projecttitle>
    <projectaddress>${escapeXML(project.projectaddress)}</projectaddress>
    <projectcity>${escapeXML(project.projectcity)}</projectcity>
    <projectnumber>${escapeXML(project.projectnumber)}</projectnumber>

    <figureid>${escapeXML(figure.figureid)}</figureid>
    <figuretitle>${escapeXML(figure.figuretitle)}</figuretitle>
    <figurecaption>${escapeXML(figure.figurecaption)}</figurecaption>
    <orientation>${escapeXML(orientation)}</orientation>

    <figureurl>${escapeXML(figure.figureurl)}</figureurl>
    <imageurl>${escapeXML(imageURL)}</imageurl>
    <logourl>${escapeXML(logoURL)}</logourl>
</figure>`;

            res.setHeader(
                'Content-Type',
                'application/xml; charset=utf-8'
            );

            res.setHeader(
                'Cache-Control',
                'no-store'
            );

            return res.status(200).send(xml);

        } catch (err) {

            console.error('Error generating figure XML:', err);

            return res.status(500).json({
                Error: `Could not generate figure XML: ${err.message}`
            });
        }
    }
);

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


  app.get('/gfk/graphiclog/:projectid/:boringid/:sampleid',

    async (req, res) => {
      try {

        const { projectid, boringid, sampleid } = req.params;


        const gfk = new GFK();
        const borings = await gfk.loadBorings(projectid);

        const boring = borings?.find(
          b => b.boringid === boringid
        );

        const sample = boring?.samples?.find(
          s => s.sampleid === sampleid
        );

        if (!sample?.graphiclog) {
          return res.status(404).json({
            message: 'Graphic log not found'
          });
        }

        // Also verify that the authenticated user
        // is authorized to view this project.

        const key = sample.graphiclog;

        if (!key.startsWith('gfk/logdraft/')) {
          return res.status(400).json({
            message: 'Invalid B2 image key'
          });
        }

        const image = await getImage(key);

        res.setHeader(
          'Content-Type',
          image.ContentType || 'image/jpeg'
        );

        res.setHeader('Cache-Control', 'private, max-age=300');

        Readable.fromWeb(image.Body.transformToWebStream())
          .on('error', err => {
            console.error('Image stream error:', err);
            res.destroy(err);
          })
          .pipe(res);

      } catch (err) {
        console.error('Graphic log error:', err);

        if (!res.headersSent) {
          res.status(500).json({
            message: 'Unable to retrieve image'
          });
        }
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


  app.post('/gfk/uploadgraphiclog',
    checkSessionGFK,
    uploadFileImage.single('graphiclog'),
    async (req, res) => {
      try {
        const { projectid, boringid, sampleid } = req.body;

        if (!req.file) {
          return res.status(400).json({
            success: false,
            message: 'No image uploaded'
          });
        }

        if (!projectid || !boringid || !sampleid) {
          return res.status(400).json({
            success: false,
            message: 'Missing projectid, boringid or sampleid'
          });
        }

        const gfk = new GFK();
        const borings = await gfk.loadBorings(projectid);

        if (!borings) {
          return res.status(404).json({
            success: false,
            message: 'Borings not found'
          });
        }

        const boringIndex = borings.findIndex(
          b => b.boringid === boringid
        );

        if (boringIndex === -1) {
          return res.status(404).json({
            success: false,
            message: 'Boring not found'
          });
        }

        const boring = borings[boringIndex];

        const sampleIndex = boring.samples.findIndex(
          s => s.sampleid === sampleid
        );

        if (sampleIndex === -1) {
          return res.status(404).json({
            success: false,
            message: 'Sample not found'
          });
        }

        // Verify the session user can modify this project.
        // checkSessionGFK authenticates the user, but project
        // authorization should also be enforced here.

        const extension = req.file.mimetype === 'image/png'
          ? '.png'
          : '.jpg';

        const filename = `${Date.now()}-${randomUUID()}${extension}`;

        const fileKey = `gfk/logdraft/${filename}`;

        // Upload image to Backblaze B2
        await uploadImage(
          fileKey,
          req.file.buffer,
          req.file.mimetype
        );

        // Save B2 object key in MongoDB
        borings[boringIndex]
          .samples[sampleIndex]
          .graphiclog = fileKey;

        const myBorings = { projectid, borings };

        const updatedBorings = await gfk.saveBorings(myBorings);

        const timestamp = new Date().toLocaleString(
          'en-US',
          { timeZone: 'America/Los_Angeles' }
        );

        return res.status(200).json({
          success: true,
          count: updatedBorings?.length || borings.length,
          borings: updatedBorings || borings,
          message: `Borings Saved Successfully - ${timestamp}`,
          graphiclog: fileKey
        });

      } catch (err) {
        console.error('Error uploading graphic log:', err);

        return res.status(500).json({
          success: false,
          message: 'Error: Could not upload graphic log'
        });
      }
    }
  );
  ;


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
        figures
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
        figureHandler.loadProjectFigures(projectid)
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
        figures: figures ?? []
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
    const { projectid, boringid } = req.params;

    let tempDir;

    try {
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

      // Streaming FOP Downloads to internal temporary directory replaces samplepath with dir

      // Create a unique temporary directory for this PDF
      // tempDir = await mkdtemp(
      //   path.join(tmpdir(), 'gfk-logdraft-')
      // );

      // Download graphic log images from Backblaze B2
      // const samples = await Promise.all(
      //   (boring.samples || []).map(async (sample) => {

      //     const sampleData =
      //       typeof sample.toObject === 'function'
      //         ? sample.toObject()
      //         : sample;

      //     if (!sampleData.graphiclog) {
      //       return {
      //         ...sampleData,
      //         graphiclogPath: ''
      //       };
      //     }

      //     const key = sampleData.graphiclog;

      //     if (!/^gfk\/logdraft\/[a-zA-Z0-9._-]+\.(jpg|jpeg|png)$/i.test(key)) {
      //       throw new Error(`Invalid graphic log key: ${key}`);
      //     }

      //     const localPath = path.join(
      //       tempDir,
      //       path.basename(key)
      //     );

      //     await downloadImage(key, localPath);

      //     return {
      //       ...sampleData,
      //       graphiclogPath: pathToFileURL(localPath).href
      //     };
      //   })
      // );




      // OXYGEN Developer assembles URI fromBase URL accessible from Oxygen
      const baseURL = process.env.SERVER_API

      // Generate image URLs instead of downloading files
      const samples = (boring.samples || []).map(sample => {

        const sampleData =
          typeof sample.toObject === 'function'
            ? sample.toObject()
            : sample;

        let graphiclogPath = '';

        if (sampleData.graphiclog) {

          const key = sampleData.graphiclog;

          if (!/^gfk\/logdraft\/[a-zA-Z0-9._-]+\.(jpg|jpeg|png)$/i.test(key)) {
            throw new Error(`Invalid graphic log key: ${key}`);
          }

          graphiclogPath =
            `${baseURL}/gfk/graphiclog/` +
            `${encodeURIComponent(projectid)}/` +
            `${encodeURIComponent(boringid)}/` +
            `${encodeURIComponent(sampleData.sampleid)}`;
        }

        return {
          ...sampleData,
          graphiclogPath
        };

      });




      // Escape values before inserting them into XML
      const escapeXML = (value) => {
        if (value === null || value === undefined) return '';

        return String(value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;');
      };

      const x = (value) => escapeXML(value);

      // Build XML document
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
                <graphiclog>${x(sample.graphiclogPath)}</graphiclog>
                <remarks>${x(sample.remarks)}</remarks>
                <drydensity>${x(sample.drydensity)}</drydensity>
                <moisturecontent>${x(sample.moisturecontent)}</moisturecontent>
                <unconfinedstrength>${x(sample.unconfinedstrength)}</unconfinedstrength>
                <sieveanalysis>${x(sample.sieveanalysis)}</sieveanalysis>
            </sample>`).join('')}
        </samples>
    </boring>
</log>`;

      // streaming FOP

      // const format = 'pdf';

      // const filename =
      //   `GFK-Project-${project.projectnumber}` +
      //   `-Boring-${boring.boringnumber}.${format}`;

      //  streamFOP must return a Promise that resolves
      //  only after FOP finishes using the image files.

      // await streamFOP(
      //   xml,
      //   'xsl/logdraft.xsl',
      //   res,
      //   filename,
      //   format
      // );


      // Testing API Oxygen XML

      res.set('Content-Type', 'application/xml; charset=utf-8');
      return res.status(200).send(xml);

    } catch (err) {
      console.error('GFK XML generation error:', err);

      if (!res.headersSent) {
        return res.status(500).json({
          Error: `Server error: ${err.message}`
        });
      }

      res.destroy(err);

    } finally {

      if (tempDir) {
        await rm(tempDir, {
          recursive: true,
          force: true
        });
      }
    }
  });



  // Assuming you have a MongoDB `db` instance ready
  // e.g., const db = client.db("yourDb");

 


app.get('/gfk/xml/:projectid/report/:reportid', async (req, res) => {

    const gfk = new GFK();
    const figureHandler = new Figures();

    // ============================================
    // OUTPUT MODE
    // ============================================

    const outputMode = 'xml'; // Oxygen Developer
    // Change 'xml' to 'pdf' for Apache FOP

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
            console.error(
                'Temporary image cleanup error:',
                error
            );
        }
    };

    try {

        const { projectid, reportid } = req.params;

        if (!['xml', 'pdf'].includes(outputMode)) {
            return res.status(400).json({
                Error: `Invalid output mode: ${outputMode}`
            });
        }

        const isFOP = outputMode === 'pdf';

        // HTTP base URL accessible from Oxygen Developer.
        const publicBaseUrl = (
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

        // Apply session and project-level authorization
        // before exposing this route in production.

        // ============================================
        // LOAD RELATED DATA
        // ============================================

        const [
            report,
            loadedBorings,
            loadedFigures,
            getclient
        ] = await Promise.all([
            gfk.getReportByID(projectid, reportid),
            gfk.loadBorings(projectid),
            figureHandler.loadProjectFigures(projectid),
            gfk.findClientByID(project.clientid)
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

        const borings = Array.isArray(loadedBorings)
            ? loadedBorings
            : [];

        const figures = Array.isArray(loadedFigures)
            ? loadedFigures
            : [];

        const client = [
            getclient.prefix,
            getclient.firstname,
            getclient.lastname
        ].filter(Boolean).join(' ');

        // ============================================
        // CALCULATE LABORATORY SUMMARY
        // ============================================

        // Reuse the borings already loaded above.
        // No additional database queries.

        const labsummary = gfk.calculateLabSummary(
            project,
            borings
        );

        // ============================================
        // XML HELPERS
        // ============================================

        const escapeXML = (value) => {

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

        const tag = (name, value) => {
            return `<${name}>${escapeXML(value)}</${name}>`;
        };

        const reportDate = report.datereport
            ? formatDateReport(report.datereport)
            : '';

        // ============================================
        // TEMPORARY IMAGES FOR APACHE FOP
        // ============================================

        const localImages = new Map();
        let imageCount = 0;

        if (isFOP) {

            tempDir = await mkdtemp(
                path.join(tmpdir(), 'gfk-report-')
            );
        }

        const getLocalImageUrl = async (key) => {

            if (!key) return '';

            // Avoid downloading the same image twice.
            if (localImages.has(key)) {
                return localImages.get(key);
            }

            if (/^(?:https?:\/\/|file:\/\/|\/)/i.test(key)) {
                throw new Error(
                    `Expected a Backblaze storage key: ${key}`
                );
            }

            // Retrieve private image from Backblaze B2.
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

            // Complete the download before FOP starts.
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

            // Oxygen uses HTTP image URLs.
            if (!isFOP) {
                return httpUrl;
            }

            // Apache FOP uses file:/// URLs.
            return await getLocalImageUrl(key);
        };

        // ============================================
        // RECURSIVE REPORT SECTIONS
        // ============================================

        const buildSectionXML = (section) => {

            const sectionType = String(
                section.type ?? ''
            ).trim().toLowerCase();

            // Reference the correct figure or boring.
            const referenceid =
                section.referenceid || (
                    sectionType === 'figure'
                        ? section.figureid
                        : sectionType === 'boringlog'
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
        // BUILD BORING XML
        // ============================================

        const buildBoringXML = async (boring) => {

            let xml = '<boring>';

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

            for (const sample of boring.samples || []) {

                const key = sample.graphiclog || '';

                const httpUrl =
                    `${publicBaseUrl}/gfk/graphiclog/` +
                    `${encodeURIComponent(projectid)}/` +
                    `${encodeURIComponent(boring.boringid)}/` +
                    `${encodeURIComponent(sample.sampleid)}`;

                const imageUrl = await resolveImageUrl(
                    key,
                    httpUrl
                );

                xml += '<sample>';

                const sampleFields = [
                    'sampleid',
                    'samplenumber',
                    'sampleset',
                    'depth',
                    'description',
                    'spt',
                    'uscs',
                    'graphiclog'
                ];

                for (const field of sampleFields) {
                    xml += tag(field, sample[field]);
                }

                // HTTP URL for Oxygen,
                // local file URL for Apache FOP.
                xml += tag('imageurl', imageUrl);

                xml += '</sample>';
            }

            xml += '</samples>';
            xml += '</boring>';

            return xml;
        };

        // ============================================
        // BUILD FIGURE XML
        // ============================================

        const buildFigureXML = async (figure) => {

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
        // BUILD LAB SUMMARY XML
        // ============================================

        const buildLabSummaryXML = (summary) => {

            let xml = '<labsummary>';

            // ------------------------------------
            // PROJECT INFORMATION
            // ------------------------------------

            xml += tag(
                'projectid',
                summary?.projectid ?? projectid
            );

            xml += tag(
                'projectnumber',
                summary?.projectnumber ??
                    project.projectnumber
            );

            xml += tag(
                'reporttitle',
                summary?.reporttitle ??
                    'SUMMARY OF LABORATORY TEST RESULTS'
            );

            xml += tag(
                'title',
                summary?.title ?? project.title
            );

            xml += tag(
                'projecttitle',
                summary?.projecttitle ?? project.title
            );

            xml += tag(
                'projectaddress',
                summary?.projectaddress ??
                    project.projectaddress
            );

            xml += tag(
                'projectcity',
                summary?.projectcity ?? project.projectcity
            );

            xml += tag('datereport', reportDate);

            // ------------------------------------
            // LABORATORY TEST RESULTS
            // ------------------------------------

            const samples = Array.isArray(summary?.samples)
                ? summary.samples
                : [];

            const sampleFields = [
                'boringid',
                'sampleid',
                'sampleno',
                'depth',
                'dryden',
                'moist',
                'll',
                'pi',
                'un',
                'strain',
                'sieve'
            ];

            for (const sample of samples) {

                xml += '<sample>';

                for (const field of sampleFields) {
                    xml += tag(field, sample[field]);
                }

                xml += '</sample>';
            }

            xml += '</labsummary>';

            return xml;
        };

        // ============================================
        // BUILD COMPLETE REPORT XML
        // ============================================

        let xml = '<?xml version="1.0" encoding="UTF-8"?>';

        xml += '<report>';

        // ------------------------------------
        // REPORT / PROJECT INFORMATION
        // ------------------------------------

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

        // ------------------------------------
        // REPORT SECTIONS
        // ------------------------------------

        xml += '<sections>';

        for (const section of report.sections || []) {
            xml += buildSectionXML(section);
        }

        xml += '</sections>';

        // ------------------------------------
        // PROJECT BORINGS
        // ------------------------------------

        xml += '<borings>';

        for (const boring of borings) {
            xml += await buildBoringXML(boring);
        }

        xml += '</borings>';

        // ------------------------------------
        // PROJECT FIGURES
        // ------------------------------------

        xml += '<figures>';

        for (const figure of figures) {
            xml += await buildFigureXML(figure);
        }

        xml += '</figures>';

        // ------------------------------------
        // LABORATORY SUMMARY
        // ------------------------------------

        // Uses existing loaded borings.
        // No additional MongoDB query.

        xml += buildLabSummaryXML(labsummary);

        // ------------------------------------
        // CLOSE REPORT
        // ------------------------------------

        xml += '</report>';

        // ============================================
        // OXYGEN XML DEVELOPER (DEFAULT)
        // ============================================

        if (!isFOP) {

            return res.status(200)
                .type('application/xml; charset=utf-8')
                .send(xml);
        }

        // ============================================
        // APACHE FOP (INTERNAL PDF)
        // ============================================

        // Keep temporary images until the response
        // finishes. streamFOP should expose its FOP
        // child-process completion for robust cleanup
        // if the client disconnects early.

        res.once('finish', () => {
            void cleanup();
        });

        res.once('close', () => {
            void cleanup();
        });

        const filename =
            `GFK-Report-${project.projectnumber}.pdf`;

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

    const outputMode = 'xml'; // Oxygen Developer
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