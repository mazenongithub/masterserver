import db from '../config/db.js';

class SDC {


    async handleCriteria(projectid, sdc) {
        try {
            if (!projectid) {
                throw new Error('ProjectID is required');
            }

            // Retrieve existing seismic design criteria
            const existing = await this.loadSeismicDesignCriteria(projectid);

            // CASE 1: No SDC supplied - delete existing record
            if (!sdc || Object.keys(sdc).length === 0) {
                if (existing) {
                    return await this.deleteSeismicDesignCriteria(projectid);
                }

                return { success: true, action: 'none' };
            }

            // CASE 2: No existing record - insert new SDC
            if (!existing) {
                const result = await this.insertSeismicDesignCriteria(
                    projectid,
                    sdc
                );

                return { ...result, action: 'inserted' };
            }

            // CASE 3: Compare existing SDC with new values
            const fields = [
                'SS', 'S1', 'SiteClass', 'FA', 'FV',
                'SMS', 'SM1', 'SDS', 'SD1'
            ];

            const changed = fields.some(field => {
                const oldValue = existing[field] ?? null;
                const newValue = sdc[field] ?? null;

                return oldValue !== newValue;
            });

            // CASE 4: No changes
            if (!changed) {
                return {
                    success: true,
                    action: 'unchanged',
                    projectid
                };
            }

            // CASE 5: Existing SDC has changed - update
            const result = await this.updateSeismicDesignCriteria(
                projectid,
                sdc
            );

            return {
                success: true,
                action: 'updated',
                projectid,
                result
            };

        } catch (error) {
            console.error('Error handling Seismic Design Criteria:', error);
            throw error;
        }
    }



    async loadSeismicDesignCriteria(projectid) {
        try {


            const sql = `
                SELECT *
                FROM SDC
                WHERE ProjectID = ?
                LIMIT 1
            `;

            const [rows] = await db.execute(sql, [projectid]);

            return rows.length > 0 ? rows[0] : null;

        } catch (error) {
            console.error('Error loading Seismic Design Criteria:', error);
            throw error;
        }
    }

    async updateSeismicDesignCriteria(projectid, sdc) {
        try {

            const {
                SS, S1, SiteClass, FA, FV,
                SMS, SM1, SDS, SD1
            } = sdc;

            const sql = `
                INSERT INTO SDC (
                    ProjectID, SS, S1, SiteClass, FA, FV,
                    SMS, SM1, SDS, SD1
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    SS = VALUES(SS),
                    S1 = VALUES(S1),
                    SiteClass = VALUES(SiteClass),
                    FA = VALUES(FA),
                    FV = VALUES(FV),
                    SMS = VALUES(SMS),
                    SM1 = VALUES(SM1),
                    SDS = VALUES(SDS),
                    SD1 = VALUES(SD1)
            `;

            const values = [
                projectid,
                SS ?? null,
                S1 ?? null,
                SiteClass ?? null,
                FA ?? null,
                FV ?? null,
                SMS ?? null,
                SM1 ?? null,
                SDS ?? null,
                SD1 ?? null
            ];

            const [result] = await db.execute(sql, values);

            return result;

        } catch (error) {
            console.error('Error updating Seismic Design Criteria:', error);
            throw error;
        }
    }


    async insertSeismicDesignCriteria(projectid, sdc) {
        try {


            const {
                SS, S1, SiteClass, FA, FV,
                SMS, SM1, SDS, SD1
            } = sdc;

            const sql = `
                INSERT INTO SDC (
                    ProjectID, SS, S1, SiteClass, FA, FV,
                    SMS, SM1, SDS, SD1
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const values = [
                projectid,
                SS ?? null,
                S1 ?? null,
                SiteClass ?? null,
                FA ?? null,
                FV ?? null,
                SMS ?? null,
                SM1 ?? null,
                SDS ?? null,
                SD1 ?? null
            ];

            const [result] = await db.execute(sql, values);

            return {
                success: true,
                insertId: result.insertId,
                projectid
            };

        } catch (error) {
            console.error('Error inserting Seismic Design Criteria:', error);
            throw error;
        }
    }

    async deleteSeismicDesignCriteria(projectid) {
        try {


            const sql = `
                DELETE FROM SDC
                WHERE ProjectID = ?
            `;

            const [result] = await db.execute(sql, [projectid]);

            return {
                success: true,
                deleted: result.affectedRows > 0,
                affectedRows: result.affectedRows,
                projectid
            };

        } catch (error) {
            console.error('Error deleting Seismic Design Criteria:', error);
            throw error;
        }
    }




}

export default SDC