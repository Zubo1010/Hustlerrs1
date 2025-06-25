const mongoose = require('mongoose');
const Job = require('./models/Job');
const User = require('./models/Users');

async function seedJobs() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://127.0.0.1:27017/hustlerrs');
    console.log('Connected to MongoDB');

    // First, let's create a sample job giver user if it doesn't exist
    let jobGiver = await User.findOne({ email: 'sample@giver.com' });
    if (!jobGiver) {
      jobGiver = new User({
        name: 'Sample Job Giver',
        email: 'sample@giver.com',
        phone: '01712345678',
        address: 'Dhaka, Bangladesh',
        password: 'password123',
        role: 'Job Giver',
        companyName: 'Sample Company',
        isProfileComplete: true
      });
      await jobGiver.save();
      console.log('Created sample job giver user');
    }

    // Check if jobs already exist
    const existingJobs = await Job.countDocuments();
    if (existingJobs > 0) {
      console.log(`Database already has ${existingJobs} jobs. Skipping seed.`);
      await mongoose.disconnect();
      return;
    }

    // Create sample jobs
    const sampleJobs = [
      {
        title: 'House Cleaning Assistant Needed',
        description: 'Looking for a reliable student to help with house cleaning. Perfect for someone who wants to earn some extra money. No experience needed, we\'ll provide all cleaning supplies. The job involves basic cleaning tasks like dusting, vacuuming, and organizing.',
        jobType: 'Cleaning',
        location: {
          area: 'Dhanmondi, Dhaka',
          address: 'House 123, Road 12, Dhanmondi'
        },
        date: new Date(Date.now() + 86400000), // Tomorrow
        startTime: '10:00 AM',
        duration: '3 hours',
        payment: {
          method: 'Fixed price',
          amount: 800,
          platform: 'Cash'
        },
        hiringType: 'Instant Hire',
        skillRequirements: ['No skill needed'],
        workerPreference: {
          gender: 'Any',
          ageRange: 'Any',
          studentOnly: true,
          experience: 'None'
        },
        contactInfo: {
          phone: '01712345678',
          email: 'sample@giver.com'
        },
        status: 'open',
        createdBy: jobGiver._id
      },
      {
        title: 'Delivery Helper for Restaurant',
        description: 'Urgent need for a delivery helper for our restaurant. You will be responsible for delivering food orders to customers in the local area. Must have a bicycle or motorcycle. Flexible hours, perfect for students.',
        jobType: 'Delivery Help',
        location: {
          area: 'Gulshan, Dhaka',
          address: 'Restaurant ABC, Gulshan-2'
        },
        date: new Date(Date.now() + 172800000), // Day after tomorrow
        startTime: '6:00 PM',
        duration: '4 hours',
        payment: {
          method: 'Hourly',
          rate: 150,
          platform: 'Cash'
        },
        hiringType: 'Allow Bidding',
        skillRequirements: ['No skill needed'],
        workerPreference: {
          gender: 'Any',
          ageRange: 'Any',
          studentOnly: true,
          experience: 'None'
        },
        contactInfo: {
          phone: '01712345678',
          email: 'sample@giver.com'
        },
        status: 'open',
        createdBy: jobGiver._id
      },
      {
        title: 'Online Data Entry Work',
        description: 'Looking for students to help with online data entry work. This is a remote job that you can do from home. We need help entering data into spreadsheets and organizing information. Basic computer skills required.',
        jobType: 'Online Work',
        location: {
          area: 'Remote',
          address: 'Work from home'
        },
        date: new Date(Date.now() + 259200000), // 3 days from now
        startTime: 'Flexible',
        duration: '2-3 hours',
        payment: {
          method: 'Fixed price',
          amount: 500,
          platform: 'bKash'
        },
        hiringType: 'Instant Hire',
        skillRequirements: ['Basic computer skills'],
        workerPreference: {
          gender: 'Any',
          ageRange: 'Any',
          studentOnly: true,
          experience: 'None'
        },
        contactInfo: {
          phone: '01712345678',
          email: 'sample@giver.com'
        },
        status: 'open',
        createdBy: jobGiver._id
      },
      {
        title: 'Event Setup Helper',
        description: 'Need help setting up for a wedding event. Tasks include arranging chairs, decorating, and general setup work. Perfect for students looking for weekend work.',
        jobType: 'Event Setup',
        location: {
          area: 'Banani, Dhaka',
          address: 'Wedding Hall, Banani'
        },
        date: new Date(Date.now() + 345600000), // 4 days from now
        startTime: '9:00 AM',
        duration: '6 hours',
        payment: {
          method: 'Fixed price',
          amount: 1200,
          platform: 'Cash'
        },
        hiringType: 'Instant Hire',
        skillRequirements: ['No skill needed'],
        workerPreference: {
          gender: 'Any',
          ageRange: 'Any',
          studentOnly: true,
          experience: 'None'
        },
        contactInfo: {
          phone: '01712345678',
          email: 'sample@giver.com'
        },
        status: 'open',
        createdBy: jobGiver._id
      }
    ];

    // Insert jobs
    await Job.insertMany(sampleJobs);
    console.log('Successfully seeded 4 sample jobs');

    // Verify
    const totalJobs = await Job.countDocuments();
    console.log('Total jobs in database:', totalJobs);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding jobs:', error);
    await mongoose.disconnect();
  }
}

seedJobs(); 