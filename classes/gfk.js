import mongoose from 'mongoose';
const ProjectSchema = new mongoose.Schema({
    companyid: String,
    projects: [{
        projectid: String,
        projectnumber: String,
        series: String,
        title: String,
        sow: String,
        clientid: String,
        engineerid: String,
        projectaddress: String,
        projectcity: String,
        projectapn: String

    }]

})

const BoringSchema = new mongoose.Schema({
    projectid: String,
    borings: [{
        boringid: String,
        projectid: String,
        boringnumber: String,
        datedrilled: String,
        loggedby: String,
        drillrig: String,
        elevation: String,
        diameter: String,
        gwdepth: String,
        latitude: String,
        longitude: String,
        samples: [{
            sampleid: String,
            boringid: String,
            sampleset: String,
            samplenumber: String,
            sampledepth: String,
            depth: String,
            diameter: String,
            samplelength: String,
            description: String,
            wetwgt: String,
            drywgt: String,
            wetwgt_2: String,
            uscs: String,
            spt: String,
            tarewgt: String,
            tareno: String,
            graphiclog: String,
            ll: String,
            pi: String,
            remarks: String,
            sptlength: String,
            sieve: {
                wgt34: String,
                wgt38: String,
                wgt4: String,
                wgt10: String,
                wgt30: String,
                wgt40: String,
                wgt100: String,
                wgt200: String,
            },
            unconfined:
                [{
                    unid: String,
                    displacement: String,
                    loadreading: String
                }]

        }]

    }]
})

const fieldReportSchema = new mongoose.Schema({
    projectid: String,
    fieldreports: [{
        fieldid: String,
        datereport: String,
        content: String,
        images: [{
            image: String,
            imageid: String,
            caption: String
        }],
        compactiontests: [{

            testid: String,
            timetest: String,
            testnum: String,
            elevation: String,
            location: String,
            wetpcf: String,
            moistpcf: String,
            curveid: String,
            group: String,
            letterid: String
        }]
    }]


})

const compactionCurveSchema = ({

    projectid: String,
    compactioncurves: [{
        curveid: String,
        curvenumber: String,
        description: String,
        maxden: String,
        moist: String
    }]

})

const seismicSchema = new mongoose.Schema({
    projectid: String,
    siteaccelteration: String,
    magnitude: String,
    points: [{
        pointid: String,
        sampleid: String,
        spt: String,
        pi: String,
        fines: String,
        depth: String,
        strain: [{
            strainid: String,
            toplayer: String,
            bottomlayer: String,
            strainratio: String
        }]

    }]
})

const PTSchema = new mongoose.Schema({
    projectid: String,
    sections: [{
        sectionid: String,
        sectionname: String,
        layers: [{
            layerid: String,
            layername: String,
            toplayer: String,
            bottomlayer: String,
            ll: String,
            pi: String,
            fines: String,
            micro: String
        }]

    }]

})

const slopeSchema = new mongoose.Schema({
    projectid: String,
    vseismic: String,
    hseismic: String,
    sections: [{
        sectionid: String,
        sectionname: String,
        slices: String,
        layers: [{
            layerid: String,
            layer: String,
            layertype: String,
            linetype: String,
            color: String,
            layerorder: String,
            points: [{
                pointid: String,
                xcoord: String,
                ycoord: String
            }],
            strength: {
                gamma: String,
                cohesion: String,
                friction: String
            },
            failure: {
                rx: String,
                ry: String,
                cx: String,
                cy: String
            }
        }],


    }]


})


const MyProjects = mongoose.model("gfkprojects", ProjectSchema);
const MyBorings = mongoose.model("myborings", BoringSchema);
const FieldReports = mongoose.model("fieldreports", fieldReportSchema)
const CompactionCurves = mongoose.model("compactioncurves", compactionCurveSchema)
const SeismicReport = mongoose.model("seismicreports", seismicSchema)
const PTSlabs = mongoose.model("ptslabs", PTSchema)
const Slopes = mongoose.model("slopes", slopeSchema)


class GFK {

    createSieve(wgt200, wgt100, wgt40, wgt30, wgt10, wgt4, wgt38, wgt34) {
        return ({ wgt200, wgt100, wgt40, wgt30, wgt10, wgt4, wgt38, wgt34 })
    }

    createUnconfined(unid, displacement, loadreading) {
        return ({ unid, displacement, loadreading })
    }

    createProject(projectid, projectnumber, series, title, sow, clientid, engineerid, projectaddress, projectcity, projectapn) {
        return ({ projectid, projectnumber, series, title, sow, clientid, engineerid, projectaddress, projectcity, projectapn })
    }

    createSample(sampleid, sampleset, samplenumber, sampledepth, depth, diameter, samplelength, description, wetwgt, drywgt, wetwgt_2, uscs, spt, tarewgt, tareno, graphiclog, ll, pi, remarks, sptlength) {
        return ({ sampleid, sampleset, samplenumber, sampledepth, depth, diameter, samplelength, description, wetwgt, drywgt, wetwgt_2, uscs, spt, tarewgt, tareno, graphiclog, ll, pi, remarks, sptlength })
    }

    createBoring(boringid, projectid, boringnumber, datedrilled, loggedby, drillrig, elevation, diameter,
        gwdepth, latitude, longitude) {

        return ({
            boringid, projectid, boringnumber, datedrilled, loggedby, drillrig, elevation, diameter,
            gwdepth, latitude, longitude
        })

    }

