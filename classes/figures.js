import { GFKFigures } from "./gfk.js";

class Figures {

 
    async loadProjectFigures(projectid) {
    try {
        const projectFigures = await GFKFigures.findOne({
            projectid
        });

        return projectFigures?.figures || [];

    } catch (err) {
        throw new Error(`Could not load project figures: ${err.message}`);
    }
}


async updateProjectFigures(projectid, figures) {
    try {
        const projectFigures = await GFKFigures.findOneAndUpdate(
            { projectid },
            {
                $set: {
                    figures
                }
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        return projectFigures.figures;

    } catch (err) {
        throw new Error(
            `Could not update project figures: ${err.message}`
        );
    }
}

}

export default Figures;