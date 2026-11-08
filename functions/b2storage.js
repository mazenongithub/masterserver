import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand
} from '@aws-sdk/client-s3';
import { pipeline } from 'node:stream/promises';
import { createWriteStream } from 'node:fs';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
    region: process.env.B2_REGION,
    endpoint: process.env.B2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.B2_KEY_ID,
        secretAccessKey: process.env.B2_APPLICATION_KEY
    }
});

const Bucket = process.env.B2_BUCKET;

export async function downloadImage(key, localPath) {
    const image = await s3.send(new GetObjectCommand({
        Bucket: process.env.B2_BUCKET,
        Key: key
    }));

    await pipeline(
        image.Body,
        createWriteStream(localPath)
    );

    return localPath;
}


export async function uploadImage(key, buffer, contentType) {
    await s3.send(new PutObjectCommand({
        Bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType
    }));

    return key;
}

export async function getImageUrl(key) {
    const command = new GetObjectCommand({
        Bucket,
        Key: key
    });

    return await getSignedUrl(s3, command, {
        expiresIn: 3600
    });
}

export async function getImage(key) {
    return await s3.send(new GetObjectCommand({
        Bucket,
        Key: key
    }));
}