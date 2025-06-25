const mongoose = require('mongoose');
const Job = require('./models/Job');

async function testDB() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://127.0.0.1:27017/hustlerrs');
    console.log('Connected to MongoDB');

    // Count total jobs
    const totalJobs = await Job.countDocuments();
    console.log('Total jobs in database:', totalJobs);

    // Get all jobs
    const jobs = await Job.find({});
    console.log('Jobs:', JSON.stringify(jobs, null, 2));

    // Disconnect
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

testDB(); 