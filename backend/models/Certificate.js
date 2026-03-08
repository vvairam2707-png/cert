const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
    {
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        category: {
            type: String,
            enum: ['sports', 'hackathon', 'workshop', 'online'],
            required: true,
        },
        title: { type: String, required: true, trim: true },
        date: { type: Date, required: true },
        fileUrl: { type: String, required: true },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        adminNote: { type: String, default: '' },

        // Additions requested by user
        yearSem: { type: String },
        eventName: { type: String },
        venue: { type: String },
        place: { type: String },

        // Sports fields
        sportName: { type: String },
        competitionLevel: { type: String, enum: ['College', 'State', 'National', ''] },
        position: { type: String, enum: ['Winner', 'Runner', 'Participant', ''] },

        // Hackathon fields
        hackathonName: { type: String },
        organizer: { type: String },
        teamMembers: { type: String },
        projectName: { type: String },

        // Workshop fields
        workshopName: { type: String },
        workshopOrganizer: { type: String },
        duration: { type: String },

        // Online course fields
        platform: { type: String },
        courseName: { type: String },
        courseDuration: { type: String },
        learningMode: { type: String, enum: ['Online', 'Offline', ''] },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Certificate', certificateSchema);
