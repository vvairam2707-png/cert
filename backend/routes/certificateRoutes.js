const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

// @route POST /api/certificates  — Upload certificate
router.post('/', protect, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'Certificate file is required' });

        const {
            category, title, date,
            yearSem, eventName, venue, place,
            sportName, competitionLevel, position,
            hackathonName, organizer, teamMembers, projectName,
            workshopName, workshopOrganizer, duration,
            platform, courseName, courseDuration,
        } = req.body;

        if (!category || !title || !date) {
            return res.status(400).json({ message: 'Category, title, and date are required' });
        }

        const fileUrl = req.file.path;

        const cert = await Certificate.create({
            student: req.user._id,
            category, title, date, fileUrl,
            yearSem, eventName, venue, place,
            sportName, competitionLevel, position,
            hackathonName, organizer, teamMembers, projectName,
            workshopName, workshopOrganizer, duration,
            platform, courseName, courseDuration,
        });

        const populated = await cert.populate('student', 'name regNo email department');
        res.status(201).json(populated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route GET /api/certificates  — Student: own certs; Admin: all
router.get('/', protect, async (req, res) => {
    try {
        const filter = req.user.role === 'admin' ? {} : { student: req.user._id };
        if (req.query.category) filter.category = req.query.category;
        if (req.query.status) filter.status = req.query.status;

        const certs = await Certificate.find(filter)
            .populate('student', 'name regNo email department')
            .sort({ createdAt: -1 });

        res.json(certs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route GET /api/certificates/:id
router.get('/:id', protect, async (req, res) => {
    try {
        const cert = await Certificate.findById(req.params.id)
            .populate('student', 'name regNo email department');

        if (!cert) return res.status(404).json({ message: 'Certificate not found' });

        // Students can only view their own
        if (req.user.role !== 'admin' && cert.student._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(cert);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route PUT /api/certificates/:id  — Student edits own cert
router.put('/:id', protect, upload.single('file'), async (req, res) => {
    try {
        const cert = await Certificate.findById(req.params.id);
        if (!cert) return res.status(404).json({ message: 'Certificate not found' });

        if (cert.student.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const {
            title, date, category,
            yearSem, eventName, venue, place,
            sportName, competitionLevel, position,
            hackathonName, organizer, teamMembers, projectName,
            workshopName, workshopOrganizer, duration,
            platform, courseName, courseDuration,
        } = req.body;

        // If new file uploaded, update fileUrl
        if (req.file) {
            cert.fileUrl = req.file.path;
        }

        cert.title = title || cert.title;
        cert.date = date || cert.date;
        cert.category = category || cert.category;
        cert.yearSem = yearSem !== undefined ? yearSem : cert.yearSem;
        cert.eventName = eventName !== undefined ? eventName : cert.eventName;
        cert.venue = venue !== undefined ? venue : cert.venue;
        cert.place = place !== undefined ? place : cert.place;
        cert.sportName = sportName !== undefined ? sportName : cert.sportName;
        cert.competitionLevel = competitionLevel !== undefined ? competitionLevel : cert.competitionLevel;
        cert.position = position !== undefined ? position : cert.position;
        cert.hackathonName = hackathonName !== undefined ? hackathonName : cert.hackathonName;
        cert.organizer = organizer !== undefined ? organizer : cert.organizer;
        cert.teamMembers = teamMembers !== undefined ? teamMembers : cert.teamMembers;
        cert.projectName = projectName !== undefined ? projectName : cert.projectName;
        cert.workshopName = workshopName !== undefined ? workshopName : cert.workshopName;
        cert.workshopOrganizer = workshopOrganizer !== undefined ? workshopOrganizer : cert.workshopOrganizer;
        cert.duration = duration !== undefined ? duration : cert.duration;
        cert.platform = platform !== undefined ? platform : cert.platform;
        cert.courseName = courseName !== undefined ? courseName : cert.courseName;
        cert.courseDuration = courseDuration !== undefined ? courseDuration : cert.courseDuration;
        cert.status = 'pending'; // Reset to pending after edit

        await cert.save();
        const updated = await cert.populate('student', 'name regNo email department');
        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route DELETE /api/certificates/:id
router.delete('/:id', protect, async (req, res) => {
    try {
        const cert = await Certificate.findById(req.params.id);
        if (!cert) return res.status(404).json({ message: 'Certificate not found' });

        if (cert.student.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Delete file logic (optional: Cloudinary delete could be done here if needed)
        // const filePath = path.join(__dirname, '..', cert.fileUrl);
        // if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        await cert.deleteOne();
        res.json({ message: 'Certificate deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
