const mongoose = require('mongoose');
const User = require('./models/Users');
require('dotenv').config();

const makeAdmin = async (email) => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        const user = await User.findOne({ email });

        if (!user) {
            console.log(`User with email ${email} not found.`);
            return;
        }

        user.role = 'Admin';
        await user.save();

        console.log(`User ${user.fullName} (${user.email}) is now an admin.`);

    } catch (error) {
        console.error('Error making user admin:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

const email = process.argv[2];
if (!email) {
    console.log('Please provide an email address.');
    console.log('Usage: node make-admin.js <user-email>');
    process.exit(1);
}

makeAdmin(email); 