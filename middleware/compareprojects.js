import GFK, { GFKCompany, MyProjects, Schedules } from '../classes/gfk.js';


async function  compareProjects (req, res, next) {
    try {
        const { companyid, clientid } = req.params;
        const { projects = [] } = req.body;

        const doc = await MyProjects.findOne({ companyid });

        const oldProjects = doc?.projects.filter(
            p => p.clientid === clientid
        ) || [];

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

        const oldMap = new Map(
            oldProjects.map(p => [p.projectid, p])
        );

        const newMap = new Map(
            projects.map(p => [p.projectid, p])
        );

        const created = [];
        const updated = [];
        const deleted = [];

        // Created & Updated
        for (const project of projects) {

            const old = oldMap.get(project.projectid);

            if (!old) {
                created.push(project);
                continue;
            }

            const changes = {};

            for (const key of Object.keys(project)) {

                if (JSON.stringify(project[key]) !== JSON.stringify(old[key])) {
                    changes[key] = {
                        before: old[key],
                        after: project[key]
                    };
                }

            }

            if (Object.keys(changes).length) {
                updated.push({
                    before: old,
                    after: project,
                    changes
                });
            }

        }

        // Deleted
        for (const project of oldProjects) {

            if (!newMap.has(project.projectid)) {
                deleted.push(project);
            }

        }

        req.projectChanges = {
            created,
            updated,
            deleted,
            client
        };

        next();

    } catch (err) {
        next(err);
    }
};

export default compareProjects;