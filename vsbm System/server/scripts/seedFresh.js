const mongoose = require('mongoose');
const User = require('../models/User');
const Service = require('../models/Service');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/vsbm';

async function seedFresh() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('📦 Connected to MongoDB');

        // 1. Create Customer (skip if exists)
        let customer = await User.findOne({ email: 'test@example.com' });
        if (!customer) {
            customer = await User.create({
                name: "Test Customer",
                email: "test@example.com",
                password: "password123",
                phone: "9000000001",
                userType: "customer",
            });
            console.log('✅ Created Customer: test@example.com / password123');
        } else {
            console.log('⏭️  Customer test@example.com already exists');
        }

        // 2. Create Provider (skip if exists)
        let provider = await User.findOne({ email: 'provider@example.com' });
        if (!provider) {
            provider = await User.create({
                name: "AutoFix Premium Center",
                email: "provider@example.com",
                password: "password123",
                phone: "9000000002",
                userType: "serviceProvider",
                businessName: "AutoFix Premium Center",
                address: {
                    street: "123 Tech Park Road",
                    city: "Bangalore",
                    state: "Karnataka",
                    pincode: "560100"
                },
                description: "Premium vehicle service center with expert technicians.",
                isVerified: true,
            });
            console.log('✅ Created Provider: provider@example.com / password123');
        } else {
            console.log('⏭️  Provider provider@example.com already exists');
        }

        // 3. Create Services for Provider
        const existingServices = await Service.find({ serviceProviderId: provider._id });
        if (existingServices.length === 0) {
            await Service.create([
                {
                    serviceProviderId: provider._id,
                    name: "General Service",
                    description: "Complete vehicle checkup, oil change, and filter replacement.",
                    basePrice: 1999,
                    category: "General Service",
                    vehicleTypes: ["Car", "Bike"],
                    estimatedDuration: "2 hours",
                    isActive: true,
                },
                {
                    serviceProviderId: provider._id,
                    name: "Car Wash & Detailing",
                    description: "Exterior foam wash and interior vacuum cleaning.",
                    basePrice: 599,
                    category: "Other",
                    vehicleTypes: ["Car"],
                    estimatedDuration: "1 hour",
                    isActive: true,
                },
                {
                    serviceProviderId: provider._id,
                    name: "Brake Repair",
                    description: "Inspection and replacement of brake pads and discs.",
                    basePrice: 1500,
                    category: "Brake Service",
                    vehicleTypes: ["Car", "Bike"],
                    estimatedDuration: "1.5 hours",
                    isActive: true,
                },
            ]);
            console.log('✅ Created 3 Services for provider');
        } else {
            console.log(`⏭️  Provider already has ${existingServices.length} services`);
        }

        console.log('\n🎉 Seed complete!\n');
        console.log('Customer Login: test@example.com / password123');
        console.log('Provider Login: provider@example.com / password123');

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed error:', err.message);
        await mongoose.disconnect();
        process.exit(1);
    }
}

seedFresh();
