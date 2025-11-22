import GFK from '../classes/gfk.js';
import mysql from 'mysql2/promise'
import multer from 'multer';
import path from 'path';
import fs from 'fs';


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

  app.post('/gfk/upload/fieldimage', uploadFieldImage.single('image'), (req, res) => {
    const url = `http://localhost:5000/uploads/gfk/fieldimages/${req.file.filename}`;
    res.json({ url });
  });

 app.post('/gfk/uploadgraphiclog', uploadLogDraft.single('graphiclog'), async (req, res) => {
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
        const myBorings = {projectid, borings}
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


  app.get("/gfk/loadprojects", async (req, res) => {
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

  app.post("/gfk/saveprojects", async (req, res) => {
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


  app.post('/:gfk/saveborings', async (req, res) => {
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

  app.post('/:gfk/savefieldreports', async (req, res) => {
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


  app.post('/gfk/saveseismic', async (req, res) => {
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


  app.post('/gfk/saveptslab', async (req, res) => {
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


  app.post('/gfk/saveslope', async (req, res) => {
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




  app.get("/gfk/:projectid/loadproject", async (req, res) => {
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
      const [borings = [], fieldreports = [], compactioncurves = [], seismic = [], ptslab = [], slope = []] = await Promise.all([
        gfk.loadBorings(projectid).catch(() => []),
        gfk.loadFieldReports(projectid).catch(() => []),
        gfk.loadCompactionCurves(projectid).catch(() => []),
        gfk.loadSeismic(projectid).catch(() => []),
        gfk.loadPTSlab(projectid).catch(() => []),
        gfk.loadSlope(projectid).catch(() => [])

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
      const projects = await gfk.loadProjects("gfk");

      return res.status(200).json({
        engineer: result.engineer,
        projects,
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

      // Now safe to load projects
      const projects = await gfk.loadProjects("gfk");

      return res.status(200).json({
        engineer,
        projects,
      });

    } catch (err) {
      console.error("Error checking user:", err);
      return res.status(500).json({
        message: `Error checking engineer: ${err.message}`,
      });
    }
  });








}