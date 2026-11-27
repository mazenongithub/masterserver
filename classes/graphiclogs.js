
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { GraphicLogs as GraphicLogModel } from './gfk.js';

// Change this path to your existing Backblaze helper module.
// deleteB2Image(key) must permanently delete the B2 object.
import {
    uploadImage,
    deleteImage
} from '../functions/b2storage.js';

class GraphicLogs {

    // ============================================
    // ERROR HELPER
    // ============================================

    createError(message, status = 500) {
        const error = new Error(message);
        error.status = status;
        return error;
    }

    // ============================================
    // VALIDATE GRAPHIC IMAGE KEY
    // ============================================

    isValidImageKey(key) {

        if (!key || typeof key !== 'string') {
            return false;
        }

        // Accept existing filenames in the GFK
        // graphiclogs storage directory.
        return (
            key.startsWith('gfk/graphiclogs/') &&
            key.length > 'gfk/graphiclogs/'.length &&
            !key.includes('..') &&
            !key.includes('\\') &&
            !/[\x00-\x1f]/.test(key)
        );
    }

    // ============================================
    // LOAD ALL COMPANY GRAPHIC LOGS
    // ============================================

    async loadGraphicLogs(companyid) {

        if (!companyid) {
            throw this.createError(
                'Company ID is required',
                400
            );
        }

        try {

            const document = await GraphicLogModel.findOne({
                companyid
            }).lean();

            return document || {
                companyid,
                graphics: []
            };

        } catch (error) {

            console.error(
                'Error loading graphic logs:',
                error
            );

            throw error;
        }
    }

    // ============================================
    // FIND GRAPHIC BY ID
    // ============================================

