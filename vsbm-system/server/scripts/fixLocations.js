const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    await User.updateOne(
        { businessName: 'AutoCare Plus Service Center' },
        { $set: {
            'address.street': '12, Avinashi Road, Peelamedu',
            'address.city': 'Coimbatore',
            'address.state': 'Tamil Nadu',
            'address.zipCode': '641004',
            'address.coordinates.lat': 11.0254,
            'address.coordinates.lng': 76.9660,
        }}
    );
    console.log('AutoCare -> Coimbatore');

    await User.updateOne(
        { businessName: 'Quick Fix Automobile Garage' },
        { $set: {
            'address.street': '78, Trichy Road, Singanallur',
            'address.city': 'Coimbatore',
            'address.state': 'Tamil Nadu',
            'address.zipCode': '641005',
            'address.coordinates.lat': 10.9932,
            'address.coordinates.lng': 76.9692,
        }}
    );
    console.log('Quick Fix -> Coimbatore');

    await User.updateOne(
        { businessName: 'SpeedWheels Motors Pvt Ltd' },
        { $set: {
            'address.street': '55, Sathyamangalam Road, Ganapathy',
            'address.city': 'Coimbatore',
            'address.state': 'Tamil Nadu',
            'address.zipCode': '641006',
            'address.coordinates.lat': 11.0412,
            'address.coordinates.lng': 76.9475,
        }}
    );
    console.log('SpeedWheels -> Coimbatore');

    // Also set coords for providers that don't have them
    const noCoords = await User.find({
        userType: 'serviceProvider',
        $or: [
            { 'address.coordinates.lat': { $exists: false } },
            { 'address.coordinates.lat': null },
        ]
    });
    for (const p of noCoords) {
        await User.updateOne({ _id: p._id }, { $set: {
            'address.coordinates.lat': 11.0168 + (Math.random() - 0.5) * 0.05,
            'address.coordinates.lng': 76.9558 + (Math.random() - 0.5) * 0.05,
            'address.city': p.address?.city || 'Coimbatore',
            'address.state': p.address?.state || 'Tamil Nadu',
        }});
        console.log(`Set coords for: ${p.businessName || p.name}`);
    }

    await mongoose.disconnect();
    console.log('Done');
});
