import mysql from 'mysql2/promise'
import GFK from '../classes/gfk.js';
import { createPoolCluster } from 'mysql2';






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

    (async () => {

        const [rows] = await pool.query('SELECT NOW() AS now');
        console.log(rows);
    })
        ();

    // /home/civilengineer_io/apps/masterserver/db549453520_db_1and1_com.sql

    // mysql -u mazen -p GFK_TABLES < /home/civilengineer_io/apps/masterserver/db549453520_db_1and1_com.sql


    app.get("/gfk/saveprojects", async (req, res) => {

        const gfk = new GFK();

        try {

            const sql = `SELECT ProjectList.ProjectID, ProjectList.ProjectNumber, ProjectList.Series, ProjectList.Title, ProjectList.Proposed, ProjectList.ProposedProject, ProjectList.ClientID, ProjectList.EngineerID,ProjectList.ProjectAddress, ProjectList.ProjectCity, ProjectList.ProjectAPN
FROM ProjectList
WHERE ProjectList.CompanyID Is Not Null
ORDER BY ProjectList.ProjectID DESC`;
            const [projects] = await pool.query(sql);
            console.log(projects);

            let myprojects = [];

            for (let project of projects) {
                let newproject = gfk.createProject(project.ProjectID, project.ProjectNumber, project.Series, project.Title, project.ProposedProject, project.ClientID, project.EngineerID, project.ProjectAddress, project.ProjectCity, project.ProjectAPN)
                myprojects.push(newproject)
            }

            const saveprojects = {
                companyid: 'gfk',
                projects: myprojects
            }

            const savedprojects = await gfk.saveProjects(saveprojects)

            res.json({
                success: true,
                count: projects.length,
                projects: savedprojects
            })


        } catch (err) {
            console.error("❌ Error fetching projects:", err);
            res.status(500).json({
                success: false,
                message: "Error: Could not retrieve projects.",
                error: err.message,
            });
        }

    })

    app.get("/gfk/saveborings", async (req, res) => {
        try {
            const gfk = new GFK();

            // 1️⃣ Get all borings
            const sqlBorings = `
      SELECT 
        Borings.BoringID, 
        Borings.ProjectID, 
        Borings.BoringNumber, 
        Borings.DateDrilled, 
        Borings.LoggedBy, 
        Borings.DrillRig, 
        Borings.Elevation, 
        Borings.Diameter, 
        Borings.GWDepth, 
        Borings.Latitude, 
        Borings.Longitude
      FROM Borings
      ORDER BY Borings.BoringID DESC
    `;
            const [borings] = await pool.query(sqlBorings);

            let myborings = [];

            // 2️⃣ Create boring objects
            for (const boring of borings) {
                const newboring = gfk.createBoring(
                    boring.BoringID,
                    boring.ProjectID,
                    boring.BoringNumber,
                    boring.DateDrilled,
                    boring.LoggedBy,
                    boring.DrillRig,
                    boring.Elevation,
                    boring.Diameter,
                    boring.GWDepth,
                    boring.Latitude,
                    boring.Longitude
                );
                myborings.push(newboring);
            }

            // 3️⃣ For each boring, get samples and nested data
            for (const myboring of myborings) {
                const boringid = myboring.boringid;

                const sqlSamples = `
        SELECT 
          Samples.SampleID, Samples.SampleSet, Samples.SampleNumber, 
          Samples.SampleDepth, Samples.Depth, Samples.SampleDiameter, 
          Samples.SampleLength, Samples.Description, Samples.WetWgt, 
          Samples.DryWgt, Samples.WetWgt_2, Samples.USCS, Samples.SPT, 
          Samples.TareWgt, Samples.TareNo, Samples.GraphicLog, 
          Samples.LL, Samples.PI, Samples.Remarks, Samples.SPTLength
        FROM Samples
        WHERE Samples.BoringID = ?
        ORDER BY Samples.Depth
      `;
                const [samples] = await pool.query(sqlSamples, [boringid]);

                if (samples.length > 0) {
                    myboring.samples = [];

                    for (const sample of samples) {
                        const sampleid = sample.SampleID;

                        // Base sample object
                        const newsample = gfk.createSample(
                            sample.SampleID,
                            sample.SampleSet,
                            sample.SampleNumber,
                            sample.SampleDepth,
                            sample.Depth,
                            sample.SampleDiameter,
                            sample.SampleLength,
                            sample.Description,
                            sample.WetWgt,
                            sample.DryWgt,
                            sample.WetWgt_2,
                            sample.USCS,
                            sample.SPT,
                            sample.TareWgt,
                            sample.TareNo,
                            sample.GraphicLog,
                            sample.LL,
                            sample.PI,
                            sample.Remarks,
                            sample.SPTLength
                        );

                        // 4️⃣ Fetch sieve analysis (single result)
                        const sqlSieve = `
            SELECT 
              Sieve.Wgt200, Sieve.Wgt100, Sieve.Wgt40, Sieve.Wgt30, 
              Sieve.Wgt10, Sieve.Wgt4, Sieve.Wgt38, Sieve.Wgt34
            FROM Sieve
            WHERE Sieve.SampleID = ?
          `;
                        const [sieveResults] = await pool.query(sqlSieve, [sampleid]);
                        if (sieveResults.length > 0) {
                            const s = sieveResults[0];
                            console.log("🧱 Sieve result for sample", sampleid, ":", sieveResults);
                            newsample.sieve = gfk.createSieve(
                                s.Wgt200,
                                s.Wgt100,
                                s.Wgt40,
                                s.Wgt30,
                                s.Wgt10,
                                s.Wgt4,
                                s.Wgt38,
                                s.Wgt34
                            );
                        }

                        // 5️⃣ Fetch unconfined tests (multiple results)
                        const sqlUnconfined = `
            SELECT 
              Unconfined.UnID, 
              Unconfined.Displacement, 
              Unconfined.LoadReading
            FROM Unconfined
            WHERE Unconfined.SampleID = ?
            ORDER BY Unconfined.Displacement
          `;
                        const [unconfinedResults] = await pool.query(sqlUnconfined, [sampleid]);
                        if (unconfinedResults.length > 0) {
                            newsample.unconfined = unconfinedResults.map(u =>
                                gfk.createUnconfined(u.UnID, u.Displacement, u.LoadReading)
                            );
                        }

                        // Add sample to boring
                        myboring.samples.push(newsample);
                    }
                }
            }

            // 6️⃣ Group borings by projectid
            const grouped = Object.values(
                myborings.reduce((acc, boring) => {
                    const { projectid, ...rest } = boring;
                    if (!acc[projectid]) {
                        acc[projectid] = { projectid, borings: [] };
                    }
                    acc[projectid].borings.push(rest);
                    return acc;
                }, {})
            );

            let savedprojects = [];
            for (let myproject of grouped) {
                let savedproject = await gfk.saveBorings(myproject)
                savedprojects.push(savedproject)
            }

            // 7️⃣ Return JSON response
            res.json({
                success: true,
                count: myborings.length,
                projects: savedprojects,
            });
        } catch (err) {
            console.error("❌ Error fetching borings:", err);
            res.status(500).json({
                success: false,
                message: "Error: Could not retrieve borings.",
                error: err.message,
            });
        }
    });

    app.get("/gfk/savefieldreports", async (req, res) => {
        try {
            const gfk = new GFK();
            const engineerid = "mazen"; // You can replace with req.query.engineerid or req.user.id

            // 1️⃣ Fetch all field reports for this engineer
            const sqlReports = `
      SELECT 
        GFKUSERS.EngineerID AS engineerid,
        ProjectList.ProjectID AS projectid,
        ProjectList.ProjectNumber AS projectnumber,
        ProjectList.Title AS title,
        GFKFIELDREPORT.FieldID AS fieldid,
        GFKFIELDREPORT.DateReport AS datereport,
        GFKFIELDREPORT.ReportContent AS content
      FROM ProjectList
      INNER JOIN GFKFIELDREPORT ON ProjectList.ProjectID = GFKFIELDREPORT.ProjectID
      INNER JOIN GFKUSERS ON ProjectList.EngineerID = GFKUSERS.EngineerID
      WHERE GFKUSERS.EngineerID = ? 
        AND GFKUSERS.EngineerID IS NOT NULL
      ORDER BY GFKFIELDREPORT.FieldID DESC
    `;
            const [reports] = await pool.query(sqlReports, [engineerid]);

            if (!reports.length) {
                return res.json({
                    success: true,
                    count: 0,
                    projects: [],
                });
            }

            // 2️⃣ Collect all FieldIDs for related lookups
            const fieldids = reports.map(r => r.fieldid);
            const placeholders = fieldids.map(() => "?").join(",");

            // 3️⃣ Fetch images for all reports (and exclude fieldid)
            let images = [];
            if (fieldids.length) {
                const sqlImages = `
        SELECT 
          ImageID AS imageid,
          Image AS image,
          Caption AS caption,
          FieldID AS fieldid
        FROM Images
        WHERE FieldID IN (${placeholders})
      `;
                const [rows] = await pool.query(sqlImages, fieldids);
                images = rows;
            }

            // 4️⃣ Fetch compaction tests for all reports (and exclude fieldid)
            let compactiontests = [];
            if (fieldids.length) {
                const sqlCompaction = `
        SELECT 
          FieldID AS fieldid,
          TestID AS testid,
          CurveID AS curveid,
          TimeTest AS timetest,
          TestNum AS testnum,
          Elevation AS elevation,
          Location AS location,
          WetDen AS wetden,
          Moistpcf AS moistpcf,
          \`Group\` AS \`group\`,
          LetterID AS letterid
        FROM GFK_COMPACTION
        WHERE FieldID IN (${placeholders})
        ORDER BY TestID DESC
      `;
                const [rows] = await pool.query(sqlCompaction, fieldids);
                compactiontests = rows;
            }

            // 5️⃣ Attach related images + compaction tests (exclude fieldid in saved data)
            for (const report of reports) {
                const fid = String(report.fieldid);
                report.images = images
                    .filter(img => String(img.fieldid) === fid)
                    .map(({ imageid, image, caption }) => ({ imageid, image, caption }));

                report.compactiontests = compactiontests
                    .filter(test => String(test.fieldid) === fid)
                    .map(({ testid, curveid, timetest, testnum, elevation, location, wetden, moistpcf, group, letterid }) => ({
                        testid,
                        curveid,
                        timetest,
                        testnum,
                        elevation,
                        location,
                        wetden,
                        moistpcf,
                        group,
                        letterid,
                    }));
            }

            // 6️⃣ Group field reports by projectid
            const grouped = Object.values(
                reports.reduce((acc, report) => {
                    const pid = report.projectid;
                    if (!acc[pid]) {
                        acc[pid] = {
                            projectid: pid,
                            projectnumber: report.projectnumber,
                            title: report.title,
                            fieldreports: [],
                        };
                    }
                    acc[pid].fieldreports.push({
                        datereport: report.datereport,
                        content: report.content,
                        images: report.images,
                        compactiontests: report.compactiontests,
                    });
                    return acc;
                }, {})
            );

            // 7️⃣ Save each grouped project into Mongo via gfk.saveFieldReports
            const savedreports = [];
            for (const group of grouped) {
                const saved = await gfk.saveFieldReports(group);
                savedreports.push(saved);
            }

            // ✅ 8️⃣ Send clean structured response
            res.json({
                success: true,
                count: reports.length,
                projects: savedreports,
            });

        } catch (err) {
            console.error("❌ Error fetching field reports:", err);
            res.status(500).json({
                success: false,
                message: "Error: Could not retrieve field reports.",
                error: err.message,
            });
        }
    });

    app.get("/gfk/savecompactioncurves", async (req, res) => {
        try {
            const gfk = new GFK();
            // 1️⃣ Fetch all compaction curves with related project info
            const sql = `
      SELECT 
        ProjectList.ProjectID AS projectid,
        GFK_COMPACTION_Curves.CurveID AS curveid,
        GFK_COMPACTION_Curves.CurveNumber AS curvenumber,
        GFK_COMPACTION_Curves.Description AS description,
        GFK_COMPACTION_Curves.MaxDen AS maxden,
        GFK_COMPACTION_Curves.Moist AS moist
      FROM GFK_COMPACTION_Curves
      INNER JOIN ProjectList 
        ON GFK_COMPACTION_Curves.ProjectID = ProjectList.ProjectID
      ORDER BY ProjectList.ProjectID DESC
    `;

            const [curves] = await pool.query(sql);

            // 2️⃣ Optionally group curves by project for easier saving (optional)
            const grouped = Object.values(
                curves.reduce((acc, curve) => {
                    const pid = curve.projectid;
                    if (!acc[pid]) {
                        acc[pid] = { projectid: pid, compactioncurves: [] };
                    }
                    acc[pid].compactioncurves.push({
                        curveid: curve.curveid,
                        curvenumber: curve.curvenumber,
                        description: curve.description,
                        maxden: curve.maxden,
                        moist: curve.moist,
                    });
                    return acc;
                }, {})
            );

            const savedCurves = [];
            for (const group of grouped) {
                const saved = await gfk.saveCompactionCurves(group);
                savedCurves.push(saved);
            }

            // 4️⃣ Return structured response
            res.json({
                success: true,
                count: curves.length,
                projects: savedCurves,
            });


        } catch (err) {
            console.error("❌ Error fetching compaction curves:", err);
            res.status(500).json({
                success: false,
                message: "Error: Could not retrieve compaction curves.",
                error: err.message,
            });
        }
    });


    app.get("/gfk/saveseismic", async (req, res) => {
        try {
            const gfk = new GFK();

            // 1️⃣ Fetch seismic data (one per project)
            const sqlSeismic = `
      SELECT 
        ProjectList.ProjectID AS projectid,
        Seismic._ID AS seismicid,
        Seismic.SiteAcceleration AS siteacceleration,
        Seismic.Magnitude AS magnitude
      FROM Seismic
      INNER JOIN ProjectList 
        ON Seismic.ProjectID = ProjectList.ProjectID
      ORDER BY ProjectList.ProjectID DESC
    `;
            const [seismicData] = await pool.query(sqlSeismic);

            if (!seismicData.length) {
                return res.json({
                    success: true,
                    count: 0,
                    projects: [],
                });
            }

            const projects = [];

            // 2️⃣ Loop through each seismic record (one per project)
            for (const s of seismicData) {
                const { projectid, siteacceleration, magnitude } = s;

                // 3️⃣ Fetch all points for this project
                const sqlPoints = `
        SELECT 
          SeismicPoints.PointID AS pointid,
          SeismicPoints.SampleID AS sampleid,
          SeismicPoints.SPT AS spt,
          SeismicPoints.Fines AS fines,
          SeismicPoints.PI AS pi,
          SeismicPoints.Depth AS depth
        FROM SeismicPoints
        WHERE SeismicPoints.ProjectID = ?
        ORDER BY SeismicPoints.Depth
      `;
                const [points] = await pool.query(sqlPoints, [projectid]);

                // 4️⃣ Fetch strain data for each point
                for (const point of points) {
                    const sqlStrain = `
          SELECT 
            SeismicStrain.StrainID AS strainid,
            SeismicStrain.TopLayer AS toplayer,
            SeismicStrain.BottomLayer AS bottomlayer,
            SeismicStrain.StrainRatio AS strainratio
          FROM SeismicStrain
          WHERE SeismicStrain.PointID = ?
          ORDER BY SeismicStrain.TopLayer
        `;
                    const [strain] = await pool.query(sqlStrain, [point.pointid]);
                    point.strain = strain;
                }

                // 5️⃣ Build structured object
                const projectSeismic = {
                    projectid,
                    siteacceleration,
                    magnitude,
                    points,
                };

                // 6️⃣ Save to Mongo
                const saved = await gfk.saveSeismic(projectSeismic);
                projects.push(saved);
            }

            // 7️⃣ Respond with structured JSON
            res.json({
                success: true,
                count: projects.length,
                projects,
            });
        } catch (err) {
            console.error("❌ Error fetching seismic report:", err);
            res.status(500).json({
                success: false,
                message: "Error: Could not retrieve seismic report.",
                error: err.message,
            });
        }
    });


    app.get("/gfk/saveptslab", async (req, res) => {
        try {
            const gfk = new GFK();

            // 1️⃣ Fetch all PT Slab sections with project info
            const sqlSections = `
      SELECT 
        ProjectList.ProjectID AS projectid,
        ProjectList.ProjectNumber AS projectnumber,
        PTSlabSection.SectionID AS sectionid,
        PTSlabSection.SectionName AS sectionname
      FROM PTSlabSection
      INNER JOIN ProjectList ON PTSlabSection.ProjectID = ProjectList.ProjectID
      ORDER BY ProjectList.ProjectNumber
    `;
            const [sections] = await pool.query(sqlSections);

            if (!sections.length) {
                return res.json({
                    success: true,
                    count: 0,
                    projects: [],
                });
            }

            // 2️⃣ Loop through each section and attach layers
            for (const section of sections) {
                const sqlLayers = `
        SELECT 
          PTSlabLayer.LayerID AS layerid,
          PTSlabLayer.LayerName AS layername,
          PTSlabLayer.TopLayer AS toplayer,
          PTSlabLayer.BottomLayer AS bottomlayer,
          PTSlabLayer.LL AS ll,
          PTSlabLayer.PI AS pi,
          PTSlabLayer.Fines AS fines,
          PTSlabLayer.Micro AS micro
        FROM PTSlabLayer
        WHERE PTSlabLayer.SectionID = ?
        ORDER BY PTSlabLayer.TopLayer
      `;
                const [layers] = await pool.query(sqlLayers, [section.sectionid]);
                section.layers = layers;
            }

            // 3️⃣ Group sections by project
            const groupedByProject = Object.values(
                sections.reduce((acc, section) => {
                    const projectId = section.projectid;
                    if (!acc[projectId]) {
                        acc[projectId] = {
                            projectid: projectId,
                            sections: [],
                        };
                    }
                    acc[projectId].sections.push({
                        sectionid: section.sectionid,
                        sectionname: section.sectionname,
                        layers: section.layers,
                    });
                    return acc;
                }, {})
            );

            // 4️⃣ Optionally save to Mongo
            const savedProjects = [];
            for (const group of groupedByProject) {
                const saved = await gfk.savePTSlab(group);
                savedProjects.push(saved);
            }

            // 5️⃣ Respond with structured JSON
            res.json({
                success: true,
                count: groupedByProject.length,
                projects: savedProjects,
            });
        } catch (err) {
            console.error("❌ Error fetching PT slab:", err);
            res.status(500).json({
                success: false,
                message: "Error: Could not retrieve PT slab data.",
                error: err.message,
            });
        }
    });

