
import { CompactionTables as CompactionTableModel } from "./gfk.js";

class CompactionTables {

    // ============================================
    // LOAD ALL COMPACTION TABLES BY PROJECT
    // ============================================

    async loadCompactionTables(projectid) {

        try {

            if (!projectid) {
                throw new Error('Project ID is required.');
            }

            const document = await CompactionTableModel.findOne(
                { projectid },
                { _id: 0, projectid: 1, tables: 1 }
            ).lean();
         

            return {
                projectid,
                tables: document?.tables || []
            };

        } catch (err) {

            console.error(
                'Error loading compaction tables:',
                err
            );

            throw err;
        }
    }

    // ============================================
    // SAVE ALL COMPACTION TABLES BY PROJECT
    // ============================================

    async saveCompactionTables(projectid, tables) {

        try {

            if (!projectid) {
                throw new Error('Project ID is required.');
            }

            if (!Array.isArray(tables)) {
                throw new Error('Tables must be an array.');
            }

            // ========================================
            // DELETE RECORD IF NO TABLES EXIST
            // ========================================

            if (tables.length === 0) {

                const result = await CompactionTableModel.deleteOne({
                    projectid
                });

                return {
                    success: true,
                    projectid,
                    tables: [],
                    action: 'deleted',
                    deletedCount: result.deletedCount
                };
            }

            // ========================================
            // VALIDATE AND PREPARE TABLES
            // ========================================

            const tableIDs = new Set();

            const preparedTables = tables.map(table => {

                if (!table || typeof table !== 'object') {
                    throw new Error('Invalid compaction table.');
                }

                const tableid = String(
                    table.tableid ?? ''
                ).trim();

                if (!tableid) {
                    throw new Error('Each table requires a tableid.');
                }

                if (tableIDs.has(tableid)) {
                    throw new Error(
                        `Duplicate compaction table ID: ${tableid}`
                    );
                }

                tableIDs.add(tableid);

                return {
                    tableid,

                    tabletitle: String(
                        table.tabletitle ?? ''
                    ),

                    compactiontests: [
                        ...new Set(
                            (Array.isArray(table.compactiontests)
                                ? table.compactiontests
                                : []
                            )
                                .map(id => String(id ?? '').trim())
                                .filter(Boolean)
                        )
                    ]
                };
            });

            // ========================================
            // INSERT OR UPDATE PROJECT DOCUMENT
            // ========================================

            const document = await CompactionTableModel.findOneAndUpdate(
                { projectid },
                {
                    $set: {
                        projectid,
                        tables: preparedTables
                    }
                },
                {
                    upsert: true,
                    new: true,
                    runValidators: true,
                    setDefaultsOnInsert: true
                }
            ).lean();

            return {
                success: true,
                projectid,
                tables: document.tables,
                action: 'saved'
            };

        } catch (err) {

            console.error(
                'Error saving compaction tables:',
                err
            );

            throw err;
        }
    }

    // ============================================
    // FIND INDIVIDUAL TABLE BY TABLE ID
    // ============================================

    async findCompactionTableByID(projectid, tableid) {

        try {

            if (!projectid || !tableid) {
                return null;
            }

            const document = await CompactionTableModel.findOne(
                {
                    projectid,
                    'tables.tableid': tableid
                },
                {
                    tables: {
                        $elemMatch: { tableid }
                    }
                }
            ).lean();

            if (!document?.tables?.length) {
                return null;
            }

            return document.tables[0];

        } catch (err) {

            console.error(
                'Error finding compaction table:',
                err
            );

            throw err;
        }
    }

}

export default CompactionTables;
