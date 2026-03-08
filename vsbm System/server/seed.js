/**
 * VSBM Database Seed Script
 * Run: cd server && node seed.js
 * 
 * This will:
 * 1. Drop all existing collections
 * 2. Create sample users (customers, providers, admin)
 * 3. Create vehicles, services, bookings, reviews, discounts, issues, communications
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

// --- Models ---
const User = require('./models/User');
const Vehicle = require('./models/Vehicle');
const Service = require('./models/Service');
const Booking = require('./models/Booking');
const Review = require('./models/Review');
const Discount = require('./models/Discount');
const Issue = require('./models/Issue');
const Communication = require('./models/Communication');
const Invoice = require('./models/Invoice');
const FAQ = require('./models/FAQ');
const OTP = require('./models/OTP');

const seedDB = async () => {
    try {
        // --- Connect ---
        const mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) {
            console.error('❌ MONGODB_URI not set in .env');
            process.exit(1);
        }

        await mongoose.connect(mongoURI);
        console.log('✅ Connected to MongoDB');

        // --- Drop all collections ---
        const collections = await mongoose.connection.db.listCollections().toArray();
        for (const col of collections) {
            await mongoose.connection.db.dropCollection(col.name);
            console.log(`  🗑️  Dropped: ${col.name}`);
        }
        console.log('✅ All collections cleared\n');

        // =====================================================
        // 1. USERS
        // =====================================================
        const password = await bcrypt.hash('password123', 12);

        const users = await User.insertMany([
            // Customers
            {
                name: 'Naveen Kumar',
                email: 'naveen@customer.com',
                password,
                phone: '9876543210',
                userType: 'customer',
                isVerified: true,
                isActive: true,
                address: { street: '123 MG Road', city: 'Bangalore', state: 'Karnataka', zipCode: '560001' }
            },
            {
                name: 'Priya Sharma',
                email: 'priya@customer.com',
                password,
                phone: '9876543211',
                userType: 'customer',
                isVerified: true,
                isActive: true,
                address: { street: '45 Anna Nagar', city: 'Chennai', state: 'Tamil Nadu', zipCode: '600040' }
            },
            {
                name: 'Rahul Verma',
                email: 'rahul@customer.com',
                password,
                phone: '9876543212',
                userType: 'customer',
                isVerified: true,
                isActive: true,
                address: { street: '78 Jubilee Hills', city: 'Hyderabad', state: 'Telangana', zipCode: '500033' }
            },
            // Service Providers
            {
                name: 'AutoCare Plus',
                email: 'autocare@provider.com',
                password,
                phone: '9876543220',
                userType: 'serviceProvider',
                businessName: 'AutoCare Plus Service Center',
                description: 'Premium vehicle service center with 10+ years of experience. We specialize in all makes and models.',
                licenseNumber: 'LIC-AC-2024-001',
                gstNumber: 'GST29AABCU9603R1ZA',
                isVerified: true,
                isActive: true,
                rating: 4.8,
                totalReviews: 3,
                amenities: ['WiFi', 'Waiting Lounge', 'Pickup & Drop', 'CCTV', 'Genuine Parts'],
                servicesOffered: ['Full Service', 'Oil Change', 'AC Service', 'Battery Check', 'Engine Tuning'],
                businessHours: {
                    monday: { open: '08:00', close: '19:00', isClosed: false },
                    tuesday: { open: '08:00', close: '19:00', isClosed: false },
                    wednesday: { open: '08:00', close: '19:00', isClosed: false },
                    thursday: { open: '08:00', close: '19:00', isClosed: false },
                    friday: { open: '08:00', close: '19:00', isClosed: false },
                    saturday: { open: '09:00', close: '17:00', isClosed: false },
                    sunday: { open: '00:00', close: '00:00', isClosed: true },
                },
                address: { street: '55 Koramangala 4th Block', city: 'Bangalore', state: 'Karnataka', zipCode: '560034', coordinates: { lat: 12.9352, lng: 77.6245 } }
            },
            {
                name: 'Quick Fix Garage',
                email: 'quickfix@provider.com',
                password,
                phone: '9876543221',
                userType: 'serviceProvider',
                businessName: 'Quick Fix Automobile Garage',
                description: 'Fast, reliable and affordable automobile repair services. Expert mechanics for all vehicle types.',
                licenseNumber: 'LIC-QF-2024-002',
                gstNumber: 'GST29BBCDE9603R2ZB',
                isVerified: true,
                isActive: true,
                rating: 4.5,
                totalReviews: 2,
                amenities: ['WiFi', 'Parking', 'Genuine Parts', 'Warranty'],
                servicesOffered: ['Brake Service', 'Tire Change', 'Engine Repair', 'Denting & Painting'],
                businessHours: {
                    monday: { open: '09:00', close: '20:00', isClosed: false },
                    tuesday: { open: '09:00', close: '20:00', isClosed: false },
                    wednesday: { open: '09:00', close: '20:00', isClosed: false },
                    thursday: { open: '09:00', close: '20:00', isClosed: false },
                    friday: { open: '09:00', close: '20:00', isClosed: false },
                    saturday: { open: '09:00', close: '18:00', isClosed: false },
                    sunday: { open: '10:00', close: '15:00', isClosed: false },
                },
                address: { street: '12 HSR Layout', city: 'Bangalore', state: 'Karnataka', zipCode: '560102', coordinates: { lat: 12.9116, lng: 77.6389 } }
            },
            {
                name: 'SpeedWheels Motors',
                email: 'speedwheels@provider.com',
                password,
                phone: '9876543222',
                userType: 'serviceProvider',
                businessName: 'SpeedWheels Motors Pvt Ltd',
                description: 'Authorized multi-brand service center. Factory-trained technicians and state-of-the-art diagnostics.',
                licenseNumber: 'LIC-SW-2024-003',
                gstNumber: 'GST29CCDEF9603R3ZC',
                isVerified: true,
                isActive: true,
                rating: 4.6,
                totalReviews: 1,
                amenities: ['WiFi', 'Waiting Lounge', 'CCTV', 'Genuine Parts', 'Pick & Drop', 'Car Wash'],
                servicesOffered: ['General Service', 'AC Service', 'Transmission', 'Electrical', 'Inspection'],
                businessHours: {
                    monday: { open: '08:30', close: '18:30', isClosed: false },
                    tuesday: { open: '08:30', close: '18:30', isClosed: false },
                    wednesday: { open: '08:30', close: '18:30', isClosed: false },
                    thursday: { open: '08:30', close: '18:30', isClosed: false },
                    friday: { open: '08:30', close: '18:30', isClosed: false },
                    saturday: { open: '09:00', close: '16:00', isClosed: false },
                    sunday: { open: '00:00', close: '00:00', isClosed: true },
                },
                address: { street: '88 Indiranagar', city: 'Bangalore', state: 'Karnataka', zipCode: '560038', coordinates: { lat: 12.9716, lng: 77.6412 } }
            },
            // Admin
            {
                name: 'System Admin',
                email: 'admin@vsbm.com',
                password,
                phone: '9876543200',
                userType: 'admin',
                isVerified: true,
                isActive: true,
                address: { city: 'Bangalore', state: 'Karnataka' }
            }
        ]);

        const [naveen, priya, rahul, autocare, quickfix, speedwheels, admin] = users;
        console.log(`👤 Created ${users.length} users`);

        // =====================================================
        // 2. VEHICLES
        // =====================================================
        const vehicles = await Vehicle.insertMany([
            {
                customerId: naveen._id,
                vehicleType: 'Car',
                make: 'Honda',
                model: 'City',
                year: 2021,
                registrationNumber: 'KA01AB1234',
                color: 'White',
                transmission: 'Manual',
                fuelType: 'Petrol',
                engineCapacity: '1498cc',
                odometerKm: 35000,
                isPrimary: true
            },
            {
                customerId: naveen._id,
                vehicleType: 'Bike',
                make: 'Royal Enfield',
                model: 'Classic 350',
                year: 2022,
                registrationNumber: 'KA01CD5678',
                color: 'Black',
                transmission: 'Manual',
                fuelType: 'Petrol',
                engineCapacity: '349cc',
                odometerKm: 12000,
                isPrimary: false
            },
            {
                customerId: priya._id,
                vehicleType: 'Car',
                make: 'Hyundai',
                model: 'Creta',
                year: 2023,
                registrationNumber: 'TN01EF9012',
                color: 'Silver',
                transmission: 'Automatic',
                fuelType: 'Diesel',
                engineCapacity: '1493cc',
                odometerKm: 18000,
                isPrimary: true
            },
            {
                customerId: rahul._id,
                vehicleType: 'Car',
                make: 'Maruti Suzuki',
                model: 'Swift',
                year: 2020,
                registrationNumber: 'TS01GH3456',
                color: 'Red',
                transmission: 'Manual',
                fuelType: 'Petrol',
                engineCapacity: '1197cc',
                odometerKm: 42000,
                isPrimary: true
            }
        ]);
        console.log(`🚗 Created ${vehicles.length} vehicles`);

        // =====================================================
        // 3. SERVICES
        // =====================================================
        const services = await Service.insertMany([
            // AutoCare Plus
            { serviceProviderId: autocare._id, name: 'Full Service', description: 'Complete vehicle checkup — oil, filters, brakes, fluid top-up, and 30-point inspection', category: 'General Service', basePrice: 3999, estimatedDuration: '4-5 hours', vehicleTypes: ['Car'], isActive: true },
            { serviceProviderId: autocare._id, name: 'Oil Change', description: 'Engine oil replacement with premium synthetic oil and filter change', category: 'Oil Change', basePrice: 1299, estimatedDuration: '45 min', vehicleTypes: ['Car', 'Bike'], isActive: true },
            { serviceProviderId: autocare._id, name: 'AC Service & Gas Refill', description: 'Complete AC system inspection, cleaning, and refrigerant refill', category: 'AC Service', basePrice: 2499, estimatedDuration: '2-3 hours', vehicleTypes: ['Car'], isActive: true },
            { serviceProviderId: autocare._id, name: 'Battery Check & Replacement', description: 'Battery health check, terminal cleaning, and replacement if needed', category: 'Battery Service', basePrice: 499, estimatedDuration: '30 min', vehicleTypes: ['Car', 'Bike'], isActive: true },
            // Quick Fix Garage
            { serviceProviderId: quickfix._id, name: 'Brake Pad Replacement', description: 'Front and rear brake pad inspection and replacement with genuine parts', category: 'Brake Service', basePrice: 1899, estimatedDuration: '1-2 hours', vehicleTypes: ['Car'], isActive: true },
            { serviceProviderId: quickfix._id, name: 'Tire Rotation & Balancing', description: 'All four tire rotation, balancing, and pressure check', category: 'Tire Service', basePrice: 799, estimatedDuration: '1 hour', vehicleTypes: ['Car'], isActive: true },
            { serviceProviderId: quickfix._id, name: 'Engine Diagnostic', description: 'Full engine diagnostic scan with OBD2 scanner and fault code analysis', category: 'Engine Repair', basePrice: 999, estimatedDuration: '1 hour', vehicleTypes: ['Car', 'Truck'], isActive: true },
            { serviceProviderId: quickfix._id, name: 'Denting & Painting', description: 'Professional dent removal and panel painting with factory-grade paint', category: 'Denting & Painting', basePrice: 4999, estimatedDuration: '2-3 days', vehicleTypes: ['Car'], isActive: true },
            // SpeedWheels Motors
            { serviceProviderId: speedwheels._id, name: 'Premium Service Package', description: 'Complete premium service with engine flush, AC check, all-fluid change, and detailing', category: 'General Service', basePrice: 6999, estimatedDuration: '6-8 hours', vehicleTypes: ['Car'], isActive: true },
            { serviceProviderId: speedwheels._id, name: 'Transmission Service', description: 'Automatic/Manual transmission oil change and inspection', category: 'Transmission', basePrice: 3499, estimatedDuration: '3-4 hours', vehicleTypes: ['Car'], isActive: true },
            { serviceProviderId: speedwheels._id, name: 'Electrical System Check', description: 'Full electrical system diagnosis — lights, sensors, wiring, and ECU scan', category: 'Electrical', basePrice: 1499, estimatedDuration: '1-2 hours', vehicleTypes: ['Car', 'Truck'], isActive: true },
            { serviceProviderId: speedwheels._id, name: 'Pre-Purchase Inspection', description: 'Comprehensive 150-point vehicle inspection for used car buyers', category: 'Inspection', basePrice: 1999, estimatedDuration: '2-3 hours', vehicleTypes: ['Car'], isActive: true }
        ]);
        console.log(`🛠️  Created ${services.length} services`);

        // =====================================================
        // 4. BOOKINGS
        // =====================================================
        const now = new Date();
        const daysAgo = (d) => new Date(now.getTime() - d * 86400000);

        const bookings = await Booking.insertMany([
            // Booking 1: Completed (Naveen → AutoCare)
            {
                customerId: naveen._id,
                serviceProviderId: autocare._id,
                vehicleId: vehicles[0]._id,
                vehicleDetails: { make: 'Honda', model: 'City', registrationNumber: 'KA01AB1234', year: 2021 },
                serviceType: 'Full Service',
                services: [{ serviceId: services[0]._id, serviceName: 'Full Service', quantity: 1, unitPrice: 3999, lineTotal: 3999 }],
                preferredDate: daysAgo(15),
                confirmedDate: daysAgo(14),
                status: 'completed',
                estimatedCost: 3999,
                finalCost: 4299,
                paymentStatus: 'paid',
                statusHistory: [
                    { status: 'pending', timestamp: daysAgo(15), notes: 'Booking created' },
                    { status: 'accepted', timestamp: daysAgo(14), notes: 'Confirmed by provider' },
                    { status: 'vehiclePickedUp', timestamp: daysAgo(13), notes: 'Vehicle received at center' },
                    { status: 'underService', timestamp: daysAgo(13), notes: 'Service started' },
                    { status: 'qualityCheck', timestamp: daysAgo(12), notes: 'Quality check in progress' },
                    { status: 'readyForDelivery', timestamp: daysAgo(12), notes: 'Ready for pickup' },
                    { status: 'completed', timestamp: daysAgo(11), notes: 'Service completed successfully' }
                ]
            },
            // Booking 2: Under Service (Naveen → Quick Fix)
            {
                customerId: naveen._id,
                serviceProviderId: quickfix._id,
                vehicleId: vehicles[0]._id,
                vehicleDetails: { make: 'Honda', model: 'City', registrationNumber: 'KA01AB1234', year: 2021 },
                serviceType: 'Brake Pad Replacement',
                services: [{ serviceId: services[4]._id, serviceName: 'Brake Pad Replacement', quantity: 1, unitPrice: 1899, lineTotal: 1899 }],
                preferredDate: daysAgo(3),
                confirmedDate: daysAgo(2),
                status: 'underService',
                estimatedCost: 1899,
                paymentStatus: 'pending',
                statusHistory: [
                    { status: 'pending', timestamp: daysAgo(3), notes: 'Booking created' },
                    { status: 'accepted', timestamp: daysAgo(2), notes: 'Accepted' },
                    { status: 'underService', timestamp: daysAgo(1), notes: 'Service in progress' }
                ]
            },
            // Booking 3: Pending (Priya → AutoCare)
            {
                customerId: priya._id,
                serviceProviderId: autocare._id,
                vehicleId: vehicles[2]._id,
                vehicleDetails: { make: 'Hyundai', model: 'Creta', registrationNumber: 'TN01EF9012', year: 2023 },
                serviceType: 'AC Service & Gas Refill',
                services: [{ serviceId: services[2]._id, serviceName: 'AC Service & Gas Refill', quantity: 1, unitPrice: 2499, lineTotal: 2499 }],
                preferredDate: daysAgo(0),
                status: 'pending',
                estimatedCost: 2499,
                paymentStatus: 'pending',
                statusHistory: [
                    { status: 'pending', timestamp: daysAgo(0), notes: 'Booking created' }
                ]
            },
            // Booking 4: Completed (Priya → Quick Fix)
            {
                customerId: priya._id,
                serviceProviderId: quickfix._id,
                vehicleId: vehicles[2]._id,
                vehicleDetails: { make: 'Hyundai', model: 'Creta', registrationNumber: 'TN01EF9012', year: 2023 },
                serviceType: 'Tire Rotation & Balancing',
                services: [{ serviceId: services[5]._id, serviceName: 'Tire Rotation & Balancing', quantity: 1, unitPrice: 799, lineTotal: 799 }],
                preferredDate: daysAgo(20),
                confirmedDate: daysAgo(19),
                status: 'completed',
                estimatedCost: 799,
                finalCost: 799,
                paymentStatus: 'paid',
                statusHistory: [
                    { status: 'pending', timestamp: daysAgo(20), notes: 'Booking created' },
                    { status: 'accepted', timestamp: daysAgo(19), notes: 'Confirmed' },
                    { status: 'underService', timestamp: daysAgo(18), notes: 'Service started' },
                    { status: 'completed', timestamp: daysAgo(18), notes: 'Completed same day' }
                ]
            },
            // Booking 5: Issues Identified (Rahul → SpeedWheels)
            {
                customerId: rahul._id,
                serviceProviderId: speedwheels._id,
                vehicleId: vehicles[3]._id,
                vehicleDetails: { make: 'Maruti Suzuki', model: 'Swift', registrationNumber: 'TS01GH3456', year: 2020 },
                serviceType: 'Premium Service Package',
                services: [{ serviceId: services[8]._id, serviceName: 'Premium Service Package', quantity: 1, unitPrice: 6999, lineTotal: 6999 }],
                preferredDate: daysAgo(5),
                confirmedDate: daysAgo(4),
                status: 'issuesIdentified',
                estimatedCost: 6999,
                paymentStatus: 'pending',
                statusHistory: [
                    { status: 'pending', timestamp: daysAgo(5), notes: 'Booking created' },
                    { status: 'accepted', timestamp: daysAgo(4), notes: 'Confirmed' },
                    { status: 'underService', timestamp: daysAgo(3), notes: 'Service started' },
                    { status: 'issuesIdentified', timestamp: daysAgo(2), notes: 'Additional issues found during inspection' }
                ]
            },
            // Booking 6: Completed (Rahul → AutoCare)
            {
                customerId: rahul._id,
                serviceProviderId: autocare._id,
                vehicleId: vehicles[3]._id,
                vehicleDetails: { make: 'Maruti Suzuki', model: 'Swift', registrationNumber: 'TS01GH3456', year: 2020 },
                serviceType: 'Oil Change',
                services: [{ serviceId: services[1]._id, serviceName: 'Oil Change', quantity: 1, unitPrice: 1299, lineTotal: 1299 }],
                preferredDate: daysAgo(30),
                confirmedDate: daysAgo(29),
                status: 'completed',
                estimatedCost: 1299,
                finalCost: 1299,
                paymentStatus: 'paid',
                statusHistory: [
                    { status: 'pending', timestamp: daysAgo(30), notes: 'Booking created' },
                    { status: 'accepted', timestamp: daysAgo(29), notes: 'Confirmed' },
                    { status: 'underService', timestamp: daysAgo(28), notes: 'Started' },
                    { status: 'completed', timestamp: daysAgo(28), notes: 'Completed' }
                ]
            }
        ]);
        console.log(`📅 Created ${bookings.length} bookings`);

        // =====================================================
        // 5. REVIEWS
        // =====================================================
        await Review.insertMany([
            {
                bookingId: bookings[0]._id,
                customerId: naveen._id,
                providerId: autocare._id,
                rating: 5,
                title: 'Excellent service!',
                comment: 'Very thorough inspection and professional service. The team was transparent about the costs and completed on time. Highly recommended!',
                isVerified: true
            },
            {
                bookingId: bookings[3]._id,
                customerId: priya._id,
                providerId: quickfix._id,
                rating: 4,
                title: 'Quick and efficient',
                comment: 'Got my tires rotated and balanced quickly. Fair pricing and good communication throughout.',
                isVerified: true
            },
            {
                bookingId: bookings[5]._id,
                customerId: rahul._id,
                providerId: autocare._id,
                rating: 5,
                title: 'Best oil change service',
                comment: 'Used premium synthetic oil and the car feels so much smoother now. Great value for money.',
                isVerified: true,
                providerReply: 'Thank you, Rahul! We always recommend the best for your vehicle. See you next time!',
                providerReplyAt: daysAgo(25)
            }
        ]);
        console.log('⭐ Created 3 reviews');

        // =====================================================
        // 6. ISSUES
        // =====================================================
        await Issue.insertMany([
            {
                bookingId: bookings[4]._id,
                reportedBy: speedwheels._id,
                issueTitle: 'Worn Brake Pads',
                issueDescription: 'Front brake pads are worn down to 15%. Recommend immediate replacement for safety.',
                issueType: 'Safety',
                severity: 'Major',
                estimatedAdditionalCost: 2500,
                estimatedDurationAddedMin: 60,
                issueStatus: 'pending_approval'
            },
            {
                bookingId: bookings[4]._id,
                reportedBy: speedwheels._id,
                issueTitle: 'Coolant Leak Detected',
                issueDescription: 'Minor coolant leak found near the radiator hose. Needs hose replacement.',
                issueType: 'Fluid',
                severity: 'Moderate',
                estimatedAdditionalCost: 1800,
                estimatedDurationAddedMin: 45,
                issueStatus: 'pending_approval'
            }
        ]);
        console.log('🔧 Created 2 issues');

        // =====================================================
        // 7. COMMUNICATIONS
        // =====================================================
        await Communication.insertMany([
            // Booking 2 (Naveen + Quick Fix)
            {
                bookingId: bookings[1]._id,
                senderId: naveen._id,
                senderRole: 'customer',
                message: 'Hi, how long will the brake pad replacement take?',
                isRead: true,
                readAt: daysAgo(2),
                timestamp: daysAgo(2)
            },
            {
                bookingId: bookings[1]._id,
                senderId: quickfix._id,
                senderRole: 'serviceProvider',
                message: 'Hello Naveen! It usually takes 1-2 hours. We have started the work and will update you soon.',
                isRead: true,
                readAt: daysAgo(2),
                timestamp: daysAgo(2)
            },
            {
                bookingId: bookings[1]._id,
                senderId: quickfix._id,
                senderRole: 'serviceProvider',
                message: 'Update: Your brake pads have been replaced. Currently doing a test drive to ensure everything is smooth.',
                isRead: false,
                timestamp: daysAgo(1)
            },
            // Booking 5 (Rahul + SpeedWheels)
            {
                bookingId: bookings[4]._id,
                senderId: speedwheels._id,
                senderRole: 'serviceProvider',
                message: 'Hi Rahul, during the inspection we found some additional issues. Please check the issues section and approve/decline.',
                isRead: true,
                readAt: daysAgo(1),
                timestamp: daysAgo(2)
            },
            {
                bookingId: bookings[4]._id,
                senderId: rahul._id,
                senderRole: 'customer',
                message: 'Thanks for letting me know. I will review the issues and get back to you.',
                isRead: true,
                readAt: daysAgo(1),
                timestamp: daysAgo(1)
            }
        ]);
        console.log('💬 Created 5 communications');

        // =====================================================
        // 8. DISCOUNTS
        // =====================================================
        await Discount.insertMany([
            {
                serviceProviderId: autocare._id,
                discountCode: 'WELCOME20',
                title: 'Welcome Discount',
                description: '20% off on your first service booking at AutoCare Plus',
                discountType: 'percentage',
                discountValue: 20,
                maxDiscountAmount: 1000,
                validFrom: daysAgo(30),
                validUntil: new Date(now.getTime() + 60 * 86400000),
                maxUsageCount: 100,
                currentUsageCount: 12,
                isActive: true,
                termsAndConditions: 'Valid for first-time customers only. Maximum discount ₹1000.'
            },
            {
                serviceProviderId: quickfix._id,
                discountCode: 'QUICKSAVE',
                title: 'Quick Save Deal',
                description: 'Flat ₹500 off on any service above ₹2000',
                discountType: 'fixed',
                discountValue: 500,
                minBookingAmount: 2000,
                validFrom: daysAgo(10),
                validUntil: new Date(now.getTime() + 30 * 86400000),
                maxUsageCount: 50,
                currentUsageCount: 5,
                isActive: true,
                termsAndConditions: 'Minimum booking amount ₹2000. Cannot be combined with other offers.'
            },
            {
                serviceProviderId: speedwheels._id,
                discountCode: 'PREMIUM15',
                title: 'Premium Service Discount',
                description: '15% off on Premium Service Package',
                discountType: 'percentage',
                discountValue: 15,
                maxDiscountAmount: 1500,
                validFrom: daysAgo(5),
                validUntil: new Date(now.getTime() + 45 * 86400000),
                isActive: true,
                termsAndConditions: 'Valid on Premium Service Package only.'
            }
        ]);
        console.log('🏷️  Created 3 discounts');

        // =====================================================
        // 9. FAQs
        // =====================================================
        await FAQ.insertMany([
            { serviceProviderId: autocare._id, question: 'How long does a full service take?', answer: 'A comprehensive full service typically takes 4-5 hours depending on the vehicle condition.', category: 'Service', displayOrder: 1 },
            { serviceProviderId: autocare._id, question: 'Do you provide pickup and drop service?', answer: 'Yes, we offer free pickup and drop within 10km radius of our service center.', category: 'General', displayOrder: 2 },
            { serviceProviderId: quickfix._id, question: 'What warranty do you provide?', answer: 'We provide 6 months or 10,000 km warranty on all repair work.', category: 'Warranty', displayOrder: 1 },
        ]);
        console.log('❓ Created 3 FAQs');

        // =====================================================
        // DONE — Print Summary
        // =====================================================
        console.log('\n' + '='.repeat(60));
        console.log('✨ DATABASE SEEDED SUCCESSFULLY');
        console.log('='.repeat(60));
        console.log('\n📋 Login Credentials (password: password123 for all):');
        console.log('─'.repeat(60));
        console.log('│ Role              │ Email                    │');
        console.log('─'.repeat(60));
        console.log('│ Customer          │ naveen@customer.com      │');
        console.log('│ Customer          │ priya@customer.com       │');
        console.log('│ Customer          │ rahul@customer.com       │');
        console.log('│ Service Provider  │ autocare@provider.com    │');
        console.log('│ Service Provider  │ quickfix@provider.com    │');
        console.log('│ Service Provider  │ speedwheels@provider.com │');
        console.log('│ Admin             │ admin@vsbm.com           │');
        console.log('─'.repeat(60));
        console.log('\n📊 Data Summary:');
        console.log(`   Users:          ${users.length}`);
        console.log(`   Vehicles:       ${vehicles.length}`);
        console.log(`   Services:       ${services.length}`);
        console.log(`   Bookings:       ${bookings.length}`);
        console.log(`   Reviews:        3`);
        console.log(`   Issues:         2`);
        console.log(`   Communications: 5`);
        console.log(`   Discounts:      3`);
        console.log(`   FAQs:           3`);
        console.log('');

        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
};

seedDB();