app.get("/gfk/saveslope", async (req, res) => {
  try {
    const gfk = new GFK();

    // 1️⃣ Fetch slope stability data joined with project list
    const sqlSections = `
      SELECT 
        SlopeStability.ProjectID AS projectid,
        SlopeStability.SectionID AS sectionid,
        SlopeStability.Section AS sectionname,
        SlopeStability.Vseismic AS vseismic,
        SlopeStability.Hseismic AS hseismic,
        SlopeStability.Slices AS slices
      FROM SlopeStability
      INNER JOIN ProjectList ON SlopeStability.ProjectID = ProjectList.ProjectID
      ORDER BY SlopeStability.ProjectID
    `;
    const [sections] = await pool.query(sqlSections);

    if (!sections.length) {
      return res.json({
        success: true,
        count: 0,
        projects: [],
      });
    }

    // 2️⃣ Build structure: each section → layers → points + (failure or strength)
    for (const section of sections) {
      const sqlLayers = `
        SELECT 
          SlopeLayer.LayerID AS layerid,
          SlopeLayer.Layer AS layer,
          SlopeLayer.LayerType AS layertype,
          SlopeLayer.LineType AS linetype,
          SlopeLayer.Color AS color,
          SlopeLayer.LayerOrder AS layerorder
        FROM SlopeLayer
        WHERE SlopeLayer.SectionID = ?
        ORDER BY SlopeLayer.LayerOrder
      `;
      const [layers] = await pool.query(sqlLayers, [section.sectionid]);

      for (const layer of layers) {
        // 🟩 Load slope points
        const sqlPoints = `
          SELECT 
            SlopePoints.PointID AS pointid,
            SlopePoints.Xcoord AS xcoord,
            SlopePoints.Ycoord AS ycoord
          FROM SlopePoints
          WHERE SlopePoints.LayerID = ?
          ORDER BY SlopePoints.Xcoord
        `;
        const [points] = await pool.query(sqlPoints, [layer.layerid]);
        layer.points = points;

        // 🔴 If LayerType = failure, load failure surface data
        if (layer.layertype && layer.layertype.toLowerCase() === "failure") {
          const sqlFailure = `
            SELECT 
              SlopeFailure.Rx AS rx,
              SlopeFailure.Ry AS ry,
              SlopeFailure.Cx AS cx,
              SlopeFailure.Cy AS cy
            FROM SlopeFailure
            WHERE SlopeFailure.LayerID = ?
          `;
          const [failureRows] = await pool.query(sqlFailure, [layer.layerid]);
          layer.failure = failureRows.length ? failureRows[0] : null;
          layer.strength = null; // ensure consistent structure
        } 
        // 🟦 Otherwise load strength (SlopeSubsurface)
        else {
          const sqlStrength = `
            SELECT 
              SlopeSubsurface.Gamma AS gamma,
              SlopeSubsurface.Cohesion AS cohesion,
              SlopeSubsurface.Friction AS friction
            FROM SlopeSubsurface
            WHERE SlopeSubsurface.LayerID = ?
          `;
          const [strengthRows] = await pool.query(sqlStrength, [layer.layerid]);
          layer.strength = strengthRows.length ? strengthRows[0] : null;
          layer.failure = null;
        }
      }

      section.layers = layers;
    }

    // 3️⃣ Group sections by projectid
    const groupedByProject = Object.values(
      sections.reduce((acc, section) => {
        const projectId = section.projectid;
        if (!acc[projectId]) {
          acc[projectId] = {
            projectid: projectId,
            vseismic: section.vseismic,
            hseismic: section.hseismic,
            sections: [],
          };
        }
        acc[projectId].sections.push({
          sectionid: section.sectionid,
          sectionname: section.sectionname,
          slices: section.slices,
          layers: section.layers,
        });
        return acc;
      }, {})
    );

    // 4️⃣ Save grouped projects to MongoDB
    const savedSlopes = [];
    for (const project of groupedByProject) {
      const saved = await gfk.saveSlope(project);
      savedSlopes.push(saved);
    }

    // 5️⃣ Respond
    res.json({
      success: true,
      count: savedSlopes.length,
      projects: savedSlopes,
    });
  } catch (err) {
    console.error("❌ Error fetching slope data:", err);
    res.status(500).json({
      success: false,
      message: "Error: Could not retrieve slope data.",
      error: err.message,
    });
  }
});













}