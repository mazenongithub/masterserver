import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'
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
    siteacceleration: String,
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

const EngineerSchema = new mongoose.Schema({
    engineerid: String,
    google: String,
    apple: String,
    firstname: String,
    lastname: String,
    emailaddress: String,
    profileurl: String,
    phonenumber: String
})

const clientSchema = new mongoose.Schema({
    company:String,
    clients:[{    
    clientid:String,
    prefix: String,
    firstname:String,
    lastname:String,
    company:String,
    address:String,
    city:String,
    contactstate:String,
    zipcode:String,
    emailaddress:String,
    phonenumber:String

    }]

})


const MyProjects = mongoose.model("gfkprojects", ProjectSchema);
const MyBorings = mongoose.model("myborings", BoringSchema);
const FieldReports = mongoose.model("fieldreports", fieldReportSchema)
const CompactionCurves = mongoose.model("compactioncurves", compactionCurveSchema)
const SeismicReport = mongoose.model("seismicreports", seismicSchema)
const PTSlabs = mongoose.model("ptslabs", PTSchema)
const Slopes = mongoose.model("slopes", slopeSchema)
const MyEngineer = mongoose.model("engineers", EngineerSchema)
const Clients = mongoose.model("clients", clientSchema)


class GFK {



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

 async saveClients(myClients) {
    try {
        const filter = { company: myClients.company };

        const options = {
            new: true,       // return updated document
            upsert: true,    // create if not found
        };

        // Use $set to avoid replacing the entire document accidentally
        const update = { 
            $set: { clients: myClients.clients }
        };

        const updated = await Clients.findOneAndUpdate(filter, update, options);

        return updated.clients;

    } catch (err) {
        console.error('Error saving clients:', err);
        return { message: `Error: Could not save clients - ${err.message}` };
    }
}


