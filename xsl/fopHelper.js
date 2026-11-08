import { spawn } from 'node:child_process';

export function streamFOP(
    xml,
    xslPath,
    res,
    fileName,
    outputFormat,
    fopPath = '/usr/bin/fop'
) {
    return new Promise((resolve, reject) => {
        const fop = spawn(fopPath, [
            '-xml', '-',
            '-xsl', xslPath,
            `-${outputFormat}`, '-'
        ], {
            stdio: ['pipe', 'pipe', 'pipe']
        });

        let stderr = '';
        let settled = false;
        let timedOut = false;
        let aborted = false;
        let processClosed = false;
        let responseFinished = false;
        let exitCode = null;

        const timeout = setTimeout(() => {
            timedOut = true;
            fop.kill('SIGKILL');
        }, 30000);

        const cleanupListeners = () => {
            clearTimeout(timeout);
            res.off('finish', onFinish);
            res.off('close', onResponseClose);
        };

        const fail = (err) => {
            if (settled) return;
            settled = true;
            cleanupListeners();

            console.error('FOP error:', err.message);

            if (stderr) {
                console.error(stderr);
            }

            if (!res.headersSent) {
                res.status(500).send(
                    `${outputFormat.toUpperCase()} generation failed`
                );
            } else if (!res.destroyed && !res.writableEnded) {
                res.destroy(err);
            }

            reject(err);
        };

        const succeed = () => {
            if (settled) return;
            settled = true;
            cleanupListeners();
            resolve();
        };

        const checkComplete = () => {
            if (!processClosed) return;

            if (timedOut) {
                return fail(new Error('FOP timed out after 30 seconds'));
            }

            if (aborted) {
                return fail(new Error('Client disconnected'));
            }

            if (exitCode !== 0) {
                return fail(new Error(`FOP exited with code ${exitCode}`));
            }

            if (responseFinished) {
                succeed();
            }
        };

        function onFinish() {
            responseFinished = true;
            checkComplete();
        }

        function onResponseClose() {
            if (!res.writableFinished) {
                aborted = true;
                fop.kill('SIGKILL');
            }
        }

        res.on('finish', onFinish);
        res.on('close', onResponseClose);

        fop.stderr.on('data', chunk => {
            stderr += chunk.toString();
        });

        fop.stdin.on('error', err => {
            if (err.code !== 'EPIPE') {
                console.error('FOP stdin error:', err);
            }
        });

        fop.stdout.on('error', err => {
            fail(err);
            fop.kill('SIGKILL');
        });

        fop.on('error', err => {
            fail(err);
        });

        fop.on('close', code => {
            processClosed = true;
            exitCode = code;
            checkComplete();
        });

        const mimeType =
            outputFormat === 'rtf'
                ? 'application/rtf'
                : 'application/pdf';

        res.setHeader('Content-Type', mimeType);
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${fileName}"`
        );

        fop.stdout.pipe(res);

        fop.stdin.end(xml);
    });
}