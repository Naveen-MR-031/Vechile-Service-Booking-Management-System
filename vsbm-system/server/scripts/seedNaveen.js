/**
 * Seed script: Add real customer "Naveen M R" with full profile,
 * vehicles, completed bookings, reviews, invoices, etc.
 * 
 * Run: cd server && node scripts/seedNaveen.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Invoice = require('../models/Invoice');
const Communication = require('../models/Communication');
const Service = require('../models/Service');

const run = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Find or update the customer "Naveen M R"
    let customer = await User.findOne({ email: 'naveeniswarya11223@gmail.com' });
    if (!customer) {
        console.log('❌ Customer not found. Creating...');
        const password = await bcrypt.hash('password123', 12);
        customer = await User.create({
            name: 'Naveen M R',
            email: 'naveeniswarya11223@gmail.com',
            password,
            phone: '9876501234',
            userType: 'customer',
            isVerified: true,
            isActive: true,
            profileImage: '',
            address: {
                street: '42, Rajaji Nagar 2nd Stage',
                city: 'Coimbatore',
                state: 'Tamil Nadu',
                zipCode: '641028',
                coordinates: { lat: 11.0168, lng: 76.9558 }
            },
            theme: 'dark',
            lastLogin: new Date(),
        });
        console.log('✅ Created customer:', customer.name);
    } else {
        // Update profile fields
        customer.name = 'Naveen M R';
        customer.phone = customer.phone || '9876501234';
        customer.isVerified = true;
        customer.isActive = true;
        customer.address = {
            street: '42, Rajaji Nagar 2nd Stage',
            city: 'Coimbatore',
            state: 'Tamil Nadu',
            zipCode: '641028',
            coordinates: { lat: 11.0168, lng: 76.9558 }
        };
        customer.theme = 'dark';
        customer.lastLogin = new Date();
        await customer.save({ validateModifiedOnly: true });
        console.log('✅ Updated customer:', customer.name);
    }

    // 2. Find existing service providers (use whatever exists)
    const providers = await User.find({ userType: 'serviceProvider', isActive: true }).limit(3);
    if (providers.length === 0) {
        console.log('❌ No service providers found. Run the main seed first: node seed.js');
        process.exit(1);
    }
    console.log(`📋 Found ${providers.length} providers: ${providers.map(p => p.businessName || p.name).join(', ')}`);

    // 3. Get services for each provider
    const allServices = await Service.find({ isActive: true });
    console.log(`🛠️  Found ${allServices.length} services`);

    // 4. Create vehicles for Naveen
    // Remove existing vehicles to avoid duplicates
    await Vehicle.deleteMany({ customerId: customer._id });

    const vehicles = await Vehicle.insertMany([
        {
            customerId: customer._id,
            vehicleType: 'Car',
            make: 'Hyundai',
            model: 'i20',
            year: 2022,
            registrationNumber: 'TN38AZ7890',
            vin: 'MALBB51BLEM123456',
            color: 'Polar White',
            transmission: 'Manual',
            fuelType: 'Petrol',
            engineCapacity: '1197cc',
            odometerKm: 28500,
            isPrimary: true,
        },
        {
            customerId: customer._id,
            vehicleType: 'Bike',
            make: 'Royal Enfield',
            model: 'Hunter 350',
            year: 2023,
            registrationNumber: 'TN38BK4521',
            color: 'Rebel Black',
            transmission: 'Manual',
            fuelType: 'Petrol',
            engineCapacity: '349cc',
            odometerKm: 8200,
            isPrimary: false,
        },
        {
            customerId: customer._id,
            vehicleType: 'Car',
            make: 'Maruti Suzuki',
            model: 'Swift',
            year: 2020,
            registrationNumber: 'TN38CD1234',
            color: 'Solid Fire Red',
            transmission: 'Manual',
            fuelType: 'Petrol',
            engineCapacity: '1197cc',
            odometerKm: 52000,
            isPrimary: false,
        },
    ]);
    console.log(`🚗 Created ${vehicles.length} vehicles`);

    // 5. Remove old bookings/reviews/invoices/communications for this customer
    const oldBookings = await Booking.find({ customerId: customer._id }).select('_id');
    const oldBookingIds = oldBookings.map(b => b._id);
    await Review.deleteMany({ customerId: customer._id });
    await Invoice.deleteMany({ customerId: customer._id });
    await Communication.deleteMany({ bookingId: { $in: oldBookingIds } });
    await Booking.deleteMany({ customerId: customer._id });
    console.log('🗑️  Cleared old booking data');

    // 6. Create bookings with various statuses
    const now = new Date();
    const daysAgo = (d) => new Date(now.getTime() - d * 86400000);

    // Helper: get services for a provider
    const servicesFor = (providerId) => allServices.filter(s => s.serviceProviderId.toString() === providerId.toString());

    const p0 = providers[0]; // e.g. AutoCare Plus
    const p1 = providers[1] || providers[0]; // Quick Fix
    const p2 = providers[2] || providers[0]; // SpeedWheels

    const p0Services = servicesFor(p0._id);
    const p1Services = servicesFor(p1._id);
    const p2Services = servicesFor(p2._id);

    const bookingsData = [
        // 1. COMPLETED - Full Service (45 days ago)
        {
            customerId: customer._id,
            serviceProviderId: p0._id,
            vehicleId: vehicles[0]._id,
            vehicleDetails: { make: 'Hyundai', model: 'i20', registrationNumber: 'TN38AZ7890', year: 2022 },
            serviceType: p0Services[0]?.name || 'Full Service',
            services: [{ serviceId: p0Services[0]?._id, serviceName: p0Services[0]?.name || 'Full Service', quantity: 1, unitPrice: p0Services[0]?.basePrice || 3999, lineTotal: p0Services[0]?.basePrice || 3999 }],
            preferredDate: daysAgo(45),
            confirmedDate: daysAgo(44),
            dropOffDate: daysAgo(43),
            pickUpDate: daysAgo(41),
            status: 'completed',
            estimatedCost: p0Services[0]?.basePrice || 3999,
            finalCost: (p0Services[0]?.basePrice || 3999) + 300,
            paymentStatus: 'paid',
            paymentMethod: 'UPI',
            statusHistory: [
                { status: 'pending', timestamp: daysAgo(45), notes: 'Booking created' },
                { status: 'accepted', timestamp: daysAgo(44), notes: 'Confirmed by provider' },
                { status: 'vehiclePickedUp', timestamp: daysAgo(43), notes: 'Vehicle received at center' },
                { status: 'underService', timestamp: daysAgo(43), notes: 'Service started' },
                { status: 'qualityCheck', timestamp: daysAgo(42), notes: 'Quality check in progress' },
                { status: 'readyForDelivery', timestamp: daysAgo(41), notes: 'Ready for pickup' },
                { status: 'completed', timestamp: daysAgo(41), notes: 'Service completed - All checks passed' },
            ],
        },
        // 2. COMPLETED - Oil Change (30 days ago)
        {
            customerId: customer._id,
            serviceProviderId: p0._id,
            vehicleId: vehicles[0]._id,
            vehicleDetails: { make: 'Hyundai', model: 'i20', registrationNumber: 'TN38AZ7890', year: 2022 },
            serviceType: p0Services[1]?.name || 'Oil Change',
            services: [{ serviceId: p0Services[1]?._id, serviceName: p0Services[1]?.name || 'Oil Change', quantity: 1, unitPrice: p0Services[1]?.basePrice || 1299, lineTotal: p0Services[1]?.basePrice || 1299 }],
            preferredDate: daysAgo(30),
            confirmedDate: daysAgo(29),
            status: 'completed',
            estimatedCost: p0Services[1]?.basePrice || 1299,
            finalCost: p0Services[1]?.basePrice || 1299,
            paymentStatus: 'paid',
            paymentMethod: 'Cash',
            statusHistory: [
                { status: 'pending', timestamp: daysAgo(30), notes: 'Booking created' },
                { status: 'accepted', timestamp: daysAgo(29), notes: 'Accepted' },
                { status: 'underService', timestamp: daysAgo(29), notes: 'Started' },
                { status: 'completed', timestamp: daysAgo(29), notes: 'Completed same day' },
            ],
        },
        // 3. COMPLETED - Brake Service (20 days ago)
        {
            customerId: customer._id,
            serviceProviderId: p1._id,
            vehicleId: vehicles[2]._id,
            vehicleDetails: { make: 'Maruti Suzuki', model: 'Swift', registrationNumber: 'TN38CD1234', year: 2020 },
            serviceType: p1Services[0]?.name || 'Brake Pad Replacement',
            services: [{ serviceId: p1Services[0]?._id, serviceName: p1Services[0]?.name || 'Brake Pad Replacement', quantity: 1, unitPrice: p1Services[0]?.basePrice || 1899, lineTotal: p1Services[0]?.basePrice || 1899 }],
            preferredDate: daysAgo(20),
            confirmedDate: daysAgo(19),
            dropOffDate: daysAgo(18),
            pickUpDate: daysAgo(17),
            status: 'completed',
            estimatedCost: p1Services[0]?.basePrice || 1899,
            finalCost: (p1Services[0]?.basePrice || 1899) + 200,
            paymentStatus: 'paid',
            paymentMethod: 'UPI',
            statusHistory: [
                { status: 'pending', timestamp: daysAgo(20), notes: 'Booking created' },
                { status: 'accepted', timestamp: daysAgo(19), notes: 'Confirmed' },
                { status: 'vehiclePickedUp', timestamp: daysAgo(18), notes: 'Vehicle received' },
                { status: 'underService', timestamp: daysAgo(18), notes: 'Work started' },
                { status: 'qualityCheck', timestamp: daysAgo(17), notes: 'QC done' },
                { status: 'readyForDelivery', timestamp: daysAgo(17), notes: 'Ready' },
                { status: 'completed', timestamp: daysAgo(17), notes: 'Completed' },
            ],
        },
        // 4. COMPLETED - Tire Rotation (10 days ago)
        {
            customerId: customer._id,
            serviceProviderId: p1._id,
            vehicleId: vehicles[0]._id,
            vehicleDetails: { make: 'Hyundai', model: 'i20', registrationNumber: 'TN38AZ7890', year: 2022 },
            serviceType: p1Services[1]?.name || 'Tire Rotation & Balancing',
            services: [{ serviceId: p1Services[1]?._id, serviceName: p1Services[1]?.name || 'Tire Rotation & Balancing', quantity: 1, unitPrice: p1Services[1]?.basePrice || 799, lineTotal: p1Services[1]?.basePrice || 799 }],
            preferredDate: daysAgo(10),
            confirmedDate: daysAgo(9),
            status: 'completed',
            estimatedCost: p1Services[1]?.basePrice || 799,
            finalCost: p1Services[1]?.basePrice || 799,
            paymentStatus: 'paid',
            paymentMethod: 'Card',
            statusHistory: [
                { status: 'pending', timestamp: daysAgo(10), notes: 'Booking created' },
                { status: 'accepted', timestamp: daysAgo(9), notes: 'Accepted' },
                { status: 'underService', timestamp: daysAgo(9), notes: 'Started' },
                { status: 'completed', timestamp: daysAgo(9), notes: 'Completed' },
            ],
        },
        // 5. COMPLETED - Premium Service (5 days ago)
        {
            customerId: customer._id,
            serviceProviderId: p2._id,
            vehicleId: vehicles[0]._id,
            vehicleDetails: { make: 'Hyundai', model: 'i20', registrationNumber: 'TN38AZ7890', year: 2022 },
            serviceType: p2Services[0]?.name || 'Premium Service Package',
            services: [{ serviceId: p2Services[0]?._id, serviceName: p2Services[0]?.name || 'Premium Service Package', quantity: 1, unitPrice: p2Services[0]?.basePrice || 6999, lineTotal: p2Services[0]?.basePrice || 6999 }],
            preferredDate: daysAgo(5),
            confirmedDate: daysAgo(4),
            dropOffDate: daysAgo(4),
            pickUpDate: daysAgo(3),
            status: 'completed',
            estimatedCost: p2Services[0]?.basePrice || 6999,
            finalCost: p2Services[0]?.basePrice || 6999,
            paymentStatus: 'paid',
            paymentMethod: 'UPI',
            statusHistory: [
                { status: 'pending', timestamp: daysAgo(5), notes: 'Booking created' },
                { status: 'accepted', timestamp: daysAgo(4), notes: 'Accepted' },
                { status: 'vehiclePickedUp', timestamp: daysAgo(4), notes: 'Vehicle received' },
                { status: 'underService', timestamp: daysAgo(4), notes: 'Service in progress' },
                { status: 'qualityCheck', timestamp: daysAgo(3), notes: 'QC passed' },
                { status: 'readyForDelivery', timestamp: daysAgo(3), notes: 'Ready for delivery' },
                { status: 'completed', timestamp: daysAgo(3), notes: 'Completed successfully' },
            ],
        },
        // 6. UNDER SERVICE (Active - ongoing)
        {
            customerId: customer._id,
            serviceProviderId: p0._id,
            vehicleId: vehicles[1]._id,
            vehicleDetails: { make: 'Royal Enfield', model: 'Hunter 350', registrationNumber: 'TN38BK4521', year: 2023 },
            serviceType: p0Services[2]?.name || 'AC Service',
            services: [{ serviceId: p0Services[2]?._id, serviceName: p0Services[2]?.name || 'AC Service', quantity: 1, unitPrice: p0Services[2]?.basePrice || 2499, lineTotal: p0Services[2]?.basePrice || 2499 }],
            preferredDate: daysAgo(1),
            confirmedDate: daysAgo(0),
            status: 'underService',
            estimatedCost: p0Services[2]?.basePrice || 2499,
            paymentStatus: 'pending',
            statusHistory: [
                { status: 'pending', timestamp: daysAgo(1), notes: 'Booking created' },
                { status: 'accepted', timestamp: daysAgo(0), notes: 'Accepted by provider' },
                { status: 'underService', timestamp: daysAgo(0), notes: 'Service started' },
            ],
        },
        // 7. PENDING (Just booked)
        {
            customerId: customer._id,
            serviceProviderId: p2._id,
            vehicleId: vehicles[2]._id,
            vehicleDetails: { make: 'Maruti Suzuki', model: 'Swift', registrationNumber: 'TN38CD1234', year: 2020 },
            serviceType: p2Services[1]?.name || 'Transmission Service',
            services: [{ serviceId: p2Services[1]?._id, serviceName: p2Services[1]?.name || 'Transmission Service', quantity: 1, unitPrice: p2Services[1]?.basePrice || 3499, lineTotal: p2Services[1]?.basePrice || 3499 }],
            preferredDate: new Date(now.getTime() + 2 * 86400000), // 2 days from now
            status: 'pending',
            estimatedCost: p2Services[1]?.basePrice || 3499,
            paymentStatus: 'pending',
            statusHistory: [
                { status: 'pending', timestamp: now, notes: 'Booking created' },
            ],
        },
    ];

    const bookings = await Booking.insertMany(bookingsData);
    console.log(`📅 Created ${bookings.length} bookings`);

    // 7. Create reviews for completed bookings
    const completedBookings = bookings.filter(b => b.status === 'completed');
    const reviewsData = [
        {
            bookingId: completedBookings[0]._id,
            customerId: customer._id,
            providerId: completedBookings[0].serviceProviderId,
            rating: 5,
            title: 'Excellent full service!',
            comment: 'Very professional and thorough. They found and fixed issues I did not even know about. The car runs perfectly now. Will definitely come back!',
        },
        {
            bookingId: completedBookings[1]._id,
            customerId: customer._id,
            providerId: completedBookings[1].serviceProviderId,
            rating: 4,
            title: 'Quick oil change',
            comment: 'Got the oil change done same day. Used genuine synthetic oil. Good value for money.',
        },
        {
            bookingId: completedBookings[2]._id,
            customerId: customer._id,
            providerId: completedBookings[2].serviceProviderId,
            rating: 5,
            title: 'Brake service was perfect',
            comment: 'Brakes feel like new. Very transparent about pricing and showed me the old worn-out pads. Trustworthy service center.',
            providerReply: 'Thank you Naveen! Safety is our top priority. See you soon!',
            providerReplyAt: daysAgo(16),
        },
        {
            bookingId: completedBookings[3]._id,
            customerId: customer._id,
            providerId: completedBookings[3].serviceProviderId,
            rating: 4,
            title: 'Good tire service',
            comment: 'Rotation and balancing done quickly. Car handles much smoother on highways now.',
        },
        {
            bookingId: completedBookings[4]._id,
            customerId: customer._id,
            providerId: completedBookings[4].serviceProviderId,
            rating: 5,
            title: 'Premium service worth every penny',
            comment: 'The premium package covered everything. Engine flush, AC check, detailing — the car looked and felt brand new. Highly recommend!',
            providerReply: 'Thank you for choosing our premium package, Naveen! We aim for excellence every time.',
            providerReplyAt: daysAgo(2),
        },
    ];

    await Review.insertMany(reviewsData);
    console.log(`⭐ Created ${reviewsData.length} reviews`);

    // 8. Create invoices for completed bookings
    const invoicesData = completedBookings.map((b, i) => ({
        invoiceNumber: `INV-2026-${String(i + 1).padStart(4, '0')}`,
        bookingId: b._id,
        customerId: customer._id,
        serviceProviderId: b.serviceProviderId,
        invoiceDate: b.statusHistory[b.statusHistory.length - 1].timestamp,
        items: b.services.map(s => ({
            description: s.serviceName,
            quantity: s.quantity,
            unitPrice: s.unitPrice,
            totalPrice: s.lineTotal,
        })),
        subtotal: b.finalCost,
        taxAmount: Math.round(b.finalCost * 0.18),
        totalAmount: Math.round(b.finalCost * 1.18),
        paymentStatus: 'paid',
        amountPaid: Math.round(b.finalCost * 1.18),
    }));

    await Invoice.insertMany(invoicesData);
    console.log(`🧾 Created ${invoicesData.length} invoices`);

    // 9. Create some chat messages
    const commsData = [
        {
            bookingId: bookings[5]._id, // underService booking
            senderId: customer._id,
            senderRole: 'customer',
            message: 'Hi, how is the service going? Any updates?',
            isRead: true,
            readAt: new Date(),
            timestamp: daysAgo(0),
        },
        {
            bookingId: bookings[5]._id,
            senderId: p0._id,
            senderRole: 'serviceProvider',
            message: 'Hello Naveen! We have started the service. Currently doing the diagnosis. Will update you once we finish.',
            isRead: true,
            readAt: new Date(),
            timestamp: daysAgo(0),
        },
    ];

    await Communication.insertMany(commsData);
    console.log('💬 Created chat messages');

    // 10. Summary
    console.log('\n' + '='.repeat(60));
    console.log('✨ NAVEEN M R DATA SEEDED SUCCESSFULLY');
    console.log('='.repeat(60));
    console.log(`\n📋 Customer: ${customer.name} (${customer.email})`);
    console.log(`🚗 Vehicles: ${vehicles.length}`);
    console.log(`📅 Bookings: ${bookings.length} (${completedBookings.length} completed, 1 active, 1 pending)`);
    console.log(`⭐ Reviews: ${reviewsData.length}`);
    console.log(`🧾 Invoices: ${invoicesData.length}`);
    console.log(`💬 Messages: ${commsData.length}`);
    console.log(`\n📍 Location: Coimbatore, TN (11.0168, 76.9558)`);

    await mongoose.disconnect();
    console.log('\n✅ Done. Disconnected from MongoDB.');
};

run().catch(err => { console.error('❌ Error:', err); process.exit(1); });