 async findClients() {
    try {
        // Find a single company document
        const companyDoc = await Clients.findOne({ company: 'gfk' });

        // If no document found or no clients array, return empty array
        if (!companyDoc || !Array.isArray(companyDoc.clients)) {
            return [];
        }

        return companyDoc.clients;

    } catch (err) {
        console.error('Error: Could not find clients', err);
        return { 
            message: `Error: Could not find clients - ${err.message}` 
        };
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


  async saveCompactionCurves(myCompactionCurves) {
    try {
        const filter = { projectid: myCompactionCurves.projectid };

        // Always ensure compactioncurves is an array
        const curvesArray = Array.isArray(myCompactionCurves.compactioncurves)
            ? myCompactionCurves.compactioncurves
            : [];

        const update = {
            $set: { compactioncurves: curvesArray }
        };

        const options = {
            new: true,     // return updated doc
            upsert: true,  // create if not exists
        };

        const updatedDoc = await CompactionCurves.findOneAndUpdate(
            filter,
            update,
            options
        );

        // Return ONLY the curves array for the frontend
        return updatedDoc.compactioncurves || [];

    } catch (err) {
        console.error('Error saving compaction curves:', err);
        return { message: `Error: Could not save compaction curves - ${err.message}` };
    }
}


    async loadCompactionCurves(projectid) {
        try {
            if (!projectid) {
                throw new Error("Missing project ID.");
            }

            const filter = { projectid };
            const compactionDoc = await CompactionCurves.findOne(filter);

            if (!compactionDoc || !Array.isArray(compactionDoc.compactioncurves)) {
                console.warn(`⚠️ No compaction curves found for project ${projectid}`);
                return [];
            }

            // ✅ Sort compaction curves by curvenumber (ascending)
            const sortedCurves = compactionDoc.compactioncurves.sort((a, b) => {
                const numA = Number(a.curvenumber) || 0;
                const numB = Number(b.curvenumber) || 0;
                return numA - numB;
            });

            return sortedCurves;

        } catch (err) {
            console.error("❌ Error loading compaction curves:", err);
            return [];
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

    async loadSeismic(projectid) {
        try {
            if (!projectid) {
                throw new Error("Missing project ID.");
            }

            const filter = { projectid };
            const seismicDoc = await SeismicReport.findOne(filter);

            if (!seismicDoc) {
                console.warn(`⚠️ No seismic data found for project ${projectid}`);
                return {
                    vseismic: null,
                    hseismic: null,
                    points: []
                };
            }

            // ✅ Safely sort seismic points by depth (ascending)
            const sortedPoints = Array.isArray(seismicDoc.points)
                ? seismicDoc.points.sort((a, b) => {
                    const depthA = Number(a.depth) || 0;
                    const depthB = Number(b.depth) || 0;
                    return depthA - depthB;
                })
                : [];

            // ✅ Return clean, structured data
            return {
                siteacceleration: seismicDoc.siteacceleration || null,
                magnitude: seismicDoc.magnitude || null,
                points: sortedPoints
            };

        } catch (err) {
            console.error("❌ Error loading seismic data:", err);
            return {
                siteacceleration: null,
                magnitude: null,
                points: []
            };
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

    async loadPTSlab(projectid) {
        try {
            if (!projectid) {
                throw new Error("Missing project ID.");
            }

            const filter = { projectid };
            const slabDoc = await PTSlabs.findOne(filter);

            if (!slabDoc) {
                console.warn(`⚠️ No PT slab data found for project ${projectid}`);
                return { projectid, sections: [] };
            }

            // ✅ Sort each section’s layers by numeric toplayer
            const sortedSections = (slabDoc.sections || []).map(section => {
                const sortedLayers = Array.isArray(section.layers)
                    ? [...section.layers].sort((a, b) => {
                        const topA = Number(a.toplayer) || 0;
                        const topB = Number(b.toplayer) || 0;
                        return topA - topB;
                    })
                    : [];

                return {
                    sectionid: section.sectionid || null,
                    sectionname: section.sectionname || null,
                    layers: sortedLayers
                };
            });

            // ✅ Return clean structured response
            return {
                projectid: slabDoc.projectid,
                sections: sortedSections
            };

        } catch (err) {
            console.error("❌ Error loading PT slab:", err);
            return { projectid, sections: [] };
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

    async loadSlope(projectid) {
        try {
            if (!projectid) {
                throw new Error("Missing project ID.");
            }

            const filter = { projectid };
            const slopeDoc = await Slopes.findOne(filter);

            if (!slopeDoc) {
                console.warn(`⚠️ No slope data found for project ${projectid}`);
                return { projectid, sections: [] };
            }

            // ✅ Sort each layer’s points by numeric xcoord
            const sortedSections = (slopeDoc.sections || []).map(section => {
                const sortedLayers = (section.layers || []).map(layer => {
                    const sortedPoints = Array.isArray(layer.points)
                        ? [...layer.points].sort((a, b) => {
                            const xA = Number(a.xcoord) || 0;
                            const xB = Number(b.xcoord) || 0;
                            return xA - xB;
                        })
                        : [];

                    return {
                        layerid: layer.layerid || null,
                        layer: layer.layer || null,
                        layertype: layer.layertype || null,
                        linetype: layer.linetype || null,
                        color: layer.color || null,
                        layerorder: layer.layerorder || null,
                        points: sortedPoints,
                        strength: layer.strength || {},
                        failure: layer.failure || {}
                    };
                });

                return {
                    sectionid: section.sectionid || null,
                    sectionname: section.sectionname || null,
                    slices: section.slices || null,
                    layers: sortedLayers
                };
            });

            // ✅ Return cleaned + sorted data
            return {
                projectid: slopeDoc.projectid,
                vseismic: slopeDoc.vseismic || null,
                hseismic: slopeDoc.hseismic || null,
                sections: sortedSections
            };

        } catch (err) {
            console.error("❌ Error loading slope stability:", err);
            return { projectid, sections: [] };
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


  async clientLogin(myEngineer) {
  try {
    // Must have at least one provider
    if (!myEngineer.apple && !myEngineer.google) {
      return { message: 'Missing Apple or Google ID' };
    }

    // Determine provider
    const provider = myEngineer.apple ? 'apple' : 'google';
    const providerId = myEngineer[provider];

    // Look for existing engineer
    let existingEngineer = null;
    if (provider === 'apple') {
      existingEngineer = await this.getAppleUser(providerId);
    } else {
      existingEngineer = await this.getGoogleUser(providerId);
    }

    if (existingEngineer) {
      // ✅ Wrap in object with "engineer" property
      return { engineer: existingEngineer };
    }

    // Ensure engineer ID exists before registration
    if (!myEngineer.engineerid) {
      return { message: 'Cannot register engineer — engineer ID missing' };
    }

    // Register new engineer
    const newEngineer = await this.registerNewUser(myEngineer);

    // ✅ Wrap in object with "engineer" property
    return { engineer: newEngineer };

  } catch (err) {
    console.error('Client login error:', err);
    return { message: `Error during client login: ${err.message}` };
  }
}




    hashPassword(password) {

        return bcrypt.hashSync(password, 10);
    }

    async getAppleUser(appleId) {
        try {
            const allEngineers = await MyEngineer.find({ apple: { $exists: true } });

            for (const engineer of allEngineers) {
                const isMatch = bcrypt.compareSync(appleId, engineer.apple);
                if (isMatch) {
                    return engineer; // Found
                }
            }

            // Return null if no match found (important!)
            return null;

        } catch (err) {
            console.error('Error finding Apple engineer:', err);
            throw err; // Let clientLogin handle it
        }
    }


    async getGoogleUser(googleId) {
        try {
            const allEngineers = await MyEngineer.find({ google: { $exists: true } });

            for (const engineer of allEngineers) {
                const isMatch = bcrypt.compareSync(googleId, engineer.google);
                if (isMatch) {
                    return engineer; // Found
                }
            }

            // Return null if no match found (important!)
            return null;

        } catch (err) {
            console.error('Error finding Google engineer:', err);
            throw err; // Let clientLogin handle it
        }
    }


    async registerNewUser(newEngineer) {
        try {
            // ✅ Hash Apple ID if it exists
            if (newEngineer.apple) {
                const salt = await bcrypt.genSalt(10);
                newEngineer.apple = await bcrypt.hash(newEngineer.apple, salt);
            }

            // ✅ Hash Google ID if it exists
            if (newEngineer.google) {
                const salt = await bcrypt.genSalt(10);
                newEngineer.google = await bcrypt.hash(newEngineer.google, salt);
            }

            // ✅ Create engineer in DB
            const createdEngineer = await MyEngineer.create(newEngineer);

            return createdEngineer;

        } catch (err) {
            console.error('Error registering new engineer:', err);
            return { message: `Error: Could not register engineer - ${err.message}` };
        }
    }


     async findEngineerByID(engineerId) {
        try {
            const engineer = await MyEngineer.findById(engineerId);
            return engineer || { message: "Engineer not found" };
        } catch (err) {
            return { message: `Error finding engineer: ${err.message}` };
        }
    }






}

export default GFK;