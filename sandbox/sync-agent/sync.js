import "dotenv/config"
import chokidar from 'chokidar'
import { S3Client } from '@aws-sdk/client-s3';

const watcher = chokidar.watch('./', {
    ignored: /(^|\/)\.[^/.]/,
    persistent: true,
    ignoreInitial: true
});

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});