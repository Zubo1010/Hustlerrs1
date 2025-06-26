// controllers/jobController.js

const Job = require('../models/Job');
const User = require('../models/Users');
const Bid = require('../models/Bid');
const Message = require('../models/Message');
const { createNotification } = require('./notificationController');

const asyncHandler = require('express-async-handler');
const {getLocationData} = require('../services/locationService')
/**
 * Transforms a raw job document from the database into the format expected by the frontend.
 * Also checks if the current user (if any) has applied for the job.
 * @param {object} job - The raw job document from Mongoose.
 * @param {string|null} userId - The ID of the current user (or null for guests).
 * @returns {object} The transformed job object.
 */
const transformJobData = (job, userId) => {
    const jobObject = job.toObject ? job.toObject() : job;

    // 1. Determine if the user has applied
    const userHasApplied = userId 
        ? jobObject.bids.some(bid => bid.hustler && bid.hustler.toString() === userId.toString()) 
        : false;

    // 2. Standardize the payment structure
    let pay = {
        type: 'N/A',
        display: 'N/A',
    };
    if (jobObject.payment?.method === 'Fixed price') {
        pay = {
            type: 'Fixed',
            amount: jobObject.payment.amount,
            display: `৳${jobObject.payment.amount} (Fixed)`,
        };
    } else if (jobObject.payment?.method === 'Hourly') {
        pay = {
            type: 'Hourly',
            amount: jobObject.payment.rate,
            display: `৳${jobObject.payment.rate}/hr`,
        };
    }

    // 3. Create tags from various job fields
    const tags = [];
    if (jobObject.skillRequirements?.includes('No skill needed')) {
        tags.push('No Skill Needed');
    }
    if (jobObject.workerPreference?.studentOnly) {
        tags.push('Student Friendly');
    }
    if (jobObject.hiringType === 'Instant Hire') {
        tags.push('Urgent');
    }

    // 4. Return the transformed object
    return {
        ...jobObject,
        pay,
        tags,
        userHasApplied,
        // Ensure createdBy is populated with at least the ID
        createdBy: jobObject.createdBy ? { _id: jobObject.createdBy._id || jobObject.createdBy } : null,
    };
};

// Create Job
const createJob = asyncHandler(async (req, res) => {
    // Check user role
    if (req.user.role !== 'Job Giver') {
        res.status(403);
        throw new Error('Only job givers can create jobs.');
    }

    const { title, jobType, location, date, startTime, duration, payment, hiringType, contactInfo } = req.body;

    if (!title || !jobType || !location?.division || !location?.district || !location?.upazila || !location?.address || !location?.area || !date || !startTime || !duration || !payment || !hiringType || !contactInfo?.phone) {
        return res.status(400).json({ message: 'Please provide all required job fields including location (division, district, upazila, address, area).' });
    }
// Validate location against location_db.json
if (!validateLocation(location.division, location.district, location.upazila)) {
    return res.status(400).json({ message: 'Invalid division, district, or upazila provided.' });
}

    // Prepare job data, including coordinates if provided
    const jobData = {
        ...req.body,
        createdBy: req.user._id,
        status: 'open'
    };


    const newJob = new Job(jobData);
    await newJob.save();
    res.status(201).json({ message: 'Job created successfully!', job: newJob });
});

// Get all bids (applications) for a job — only for the job creator
const getJobApplications = asyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.id)
        .populate('createdBy', 'fullName email')
        .populate({
            path: 'bids',
            populate: {
                path: 'hustler',
                select: 'fullName email profilePicture',
            }
        });

    if (!job) {
        return res.status(404).json({ message: 'Job not found.' });
    }

    // ✅ Allow only the job creator
    if (!job.createdBy._id.equals(req.user._id)) {
        return res.status(403).json({ message: 'Access Denied. Only job givers can view applications for their jobs.' });
    }

    res.json({ job, applications: job.bids });
});

