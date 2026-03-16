/**
 * Local JSON Database Helper
 * Used when MongoDB is unavailable
 */

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/db.json');

// Initialize empty db if doesn't exist
if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({
        users: [],
        services: [],
        bookings: [],
        invoices: []
    }, null, 2));
}

const readDB = () => {
    try {
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading database:', error);
        return { users: [], services: [], bookings: [], invoices: [] };
    }
};

const writeDB = (data) => {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing database:', error);
        return false;
    }
};

// Helper functions
const generateId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const localDB = {
    // Users
    findUserByEmail: (email) => {
        const db = readDB();
        return db.users.find(u => u.email === email);
    },

    findUserById: (id) => {
        const db = readDB();
        return db.users.find(u => u._id === id);
    },

    createUser: (userData) => {
        const db = readDB();
        const newUser = {
            _id: generateId('user'),
            ...userData,
            createdAt: new Date().toISOString()
        };
        db.users.push(newUser);
        writeDB(db);
        return newUser;
    },

    // Services
    getAllServices: () => {
        const db = readDB();
        return db.services.filter(s => s.isActive);
    },

    getServicesByProvider: (providerId) => {
        const db = readDB();
        return db.services.filter(s => s.providerId === providerId && s.isActive);
    },

    getServiceById: (id) => {
        const db = readDB();
        return db.services.find(s => s._id === id);
    },

    createService: (serviceData) => {
        const db = readDB();
        const newService = {
            _id: generateId('service'),
            ...serviceData,
            isActive: true,
            createdAt: new Date().toISOString()
        };
        db.services.push(newService);
        writeDB(db);
        return newService;
    },

    // Bookings
    getBookingsByCustomer: (customerId) => {
        const db = readDB();
        return db.bookings.filter(b => b.customerId === customerId);
    },

    getBookingsByProvider: (providerId) => {
        const db = readDB();
        return db.bookings.filter(b => b.providerId === providerId);
    },

    getBookingById: (id) => {
        const db = readDB();
        return db.bookings.find(b => b._id === id);
    },

    createBooking: (bookingData) => {
        const db = readDB();
        const newBooking = {
            _id: generateId('booking'),
            ...bookingData,
            status: 'pending',
            stage: 1,
            createdAt: new Date().toISOString()
        };
        db.bookings.push(newBooking);
        writeDB(db);
        return newBooking;
    },

    updateBookingStage: (id, stage, status) => {
        const db = readDB();
        const index = db.bookings.findIndex(b => b._id === id);
        if (index !== -1) {
            db.bookings[index].stage = stage;
            if (status) db.bookings[index].status = status;
            if (stage === 8) {
                db.bookings[index].completedDate = new Date().toISOString();
            }
            writeDB(db);
            return db.bookings[index];
        }
        return null;
    },

    // Invoices
    getInvoicesByCustomer: (customerId) => {
        const db = readDB();
        return db.invoices.filter(i => i.customerId === customerId);
    },

    createInvoice: (invoiceData) => {
        const db = readDB();
        const newInvoice = {
            _id: generateId('invoice'),
            invoiceNumber: `INV-${new Date().getFullYear()}-${String(db.invoices.length + 1).padStart(3, '0')}`,
            ...invoiceData,
            createdAt: new Date().toISOString()
        };
        db.invoices.push(newInvoice);
        writeDB(db);
        return newInvoice;
    },

    // Providers (users with userType: serviceProvider)
    getAllProviders: () => {
        const db = readDB();
        return db.users.filter(u => u.userType === 'serviceProvider');
    },

    // Get enriched bookings with service and provider details
    getEnrichedBookings: (customerId) => {
        const db = readDB();
        const bookings = db.bookings.filter(b => b.customerId === customerId);

        return bookings.map(booking => {
            const service = db.services.find(s => s._id === booking.serviceId) || {};
            const provider = db.users.find(u => u._id === booking.providerId) || {};

            return {
                ...booking,
                service: {
                    name: service.name,
                    price: service.price,
                    description: service.description
                },
                provider: {
                    businessName: provider.businessName || provider.name,
                    address: provider.address,
                    phone: provider.phone
                }
            };
        });
    }
};

module.exports = localDB;
