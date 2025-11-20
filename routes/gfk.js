import GFK from '../classes/gfk.js';
import mysql from 'mysql2/promise'


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
    console.log("146", req.session.engineerId)
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





 app.get('/gfk/checkuser', async (req, res) => {
  const engineerId = req.session.engineerId;
  console.log("170", engineerId)
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