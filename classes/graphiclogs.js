
import { randomUUID } from 'node:crypto';
import { GraphicLogs as GraphicLogModel } from './gfk.js';


class GraphicLogs {

    // ============================================
    // LOAD ALL COMPANY GRAPHIC LOGS
    // ============================================

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

    async saveGraphicLog(companyid, graphic) {
        try {
            if (!graphic || typeof graphic !== 'object') {
                throw new Error('Graphic data is required');
            }

            if (graphic.graphicid) {
                return await this.updateGraphicLog(
                    companyid,
                    graphic.graphicid,
                    graphic
                );
            }

            return await this.createGraphicLog(
                companyid,
                graphic
            );

        } catch (error) {
            console.error('Error saving graphic:', error);
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
