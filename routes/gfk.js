import GFK from '../classes/gfk.js';


export default (app) => {

   

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
            const [borings = [], fieldreports = [], compactioncurves = [], seismic = [], ptslab = [], slope =[]] = await Promise.all([
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
                count: borings.length,
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






}