//Validation Location
const validateLocation = (division, district, upazila) => {
    const locationData = getLocationData();
    if (!locationData || !locationData.divisions) {
        console.error("Location data not loaded or invalid.");
        return false; // Cannot validate if data is not available
    }

    const foundDivision = locationData.divisions.find(d => d.division_name === division);
    if (!foundDivision) {
        return false; // Division not found
    }

    const foundDistrict = foundDivision.districts.find(d => d.district_name === district);
    if (!foundDistrict) {
        return false; // District not found
    }

    const foundUpazila = foundDistrict.upazilas.find(u => u === upazila);
    if (!foundUpazila) {
        return false; // Upazila not found
    }

    return true; // Location is valid
};


// Generic Job Fetching Logic
const getJobs = asyncHandler(async (req, res, isMyJobs = false) => {
    const { 
        sort = 'newest', 
        area = '', 
        maxPay, 
        date, 
        noSkillNeeded, 
        jobType,
        page = 1,
        limit = 10,
        upazila,
        district,
        division
    } = req.query;

    const query = {};

    // Base query for 'My Jobs'
    if (isMyJobs) {
        if (req.user.role !== 'Job Giver') {
            return res.status(403).json({ message: 'Access denied.' });
        }
        query.createdBy = req.user._id;
    } else {
        // Only show 'open' jobs in the general listing
        query.status = 'open';
    }

    // --- Filtering ---
    if (upazila) {
        query['location.upazila'] = upazila;
    } else if (district) {
        query['location.district'] = district;
    } else if (division) {
        query['location.division'] = division;
    }
    if (area) query['location.area'] = area;
    if (jobType) query.jobType = { $in: jobType.split(',') };
    if (maxPay) query['payment.amount'] = { $lte: parseInt(maxPay, 10) };
    if (noSkillNeeded === 'true') query.skillRequirements = 'No skill needed';

    if (date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let dateQuery;
        if (date === 'today') dateQuery = { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
        if (date === 'tomorrow') {
            const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
            dateQuery = { $gte: tomorrow, $lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000) };
        }
        if (date === 'this_week') {
            const endOfWeek = new Date(today);
            endOfWeek.setDate(today.getDate() + (6 - today.getDay()) + 1);
            dateQuery = { $gte: today, $lt: endOfWeek };
        }
        if(dateQuery) query.date = dateQuery;
    }

    // --- Sorting ---
    const sortOptions = {};
    if (sort === 'highest_pay') {
        sortOptions['payment.amount'] = -1;
        sortOptions['payment.rate'] = -1;
    } else { // 'newest' is default
        sortOptions.createdAt = -1;
    }

    // --- Execution ---
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const jobs = await Job.find(query)
        .populate('createdBy', 'name')
        .populate('bids')
        .populate({ path: 'bids', select: 'hustler', populate: { path: 'hustler', select: '_id' } })
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit));
    const totalJobs = await Job.countDocuments(query);

    // --- Transformation ---
    const userId = req.user ? req.user._id : null;
    const transformedJobs = jobs.map(job => transformJobData(job, userId));

    res.json({
        jobs: transformedJobs,
        total: totalJobs,
        page: parseInt(page),
        pages: Math.ceil(totalJobs / parseInt(limit)),
    });
});

/**
 * @desc    Get all jobs (for hustlers and guests)
 * @route   GET /api/jobs
 * @access  Public
 */
const getAllJobs = asyncHandler(async (req, res) => {
    await getJobs(req, res, false);
});

/**
 * @desc    Get jobs for the logged-in Job Giver
 * @route   GET /api/jobs/my-jobs
 * @access  Private (Job Giver only)
 */
const getMyJobs = asyncHandler(async (req, res) => {
    await getJobs(req, res, true);
});

// Get Job by ID
const getJobById = asyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.id)
        .populate('createdBy', 'name email')
        .populate({
            path: 'bids',
            populate: { path: 'hustler', select: 'name email' }
        });

    if (!job) {
        return res.status(404).json({ message: 'Job not found' });
    }
    
    const userId = req.user ? req.user._id : null;
    const transformedJob = transformJobData(job, userId);

    res.json({ job: transformedJob });
});

