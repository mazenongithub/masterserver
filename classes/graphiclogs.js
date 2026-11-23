
import { randomUUID } from 'node:crypto';
import { GraphicLogs as GraphicLogModel } from './gfk.js';
import { readFile } from 'node:fs/promises';

class GraphicLogs {

    // ============================================
    // LOAD ALL COMPANY GRAPHIC LOGS
    // ============================================

 async uploadGraphicLogImage(file, companyid, graphicid, graphics) {

    try {

        if (!companyid) {
            throw new Error('Company ID is required');
        }

        if (!graphicid) {
            throw new Error('Graphic ID is required');
        }

        if (!Array.isArray(graphics)) {
            throw new Error('Graphics array is required');
        }

        if (!file) {
            throw new Error('Image file is required');
        }

        // ============================================
        // FIND ACTIVE GRAPHIC
        // ============================================

        const graphic = graphics.find(
            item => item.graphicid === graphicid
        );

        if (!graphic) {
            throw new Error(`Graphic ${graphicid} not found`);
        }

        // ============================================
        // VALIDATE IMAGE
        // ============================================

        const extensions = {
            'image/jpeg': 'jpg',
            'image/png': 'png'
        };

        const extension = extensions[file.mimetype];

        if (!extension) {
            throw new Error('Only JPEG and PNG images are supported');
        }

        if (file.size > 8 * 1024 * 1024) {
            throw new Error('Maximum image size is 8 MB');
        }

        // ============================================
        // CREATE BACKBLAZE IMAGE KEY
        // ============================================

        const key =
            `gfk/graphiclogs/${randomUUID()}.${extension}`;

        // ============================================
        // UPLOAD IMAGE TO BACKBLAZE
        // ============================================

        // Supports Multer memoryStorage or diskStorage.
        const buffer = file.buffer ||
            await readFile(file.path);

        // Uses your existing Backblaze upload helper.
        // Assumes uploadImage(file, key) writes to the
        // specified B2 object key.
        await uploadImage(
            {
                ...file,
                buffer
            },
            key
        );

        // ============================================
        // UPDATE GRAPHIC LOG PROPERTY
        // ============================================

        const updatedGraphics = graphics.map(item => {

            if (item.graphicid === graphicid) {

                return {
                    ...item,
                    graphiclog: key
                };
            }

            return item;
        });

        // ============================================
        // SAVE GRAPHICS IN MONGODB
        // ============================================

        const result = await GraphicLogModel.findOneAndUpdate(
            { companyid },
            {
                $set: {
                    graphics: updatedGraphics
                }
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        ).lean();

        // ============================================
        // RETURN UPDATED GRAPHICS ARRAY
        // ============================================

        return result.graphics;

    } catch (error) {

        console.error(
            'Error uploading graphic log image:',
            error
        );

        throw error;
    }
}

    async loadGraphicLogs(companyid) {
        try {
            const document = await GraphicLogModel.findOne({
                companyid
            }).lean();

            return document || {
                companyid,
                graphics: []
            };

        } catch (error) {
            console.error('Error loading graphic logs:', error);
            throw error;
        }
    }

    // ============================================
    // FIND GRAPHIC BY ID
    // ============================================

    async findGraphicByID(companyid, graphicid) {
        try {
            const document = await GraphicLogModel.findOne(
                {
                    companyid,
                    'graphics.graphicid': graphicid
                },
                {
                    'graphics.$': 1
                }
            ).lean();

            return document?.graphics?.[0] || null;

        } catch (error) {
            console.error('Error finding graphic:', error);
            throw error;
        }
    }

    // ============================================
    // CREATE GRAPHIC
    // ============================================

    async createGraphicLog(companyid, graphic = {}) {
        try {
            if (!companyid) {
                throw new Error('Company ID is required');
            }

            const newGraphic = {
                graphicid: randomUUID(),
                code: graphic.code || '',
                graphiclog: graphic.graphiclog || '',
                description: graphic.description || ''
            };

            await GraphicLogModel.findOneAndUpdate(
                { companyid },
                {
                    $setOnInsert: { companyid },
                    $push: {
                        graphics: newGraphic
                    }
                },
                {
                    upsert: true,
                    new: true,
                    runValidators: true
                }
            );

            return newGraphic;

        } catch (error) {
            console.error('Error creating graphic:', error);
            throw error;
        }
    }

    // ============================================
    // UPDATE GRAPHIC PROPERTIES
    // ============================================

    async updateGraphicLog(companyid, graphicid, updates = {}) {
        try {
            const fields = [
                'code',
                'graphiclog',
                'description'
            ];

            const changes = {};

            for (const field of fields) {
                if (Object.prototype.hasOwnProperty.call(updates, field)) {
                    changes[`graphics.$.${field}`] = updates[field];
                }
            }

            if (Object.keys(changes).length === 0) {
                return this.findGraphicByID(companyid, graphicid);
            }

            const document = await GraphicLogModel.findOneAndUpdate(
                {
                    companyid,
                    'graphics.graphicid': graphicid
                },
                {
                    $set: changes
                },
                {
                    new: true,
                    runValidators: true
                }
            ).lean();

            if (!document) return null;

            return document.graphics.find(
                graphic => graphic.graphicid === graphicid
            ) || null;

        } catch (error) {
            console.error('Error updating graphic:', error);
            throw error;
        }
    }

    // ============================================
    // SAVE GRAPHIC (CREATE OR UPDATE)
    // ============================================

 
async saveGraphicLogs(companyid, graphics) {
    try {

        if (!companyid) {
            throw new Error('Company ID is required');
        }

        if (!Array.isArray(graphics)) {
            throw new Error('Graphics array is required');
        }

        const graphiclogs = await GraphicLogModel.findOneAndUpdate(
            { companyid },
            {
                $set: {
                    graphics
                }
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        ).lean();

        return graphiclogs.graphics;

    } catch (error) {
        console.error('Error saving graphic logs:', error);
        throw error;
    }
}


    // ============================================
    // GET GRAPHIC IMAGE KEY
    // ============================================

    async getGraphicLog(companyid, graphicid) {
        try {
            const graphic = await this.findGraphicByID(
                companyid,
                graphicid
            );

            return graphic?.graphiclog || '';

        } catch (error) {
            console.error('Error getting graphic image:', error);
            throw error;
        }
    }

    // ============================================
    // REMOVE GRAPHIC FROM LIBRARY
    // ============================================

    // Call only after verifying no samples reference
    // this graphicid. This does not delete the B2 file.

    async removeGraphicLog(companyid, graphicid) {
        try {
            const result = await GraphicLogModel.updateOne(
                {
                    companyid,
                    'graphics.graphicid': graphicid
                },
                {
                    $pull: {
                        graphics: { graphicid }
                    }
                }
            );

            return result.modifiedCount > 0;

        } catch (error) {
            console.error('Error removing graphic:', error);
            throw error;
        }
    }
}

export default GraphicLogs;
