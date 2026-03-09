const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const Certificate = require('./models/Certificate');

dotenv.config();

// Explicit cloudinary config
const match = process.env.CLOUDINARY_URL.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
if (match) {
    cloudinary.config({
        api_key: match[1],
        api_secret: match[2],
        cloud_name: match[3]
    });
}

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

async function migrate() {
    try {
        const certs = await Certificate.find({ fileUrl: { $regex: '^/uploads/' } });
        console.log(`Found ${certs.length} certificates with local fileUrl.`);

        for (const cert of certs) {
            const localPath = path.join(__dirname, cert.fileUrl.replace(/^[\/\\]/, ''));

            if (fs.existsSync(localPath)) {
                console.log(`Uploading ${cert.fileUrl} to Cloudinary...`);
                const result = await cloudinary.uploader.upload(localPath, {
                    folder: 'certificates',
                    resource_type: 'auto'
                });

                cert.fileUrl = result.secure_url;
                await cert.save();
                console.log(`Updated cert ${cert._id} with Cloudinary URL: ${cert.fileUrl}`);

                // Optional: Delete local file
                // fs.unlinkSync(localPath);
            } else {
                console.log(`File not found locally: ${localPath}`);
            }
        }

        console.log('Migration complete.');
        process.exit();
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