// Apply for a Job
const applyForJob = asyncHandler(async (req, res) => {
    const { id: jobId } = req.params;
    const { price, coverLetter } = req.body; // 'coverLetter' corresponds to 'notes' in the bid modal
    const hustlerId = req.user._id;

    if (req.user.role !== 'Hustler') {
        return res.status(403).json({ message: 'Only hustlers can apply for jobs' });
    }

    if (!price || isNaN(Number(price))) {
        return res.status(400).json({ message: 'Valid price is required' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
        return res.status(404).json({ message: 'Job not found' });
    }

    if (job.status !== 'open') {
        return res.status(400).json({ message: `This job is no longer accepting applications. Current status: ${job.status}` });
    }

    const existingBid = await Bid.findOne({ job: jobId, hustler: hustlerId });
    if (existingBid) {
        return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Create new bid
    const bid = new Bid({
        job: jobId,
        hustler: hustlerId,
        price: Number(price),
        notes: coverLetter || '',
        statusHistory: [{
            status: 'pending',
            changedAt: Date.now(),
            changedBy: hustlerId,
            reason: 'Initial application'
        }]
    });
    await bid.save();

    job.bids.push(bid._id);
    await job.save();

    // Create notification for job creator
    await createNotification({
        recipient: job.createdBy,
        sender: hustlerId,
        job: jobId,
        type: 'job_application',
        price: Number(price)
    });

    res.status(201).json({ 
        message: 'Application submitted successfully! The job giver will be notified.',
        bid 
    });
});

// Get My Applications (for hustlers)
const getMyApplications = asyncHandler(async (req, res) => {
    if (req.user.role !== 'Hustler') {
        return res.status(403).json({ message: 'Access denied.' });
    }
    const applications = await Bid.find({ hustler: req.user._id })
      .populate('job')
      .sort({ createdAt: -1 });

    res.json({ applications });
});

// Update Job Status
const updateJobStatus = asyncHandler(async (req, res) => {
    const { id: jobId } = req.params;
    const { status } = req.body;
    const job = await Job.findById(jobId).populate('createdBy', 'name email');

    if (!job) return res.status(404).json({ message: 'Job not found.' });

    // Check if user is the job creator
    if (!job.createdBy._id.equals(req.user._id)) {
        return res.status(403).json({ message: 'Not authorized to update this job.' });
    }
    
    job.status = status;
    await job.save();

    res.json({ message: `Job status updated to ${status}`, job });
});

// Accept a Bid
const acceptBid = asyncHandler(async (req, res) => {
    const { jobId, bidId } = req.params;
    const job = await Job.findById(jobId).populate('bids');
    if (!job) return res.status(404).json({ message: 'Job not found.' });
    if (job.createdBy.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized.' });

    const bid = await Bid.findById(bidId);
    if (!bid) return res.status(404).json({ message: 'Bid not found.' });

    // Reject all other bids
    const otherBids = job.bids.filter(b => b._id.toString() !== bidId);
    for (const otherBid of otherBids) {
        await Bid.findByIdAndUpdate(otherBid._id, { status: 'rejected' });
    }

    // Accept the selected bid
    bid.status = 'accepted';
    await bid.save();

    // Update job status
    job.status = 'in-progress';
    job.assignedTo = bid.hustler;
    await job.save();

    await createNotification({
        recipient: bid.hustler,
        sender: req.user._id,
        job: jobId,
        type: 'bid_accepted',
    });

    res.json({ message: 'Bid accepted successfully.' });
});

// Reject a Bid
const rejectBid = asyncHandler(async (req, res) => {
    const { jobId, bidId } = req.params;
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found.' });
    if (job.createdBy.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized.' });
    
    const bid = await Bid.findByIdAndUpdate(bidId, { status: 'rejected' }, { new: true });
    if (!bid) return res.status(404).json({ message: 'Bid not found.' });

    await createNotification({
        recipient: bid.hustler,
        sender: req.user._id,
        job: jobId,
        type: 'bid_rejected',
    });

    res.json({ message: 'Bid rejected.', bid });
});

module.exports = {
    createJob,
    getAllJobs,
    getMyJobs,
    getJobById,
    applyForJob,
    getMyApplications,
    updateJobStatus,
    acceptBid,
    rejectBid,
    getJobApplications,
};
