import GFK, { GFKCompany, MyProjects, Schedules } from '../classes/gfk.js';

async function compareProject(req, res, next) {
    try {
        const { companyid, projectid } = req.params;
     
         const { updatedProject } = req.body;
        const clientid = req.session.clientID
      

        // Get the existing project
        const projectDoc = await MyProjects.findOne(
            {
                companyid,
                "projects.projectid": projectid
            },
            {
                "projects.$": 1
            }
        );

        const existingProject = projectDoc?.projects?.[0];

        if (!existingProject) {
            return next();
        }

        // Get the client
        const companyDoc = await GFKCompany.findOne(
            {
                company: companyid,
                "clients._id": clientid
            },
            {
                "clients.$": 1
            }
        );

    

        const client = companyDoc?.clients?.[0] || null;

         if (!client) {
            return next();
        }
     
        // Compare fields
        const changes = {};

        for (const key of Object.keys(updatedProject)) {

            // Ignore fields you don't care about
            if (["_id", "__v", "updatedAt", "createdAt"].includes(key)) {
                continue;
            }

            if (
                JSON.stringify(existingProject[key]) !==
                JSON.stringify(updatedProject[key])
            ) {
                changes[key] = {
                    before: existingProject[key],
                    after: updatedProject[key]
                };
            }
        }

      

        req.projectChanges = {
            client,
            project: existingProject,
            updatedProject,
            changes,
            hasChanges: Object.keys(changes).length > 0
        };

        next();

    } catch (err) {
        next(err);
    }
};

export default compareProject;