    async findGraphicByID(companyid, graphicid) {

        if (!companyid || !graphicid) {
            return null;
        }

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

            console.error(
                'Error finding graphic:',
                error
            );

            throw error;
        }
    }

    // ============================================
    // CREATE GRAPHIC
    // ============================================

    async createGraphicLog(companyid, graphic = {}) {

        if (!companyid) {
            throw this.createError(
                'Company ID is required',
                400
            );
        }

        try {

            const newGraphic = {
                graphicid: randomUUID(),
                code: graphic.code || '',
                graphiclog: '',
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

            console.error(
                'Error creating graphic:',
                error
            );

            throw error;
        }
    }

    // ============================================
    // UPDATE GRAPHIC PROPERTIES
    // ============================================

    async updateGraphicLog(
        companyid,
        graphicid,
        updates = {}
    ) {

        if (!companyid || !graphicid) {
            throw this.createError(
                'Company ID and Graphic ID are required',
                400
            );
        }

        try {

            // Image keys should only be changed by
            // the upload and delete methods.
            const fields = [
                'code',
                'description'
            ];

            const changes = {};

            for (const field of fields) {

                if (
                    Object.prototype.hasOwnProperty.call(
                        updates,
                        field
                    )
                ) {
                    changes[`graphics.$.${field}`] =
                        updates[field];
                }
            }

            if (Object.keys(changes).length === 0) {
                return this.findGraphicByID(
                    companyid,
                    graphicid
                );
            }

            const document =
                await GraphicLogModel.findOneAndUpdate(
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
                graphic =>
                    graphic.graphicid === graphicid
            ) || null;

        } catch (error) {

            console.error(
                'Error updating graphic:',
                error
            );

            throw error;
        }
    }

    // ============================================
    // SAVE GRAPHIC LIBRARY
    // ============================================

    async saveGraphicLogs(companyid, graphics) {

        if (!companyid) {
            throw this.createError(
                'Company ID is required',
                400
            );
        }

        if (!Array.isArray(graphics)) {
            throw this.createError(
                'Graphics array is required',
                400
            );
        }

        try {

            const existing =
                await this.loadGraphicLogs(companyid);

            // Preserve server-managed image keys.
            // The client cannot delete or replace a B2 key
            // simply by editing the graphics array.

            const currentById = new Map(
                existing.graphics.map(graphic => [
                    graphic.graphicid,
                    graphic
                ])
            );

            const updatedGraphics = graphics.map(graphic => {

                const current =
                    currentById.get(graphic.graphicid);

                return {
                    graphicid: graphic.graphicid,
                    code: graphic.code || '',
                    description: graphic.description || '',
                    graphiclog: current
                        ? current.graphiclog || ''
                        : ''
                };
            });

            const result =
                await GraphicLogModel.findOneAndUpdate(
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

            return result.graphics;

        } catch (error) {

            console.error(
                'Error saving graphic logs:',
                error
            );

            throw error;
        }
    }

    // ============================================
    // UPLOAD IMAGE TO BACKBLAZE B2
    // ============================================


async uploadGraphicLogImage(
    file,
    companyid,
    graphicid,
    properties = {}
) {

    if (!companyid || !graphicid) {
        throw this.createError(
            'Company ID and Graphic ID are required',
            400
        );
    }

    if (!file) {
        throw this.createError(
            'Image file is required',
            400
        );
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
        throw this.createError(
            'Only JPEG and PNG images are supported',
            400
        );
    }

    if (file.size > 8 * 1024 * 1024) {
        throw this.createError(
            'Maximum image size is 8 MB',
            400
        );
    }

    // ============================================
    // GENERATE BACKBLAZE KEY
    // ============================================

    const key =
        `gfk/graphiclogs/${randomUUID()}.${extension}`;

    const buffer = file.buffer ||
        await readFile(file.path);

    // ============================================
    // UPLOAD IMAGE TO BACKBLAZE
    // ============================================

    await uploadImage(
        key,
        buffer,
        file.mimetype
    );

    try {

        // ============================================
        // FIND EXISTING GRAPHIC
        // ============================================

        const existing = await this.findGraphicByID(
            companyid,
            graphicid
        );

        let result;

        if (existing) {

            // ========================================
            // UPDATE EXISTING GRAPHIC
            // ========================================

            result = await GraphicLogModel.findOneAndUpdate(
                {
                    companyid,
                    graphics: {
                        $elemMatch: {
                            graphicid,
                            graphiclog: existing.graphiclog || ''
                        }
                    }
                },
                {
                    $set: {
                        'graphics.$.graphiclog': key
                    }
                },
                {
                    new: true,
                    runValidators: true
                }
            ).lean();

            if (!result) {
                throw this.createError(
                    'Graphic changed during upload. Please try again.',
                    409
                );
            }

        } else {

            // ========================================
            // CREATE GRAPHIC AUTOMATICALLY
            // ========================================

            const newGraphic = {
                graphicid,
                code: properties.code || '',
                description: properties.description || '',
                graphiclog: key
            };

            // Ensure the company library exists.
            // companyid should be unique in the schema.
            await GraphicLogModel.updateOne(
                { companyid },
                {
                    $setOnInsert: {
                        companyid,
                        graphics: []
                    }
                },
                { upsert: true }
            );

            // Add only if this graphic ID is absent.
            result = await GraphicLogModel.findOneAndUpdate(
                {
                    companyid,
                    'graphics.graphicid': { $ne: graphicid }
                },
                {
                    $push: {
                        graphics: newGraphic
                    }
                },
                {
                    new: true,
                    runValidators: true
                }
            ).lean();

            if (!result) {
                throw this.createError(
                    'Graphic was created by another request. Please retry.',
                    409
                );
            }
        }

        return result.graphics;

    } catch (error) {

        // B2 upload succeeded but MongoDB failed.
        // Attempt to remove the newly uploaded file.
        try {
            await deleteImage(key);
        } catch (cleanupError) {
            console.error(
                'Could not clean up uploaded B2 image:',
                cleanupError
            );
        }

        throw error;
    }
}

    // ============================================
    // GET GRAPHIC IMAGE KEY
    // ============================================

    async getGraphicLog(companyid, graphicid) {

        const graphic = await this.findGraphicByID(
            companyid,
            graphicid
        );

        return graphic?.graphiclog || '';
    }

    // ============================================
    // CHECK SHARED IMAGE REFERENCES
    // ============================================

    async isImageShared(
        imageKey,
        companyid,
        graphicid
    ) {

        const libraries = await GraphicLogModel.find(
            {
                'graphics.graphiclog': imageKey
            },
            {
                companyid: 1,
                graphics: 1
            }
        ).lean();

        return libraries.some(library =>
            (library.graphics || []).some(graphic =>

                graphic.graphiclog === imageKey &&

                !(
                    String(library.companyid) ===
                    String(companyid) &&

                    String(graphic.graphicid) ===
                    String(graphicid)
                )
            )
        );
    }

    // ============================================
    // DELETE IMAGE FROM BACKBLAZE B2
    // ============================================

 
async deleteGraphicLogImage(companyid, graphicid) {

    if (!companyid || !graphicid) {
        throw this.createError(
            'Company ID and Graphic ID are required',
            400
        );
    }

    // ============================================
    // FIND GRAPHIC
    // ============================================

    const graphic = await this.findGraphicByID(
        companyid,
        graphicid
    );

    if (!graphic) {
        throw this.createError(
            'Graphic not found',
            404
        );
    }

    const imageKey = graphic.graphiclog;

    // ============================================
    // DELETE BACKBLAZE IMAGE IF PRESENT
    // ============================================

    if (imageKey) {

        // Support both legacy and current GFK paths.
        const validPath =
            imageKey.startsWith('gfk/graphiclogs/') ||
            imageKey.startsWith('gfk/logdraft/');

        if (
            typeof imageKey !== 'string' ||
            !validPath ||
            imageKey.includes('..') ||
            imageKey.includes('\\') ||
            /[\x00-\x1f]/.test(imageKey)
        ) {
            throw this.createError(
                'Invalid Backblaze image key',
                400
            );
        }

        const shared = await this.isImageShared(
            imageKey,
            companyid,
            graphicid
        );

        if (shared) {
            throw this.createError(
                'Image is referenced by another graphic',
                409
            );
        }

        // Permanently delete image versions.
        await deleteImage(imageKey);
    }

    // ============================================
    // REMOVE ENTIRE GRAPHIC FROM MONGODB
    // ============================================

    const result = await GraphicLogModel.findOneAndUpdate(
        {
            companyid,
            graphics: {
                $elemMatch: {
                    graphicid,
                    graphiclog: imageKey || ''
                }
            }
        },
        {
            $pull: {
                graphics: {
                    graphicid
                }
            }
        },
        {
            new: true,
            runValidators: true
        }
    ).lean();

    if (!result) {
        throw this.createError(
            'Graphic changed during deletion. Please reload and retry.',
            409
        );
    }

    // ============================================
    // RETURN UPDATED GRAPHICS ARRAY
    // ============================================

    return result.graphics;
}


 
}

export default GraphicLogs;
