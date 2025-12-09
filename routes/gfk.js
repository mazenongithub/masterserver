import GFK from '../classes/gfk.js';
import mysql from 'mysql2/promise'
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { checkSessionGFK } from '../middleware/checkgfk.js'
import { spawn } from 'child_process';
import { create } from 'xmlbuilder2';
import { streamFOP } from '../xsl/fopHelper.js';
import { calcdryden, calcmoist } from '../functions/gfkfunctions.js';
import UnconfinedCalcs from '../classes/unconfinedcalcs.js';
import SoilClassification from '../classes/soilclassification.js';
import { CheckUser } from '../../gfk/src/components/actions/api.js';
import { isArray } from 'util';

export default (app) => {

  const pool = mysql.createPool({
    host: 'localhost',
    user: 'mazen',
    password: 'Iforgot1!',
    database: 'GFK_TABLES',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0

  });

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
  const uploadLogDraft = multer({ storage: createStorage('uploads/gfk/logdraft') });

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


  app.post('/gfk/uploadgraphiclog', checkSessionGFK, uploadLogDraft.single('graphiclog'), async (req, res) => {
    try {
      const { projectid, boringid, sampleid } = req.body;
      const fileUrl = `/uploads/gfk/logdraft/${req.file.filename}`;

      const gfk = new GFK();
      const borings = await gfk.loadBorings(projectid);

      if (!borings) {
        return res.status(404).json({ success: false, message: "Borings not found" });
      }

      // ✔ Find boring index safely
      const boringIndex = borings.findIndex(b => b.boringid === boringid);
      if (boringIndex === -1) {
        return res.status(404).json({ success: false, message: "Boring not found" });
      }

      const boring = borings[boringIndex];

      // ✔ Find sample index safely
      const sampleIndex = boring.samples.findIndex(s => s.sampleid === sampleid);
      if (sampleIndex === -1) {
        return res.status(404).json({ success: false, message: "Sample not found" });
      }

      // ✔ Update the graphic log
      borings[boringIndex].samples[sampleIndex].graphiclog = fileUrl;

      // ✔ Save updated borings
      const myBorings = { projectid, borings }
      const updatedBorings = await gfk.saveBorings(myBorings);

      const timestamp = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });

      return res.status(200).json({
        success: true,
        count: updatedBorings?.length || borings.length,
        borings: updatedBorings || borings,
        message: `Borings Saved Successfully - ${timestamp}`,
        graphiclog: fileUrl,
      });

    } catch (err) {
      console.error("❌ Error uploading graphic log:", err);

      return res.status(500).json({
        success: false,
        message: "Error: Could not upload graphic log",
        error: err.message,
      });
    }
  });
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
      console.log(projectid, fieldreports)
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

      console.log(projectid, slope);

      // Validate input
      if (!projectid || !slope || typeof slope !== "object") {
        return res.status(400).json({
          success: false,
          message: "Invalid request: 'projectid' and 'slope' (object) are required.",
        });
      }



      // Save slope data
      const savedSlope = await gfk.saveSlope(slope);
      console.log(savedSlope)

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











  app.get("/gfk/:projectid/loadproject", checkSessionGFK, async (req, res) => {
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
      const [borings = [], fieldreports = [], compactioncurves = [], seismic = [], ptslab = [], slope = [], timesheet = []] = await Promise.all([
        gfk.loadBorings(projectid).catch(() => []),
        gfk.loadFieldReports(projectid).catch(() => []),
        gfk.loadCompactionCurves(projectid).catch(() => []),
        gfk.loadSeismic(projectid).catch(() => []),
        gfk.loadPTSlab(projectid).catch(() => []),
        gfk.loadSlope(projectid).catch(() => []),
        gfk.loadTimesheet(projectid).catch(() => [])

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
        hasData: borings.length > 0 || fieldreports.length > 0,
        message:
          borings.length === 0 && fieldreports.length === 0
            ? "No borings or field reports found for this project."
            : undefined,
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

  app.post('/:gfk/users/clientlogin', async (req, res) => {
    try {
      const gfk = new GFK();
      const engineerInfo = { ...req.body };

      const result = await gfk.clientLogin(engineerInfo);

      // If login failed, return the message
      if (!result.engineer) {
        return res.status(400).json({ message: result.message || 'Login failed' });
      }

      // Save session
      req.session.engineerId = result.engineer._id;
      await req.session.save();

      // Only load projects for a valid engineer
      const [clients, projects] = await Promise.all([
        gfk.findClients(),
        gfk.loadProjects("gfk")
      ])

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
        message: `Error: could not log in engineer - ${err.message}`,
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

  app.get("/gfk/loadzonecharts", async (req, res) => {
    try {
      const queries = {
        zone_1: "SELECT PI, LL, Gamma FROM ZoneOne",
        zone_2: "SELECT PI, LL, Gamma FROM ZoneTwo",
        zone_3: "SELECT PI, LL, Gamma FROM ZoneThree",
        zone_4: "SELECT PI, LL, Gamma FROM ZoneFour",
        zone_5: "SELECT PI, LL, Gamma FROM ZoneFive",
        zone_6: "SELECT PI, LL, Gamma FROM ZoneSix"
      };

      // Run all queries in parallel
      const results = await Promise.all(
        Object.values(queries).map(q => pool.query(q))
      );

      // Map results back to keys
      const zonecharts = Object.keys(queries).reduce((acc, key, index) => {
        acc[key] = results[index][0]; // [rows] from pool.query
        return acc;
      }, {});

      return res.json({ zonecharts });

    } catch (err) {
      console.error("Error loading zone charts:", err);
      return res.status(500).json({ error: "Could not load charts." });
    }
  });



  // Assuming you have a MongoDB `db` instance ready
  // e.g., const db = client.db("yourDb");

  app.get('/gfk/xml/:projectid/labsummary', checkSessionGFK, async (req, res) => {
    try {
      const gfk = new GFK();
      const unconfinedcalcs = new UnconfinedCalcs();
      const { projectid } = req.params;

      // Load project & borings in parallel
      const [project, borings] = await Promise.all([
        gfk.getProjectById(projectid),
        gfk.loadBorings(projectid)
      ]);

      if (!project) {
        return res.status(404).send({ message: "Project not found" });
      }

      let xml = `
      <labsummary>
        <projectnumber>${project.projectnumber}</projectnumber>
        <title>${project.title}</title>
        <projectaddress>${project.projectaddress}</projectaddress>
        <projectcity>${project.projectcity}</projectcity>
    `;

      if (Array.isArray(borings)) {
        // Process all borings in parallel
        const boringXML = await Promise.all(
          borings.map(async (boring) => {
            if (!Array.isArray(boring.samples)) return "";

            // Process all samples inside each boring in parallel
            const sampleXML = await Promise.all(
              boring.samples.map(async (sample) => {
                const sampleno = `${boring.boringnumber}-${sample.sampleset}(${sample.samplenumber})`;
                const depth = sample.depth;

                const dryden = calcdryden(
                  sample.wetwgt_2,
                  sample.wetwgt,
                  sample.tarewgt,
                  sample.drywgt,
                  sample.diameter,
                  sample.samplelength
                );

                const moist = Number(
                  calcmoist(sample.drywgt, sample.tarewgt, sample.wetwgt, sample.wetwgt_2) * 100
                ).toFixed(1);

                const ll = Number(sample.ll) > 0 ? Number(sample.ll) : "";
                const pi = Number(sample.pi) > 0 ? Number(sample.pi) : "";

                const maxstress = Number(unconfinedcalcs.getMaxStress(sample)) > 0
                  ? unconfinedcalcs.getMaxStress(sample)
                  : "";

                const maxstrain = Number(unconfinedcalcs.getMaxStrain(sample)) > 0
                  ? unconfinedcalcs.getMaxStrain(sample)
                  : "";


                // --- SIEVE ---
                let sieveresult = "";
                const sieve = sample.sieve;

                if (sieve) {
                  const netwgt = Number(sample.drywgt) - Number(sample.tarewgt);
                  const SC = new SoilClassification(
                    netwgt, ll, pi,
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

                  if (gravelfrac > 0) sieveresult += `Gravel ${gravelfrac}%, `;
                  if (sandfrac > 0) sieveresult += `Sand ${sandfrac}%, `;
                  if (fines > 0) sieveresult += `Fines ${fines}%`;

                  sieveresult = sieveresult.trim().replace(/,$/, "");
                }

                return `
                <sample>
                  <sampleno>${sampleno}</sampleno>
                  <depth>${depth}</depth>
                  <dryden>${dryden}</dryden>
                  <moist>${moist}</moist>
                  <ll>${ll}</ll>
                  <pi>${pi}</pi>
                  <un>${maxstress}</un>
                  <strain>${maxstrain}</strain>
                  <sieve>${sieveresult}</sieve>
                </sample>`;
              })
            );

            return sampleXML.join("");
          })
        );

        xml += boringXML.join("");
      }

      xml += "</labsummary>";

      streamFOP(xml, 'xsl/labsummary.xsl', res, `labsummary-${project.projectnumber}.pdf`, 'pdf');

    } catch (err) {
      console.error(err);
      res.send({ message: `Error: Could not load summary ${err}` });
    }
  });

  app.get('/gfk/xml/:projectid/fieldreport/:fieldid', checkSessionGFK, async (req, res) => {
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