    async saveProjects(myProjects) {
        try {
            const filter = { companyid: myProjects.companyid };

            const options = {
                new: true,       // ✅ return the updated document
                upsert: true,    // ✅ create new if not found
                strict: false,   // ✅ allow flexible schema fields
            };

            const updatedProjects = await MyProjects.findOneAndUpdate(filter, myProjects, options);

            return updatedProjects;

        } catch (err) {
            console.error('Error saving project:', err);
            return { message: `Error: Could not save project - ${err.message}` };
        }
    }

    async loadBorings(projectid) {
        try {
            const filter = { projectid };

            const updatedBorings = await MyBorings.findOne(filter);

            // ✅ Return empty array if no document found
            if (!updatedBorings || !Array.isArray(updatedBorings.borings)) {
                return [];
            }

            // Sort borings by boringnumber
            updatedBorings.borings.sort((a, b) => {
                const numA = Number(a.boringnumber) || 0;
                const numB = Number(b.boringnumber) || 0;
                return numA - numB;
            });

            // Sort samples by depth inside each boring
            updatedBorings.borings.forEach(boring => {
                if (Array.isArray(boring.samples)) {
                    boring.samples.sort((a, b) => {
                        const depthA = Number(a.depth) || 0;
                        const depthB = Number(b.depth) || 0;
                        return depthA - depthB;
                    });
                }
            });

            return updatedBorings.borings;

        } catch (err) {
            console.error('Error loading borings:', err);
            return [];
        }
    }



    async saveBorings(myBorings) {
        try {
            const filter = { projectid: myBorings.projectid };

            const options = {
                new: true,       // ✅ return the updated document
                upsert: true,    // ✅ create new if not found
                strict: false,   // ✅ allow flexible schema fields
            };

            const updatedBorings = await MyBorings.findOneAndUpdate(filter, myBorings, options);

            return updatedBorings;

        } catch (err) {
            console.error('Error saving borings:', err);
            return { message: `Error: Could not save borings - ${err.message}` };
        }
    }

    async loadFieldReports(projectid) {
        try {
            if (!projectid) {
                throw new Error("Missing project ID.");
            }

            const filter = { projectid };
            const fieldReportDoc = await FieldReports.findOne(filter);

            // Return empty array if no document found
            if (!fieldReportDoc || !Array.isArray(fieldReportDoc.fieldreports)) {
                console.warn(`⚠️ No field reports found for project ${projectid}`);
                return [];
            }

            // Sort field reports by datereport (ascending)
            const sortedReports = fieldReportDoc.fieldreports.sort((a, b) => {
                const dateA = new Date(a.datereport);
                const dateB = new Date(b.datereport);
                return dateA - dateB;
            });

            return sortedReports;

        } catch (err) {
            console.error("❌ Error loading field reports:", err);
            return [];
        }
    }



    async saveFieldReports(fieldReports) {
        try {
            const filter = { projectid: fieldReports.projectid };

            const options = {
                new: true,       // ✅ return the updated document
                upsert: true,    // ✅ create new if not found
                strict: false,   // ✅ allow flexible schema fields
            };

            const updatedReports = await FieldReports.findOneAndUpdate(filter, fieldReports, options);

            return updatedReports;

        } catch (err) {
            console.error('Error saving fieldreports:', err);
            return { message: `Error: Could not save fieldreports - ${err.message}` };
        }
    }


    async saveCompactionCurves(compactionCurves) {
        try {
            const filter = { projectid: compactionCurves.projectid };

            const options = {
                new: true,       // ✅ return the updated document
                upsert: true,    // ✅ create new if not found
                strict: false,   // ✅ allow flexible schema fields
            };

            const updatedCurves = await CompactionCurves.findOneAndUpdate(filter, compactionCurves, options);

            return updatedCurves;

        } catch (err) {
            console.error('Error saving compaction curves:', err);
            return { message: `Error: Could not save compaction curves - ${err.message}` };
        }
    }


    async saveSeismic(seismic) {
        try {
            const filter = { projectid: seismic.projectid };

            const options = {
                new: true,       // ✅ return the updated document
                upsert: true,    // ✅ create new if not found
                strict: false,   // ✅ allow flexible schema fields
            };

            const updatedSeismic = await SeismicReport.findOneAndUpdate(filter, seismic, options);

            return updatedSeismic;

        } catch (err) {
            console.error('Error saving sesimic report:', err);
            return { message: `Error: Could not save seismic report - ${err.message}` };
        }
    }


    async savePTSlab(ptslab) {
        try {
            const filter = { projectid: ptslab.projectid };

            const options = {
                new: true,       // ✅ return the updated document
                upsert: true,    // ✅ create new if not found
                strict: false,   // ✅ allow flexible schema fields
            };

            const updatedPTSlab = await PTSlabs.findOneAndUpdate(filter, ptslab, options);

            return updatedPTSlab;

        } catch (err) {
            console.error('Error saving ptslab report:', err);
            return { message: `Error: Could not save ptslab report - ${err.message}` };
        }
    }



    async saveSlope(slope) {
        try {
            const filter = { projectid: slope.projectid };

            const options = {
                new: true,       // ✅ return the updated document
                upsert: true,    // ✅ create new if not found
                strict: false,   // ✅ allow flexible schema fields
            };

            const updatedSlope = await Slopes.findOneAndUpdate(filter, slope, options);

            return updatedSlope;

        } catch (err) {
            console.error('Error saving slope report:', err);
            return { message: `Error: Could not save slope report - ${err.message}` };
        }
    }

    async loadProjects(companyid) {

        try {

            let projects = await MyProjects.findOne({ companyid })
            return projects.projects;

        } catch (err) {

            console.error('Error loading projects:', err);
            return { message: `Error: Could not load projects - ${err.message}` };

        }
    }






}

export default GFK;