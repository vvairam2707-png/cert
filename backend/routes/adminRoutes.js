const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// @route PATCH /api/admin/certificates/:id/status  — Approve/Reject
router.patch('/certificates/:id/status', protect, adminOnly, async (req, res) => {
    try {
        const { status, adminNote } = req.body;
        if (!['approved', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const cert = await Certificate.findById(req.params.id);
        if (!cert) return res.status(404).json({ message: 'Certificate not found' });

        cert.status = status;
        if (adminNote !== undefined) cert.adminNote = adminNote;
        await cert.save();

        const updated = await cert.populate('student', 'name regNo email department phone');
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route GET /api/admin/stats  — Dashboard stats
router.get('/stats', protect, adminOnly, async (req, res) => {
    try {
        const total = await Certificate.countDocuments();
        const pending = await Certificate.countDocuments({ status: 'pending' });
        const approved = await Certificate.countDocuments({ status: 'approved' });
        const rejected = await Certificate.countDocuments({ status: 'rejected' });

        const sports = await Certificate.countDocuments({ category: 'sports' });
        const hackathon = await Certificate.countDocuments({ category: 'hackathon' });
        const workshop = await Certificate.countDocuments({ category: 'workshop' });
        const online = await Certificate.countDocuments({ category: 'online' });

        const totalStudents = await User.countDocuments({ role: 'student' });

        res.json({
            total, pending, approved, rejected,
            categories: { sports, hackathon, workshop, online },
            totalStudents,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route GET /api/admin/students  — All students list
router.get('/students', protect, adminOnly, async (req, res) => {
    try {
        const students = await User.find({ role: 'student' }).select('-password').sort({ createdAt: -1 });
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route GET /api/admin/students/:id/certificates  — Student achievements
router.get('/students/:id/certificates', protect, adminOnly, async (req, res) => {
    try {
        const certs = await Certificate.find({ student: req.params.id })
            .populate('student', 'name regNo email department phone')
            .sort({ createdAt: -1 });
        res.json(certs);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route DELETE /api/admin/certificates/:id  — Admin delete
router.delete('/certificates/:id', protect, adminOnly, async (req, res) => {
    try {
        const cert = await Certificate.findById(req.params.id);
        if (!cert) return res.status(404).json({ message: 'Certificate not found' });

        const path = require('path');
        const fs = require('fs');
        const filePath = path.join(__dirname, '..', cert.fileUrl);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        await cert.deleteOne();
        res.json({ message: 'Certificate deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route DELETE /api/admin/students/:id  — Admin delete student
router.delete('/students/:id', protect, adminOnly, async (req, res) => {
    try {
        const student = await User.findById(req.params.id);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        // Find all certificates of this student
        const certs = await Certificate.find({ student: req.params.id });

        // Delete all certificate files
        const path = require('path');
        const fs = require('fs');
        for (const cert of certs) {
            const filePath = path.join(__dirname, '..', cert.fileUrl);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        // Delete all certificates
        await Certificate.deleteMany({ student: req.params.id });

        // Delete student
        await student.deleteOne();
        res.json({ message: 'Student and all associated data deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
