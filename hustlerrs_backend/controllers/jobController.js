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
 * 
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
    try {
        // Debug: print the incoming request body
        console.log('REQ.BODY:', JSON.stringify(req.body, null, 2));
        
        // Check user role
        if (req.user.role !== 'Job Giver') {
            return res.status(403).json({ message: 'Only job givers can create jobs.' });
        }

        const { title, jobType, location, date, startTime, duration, payment, hiringType, contactInfo } = req.body;

        // Validate required fields
        if (!title || !jobType || !location?.division || !location?.district || !location?.upazila || !location?.address || !location?.area || !date || !startTime || !duration || !payment?.method || !payment?.platform || !hiringType || !contactInfo?.phone) {
            return res.status(400).json({ message: 'Please provide all required job fields.' });
        }

        // Validate payment data
        if (payment.method === 'Fixed price' && (!payment.amount || payment.amount <= 0)) {
            return res.status(400).json({ message: 'Fixed price payment requires a valid amount.' });
        }
        if (payment.method === 'Hourly' && (!payment.rate || payment.rate <= 0)) {
            return res.status(400).json({ message: 'Hourly payment requires a valid rate.' });
        }

        // Validate location against location_db.json
        if (!validateLocation(location.division, location.district, location.upazila)) {
            return res.status(400).json({ message: 'Invalid division, district, or upazila provided.' });
        }

        // Create new job instance with properly structured data
        const jobData = {
            title,
            description: req.body.description || '',
            jobType,
            // Flatten location fields
            locationDivision: location.division,
            locationDistrict: location.district,
            locationUpazila: location.upazila,
            locationArea: location.area,
            locationAddress: location.address,
            date: new Date(date),
            startTime,
            duration,
            payment: {
                method: payment.method,
                amount: payment.method === 'Fixed price' ? payment.amount : undefined,
                rate: payment.method === 'Hourly' ? payment.rate : undefined,
                platform: payment.platform
            },
            hiringType,
            skillRequirements: req.body.skillRequirements || ['No skill needed'],
            workerPreference: {
                gender: req.body.workerPreference?.gender || 'Any',
                ageRange: req.body.workerPreference?.ageRange || 'Any',
                studentOnly: req.body.workerPreference?.studentOnly ?? true,
                experience: req.body.workerPreference?.experience || 'None'
            },
            photos: req.body.photos || [],
            contactInfo: {
                phone: contactInfo.phone,
                email: contactInfo.email || ''
            },
            createdBy: req.user._id,
            status: 'open'
        };

        const newJob = new Job(jobData);

        // Validate the job data
        const validationError = newJob.validateSync();
        if (validationError) {
            console.error('Validation Error:', validationError);
            return res.status(400).json({ 
                message: 'Validation failed', 
                errors: Object.values(validationError.errors).map(err => err.message)
            });
        }

        // Save the job
        await newJob.save();
        res.status(201).json({ message: 'Job created successfully!', job: newJob });
    } catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({ 
            message: 'Failed to create job', 
            error: error.message 
        });
    }
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
    try {
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
            division,
            search = ''
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

        // Add text search if provided
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { jobType: { $regex: search, $options: 'i' } }
            ];
        }

        // Add location filters - updated to match the flattened schema
        if (division) {
            query.locationDivision = division;
        }
        if (district) {
            query.locationDistrict = district;
        }
        if (upazila) {
            query.locationUpazila = upazila;
        }
        if (area) {
            query.locationArea = area;
        }

        // Add other filters
        if (jobType) query.jobType = { $in: jobType.split(',') };
        if (maxPay) {
            query.$or = [
                { 'payment.amount': { $lte: parseInt(maxPay, 10) } },
                { 'payment.rate': { $lte: parseInt(maxPay, 10) } }
            ];
        }
        if (date) query.date = { $gte: new Date(date) };
        if (noSkillNeeded === 'true') {
            query.skillRequirements = { $in: ['No skill needed'] };
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
            .populate('createdBy', 'fullName email')
            .populate('bids')
            .populate({ 
                path: 'bids', 
                select: 'hustler status price notes createdAt',
                populate: { 
                    path: 'hustler', 
                    select: '_id fullName email profilePicture' 
                } 
            })
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
    } catch (error) {
        console.error('Error in getJobs:', error);
        res.status(500).json({ 
            message: 'Failed to fetch jobs', 
            error: error.message 
        });
    }
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

const acceptJob = asyncHandler(async (req, res) => {
    const { jobId } = req.params;
    console.log('Debug - Accepting job:', jobId);
    console.log('Debug - User:', req.user._id);

    const job = await Job.findById(jobId);
    
    if (!job) {
        return res.status(404).json({ message: 'Job not found' });
    }

    if (job.status !== 'pending') {
        return res.status(400).json({ message: 'Job is not available for acceptance' });
    }

    // Update job status and assign hustler
    job.status = 'in-progress';
    job.acceptedHustler = req.user._id;
    await job.save();

    console.log('Debug - Updated job:', job);

    // Create notification for job creator
    await createNotification({
        recipient: job.createdBy,
        type: 'JOB_ACCEPTED',
        message: `Your job "${job.title}" has been accepted by a hustler`,
        relatedJob: jobId
    });

    res.json({ 
        message: 'Job accepted successfully',
        job: await Job.findById(jobId)
            .populate('createdBy', 'fullName email')
            .populate('acceptedHustler', 'fullName email')
    });
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
    acceptJob
};
