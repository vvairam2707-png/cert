require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function seedAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // allow email to be pmctech
        // login needs email and password in the body.
        await User.deleteOne({ email: 'pmctech' });
        await User.create({
            name: 'PMC Tech Admin',
            regNo: 'ADMIN',
            email: 'pmctech',
            password: 'admin123',
            role: 'admin'
        });

        console.log('✅ Admin ID pmctech with password admin123 created!');
        process.exit(0);
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

seedAdmin();
