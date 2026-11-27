
import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    ListObjectVersionsCommand,
    DeleteObjectCommand
} from '@aws-sdk/client-s3';

import { pipeline } from 'node:stream/promises';
import { createWriteStream } from 'node:fs';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// ============================================
// BACKBLAZE B2 CONFIGURATION
// ============================================

const s3 = new S3Client({
    region: process.env.B2_REGION,
    endpoint: process.env.B2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.B2_KEY_ID,
        secretAccessKey: process.env.B2_APPLICATION_KEY
    }
});

const Bucket = process.env.B2_BUCKET;

// ============================================
// VALIDATE STORAGE CONFIGURATION
// ============================================

function validateStorage(key) {

    if (!Bucket) {
        throw new Error(
            'Backblaze B2 bucket is not configured'
        );
    }

    if (
        !key ||
        typeof key !== 'string' ||
        key.trim() === ''
    ) {
        throw new Error(
            'A valid Backblaze object key is required'
        );
    }
}

// ============================================
// DOWNLOAD IMAGE TO LOCAL FILE
// ============================================

export async function downloadImage(key, localPath) {

    validateStorage(key);

    if (!localPath) {
        throw new Error(
            'Local download path is required'
        );
    }

    const image = await s3.send(
        new GetObjectCommand({
            Bucket,
            Key: key
        })
    );

    await pipeline(
        image.Body,
        createWriteStream(localPath)
    );

    return localPath;
}

// ============================================
// UPLOAD IMAGE TO BACKBLAZE B2
// ============================================

export async function uploadImage(
    key,
    buffer,
    contentType
) {

    validateStorage(key);

    if (!buffer) {
        throw new Error(
            'Image buffer is required'
        );
    }

    await s3.send(
        new PutObjectCommand({
            Bucket,
            Key: key,
            Body: buffer,
            ContentType:
                contentType || 'application/octet-stream'
        })
    );

    return key;
}

// ============================================
// GENERATE SIGNED IMAGE URL
// ============================================

export async function getImageUrl(key) {

    validateStorage(key);

    const command = new GetObjectCommand({
        Bucket,
        Key: key
    });

    return await getSignedUrl(
        s3,
        command,
        {
            expiresIn: 3600
        }
    );
}

// ============================================
// GET IMAGE FROM BACKBLAZE B2
// ============================================

export async function getImage(key) {

    validateStorage(key);

    return await s3.send(
        new GetObjectCommand({
            Bucket,
            Key: key
        })
    );
}

// ============================================
// PERMANENTLY DELETE IMAGE FROM BACKBLAZE B2
// ============================================

export async function deleteImage(key) {

    validateStorage(key);

    // ============================================
    // FIND ALL VERSIONS OF THE EXACT OBJECT
    // ============================================

    const versions = [];

    let keyMarker;
    let versionIdMarker;

    while (true) {

        const response = await s3.send(
            new ListObjectVersionsCommand({
                Bucket,
                Prefix: key,
                KeyMarker: keyMarker,
                VersionIdMarker: versionIdMarker
            })
        );

        // Collect stored object versions.
        for (const version of response.Versions || []) {

            if (version.Key === key) {
                versions.push({
                    versionId: version.VersionId,
                    type: 'version'
                });
            }
        }

        // Collect existing delete markers.
        for (const marker of response.DeleteMarkers || []) {

            if (marker.Key === key) {
                versions.push({
                    versionId: marker.VersionId,
                    type: 'marker'
                });
            }
        }

        if (!response.IsTruncated) {
            break;
        }

        if (
            !response.NextKeyMarker &&
            !response.NextVersionIdMarker
        ) {
            throw new Error(
                'Backblaze returned an incomplete version listing'
            );
        }

        keyMarker = response.NextKeyMarker;
        versionIdMarker = response.NextVersionIdMarker;
    }

    // ============================================
    // VALIDATE VERSION IDS BEFORE DELETION
    // ============================================

    for (const version of versions) {

        if (!version.versionId) {
            throw new Error(
                'Backblaze returned an invalid version ID'
            );
        }
    }

    // ============================================
    // DELETE ALL VERSIONS AND MARKERS
    // ============================================

    let deletedVersions = 0;
    let deletedMarkers = 0;

    for (const version of versions) {

        await s3.send(
            new DeleteObjectCommand({
                Bucket,
                Key: key,
                VersionId: version.versionId
            })
        );

        if (version.type === 'marker') {
            deletedMarkers++;
        } else {
            deletedVersions++;
        }
    }

    // ============================================
    // RETURN DELETION SUMMARY
    // ============================================

    return {
        success: true,
        key,
        deletedVersions,
        deletedMarkers,
        totalDeleted:
            deletedVersions + deletedMarkers
    };
}
