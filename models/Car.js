const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
    brand: { type: String, required: true },
    model: { type: String, required: true },
    ownerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    licensePlate: { type: String, required: true, unique: true },
    pricePerDay: { type: Number, required: true },
    pricePerHour: { type: Number, required: true },
    status: {
        type: String,
        enum: ['PENDING_APPROVAL', 'AVAILABLE', 'RENTED', 'MAINTENANCE'],
        default: 'AVAILABLE'
    },
    image: { type: String, required: true },
    seats: { type: Number, default: 4 },
    transmission: { type: String, default: 'Tự động' },
    fuelType: { type: String, default: 'Xăng' },
    description: { type: String },

    ownerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }
}, { timestamps: true });

module.exports = mongoose.model('Car', carSchema);