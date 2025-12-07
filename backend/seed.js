require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const users = [
    {
        name: 'Admin User',
        email: 'hire-me@anshumat.org',
        password: 'HireMe@2025!',
        role: 'admin',
        employeeCode: 'ADM001',
        department: 'Management'
    },
    {
        name: 'John Doe',
        email: 'john.doe@company.com',
        password: 'Employee@2025!',
        role: 'employee',
        employeeCode: 'EMP001',
        department: 'Engineering'
    },
    {
        name: 'Jane Smith',
        email: 'jane.smith@company.com',
        password: 'Employee@2025!',
        role: 'employee',
        employeeCode: 'EMP002',
        department: 'Design'
    }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        await User.deleteMany({});
        console.log('Cleared users');

        for (const data of users) {
            const user = new User(data);
            await user.save();
            console.log(`Created: ${user.email} (${user.role})`);
        }

        console.log('\nSeeding complete!');
        console.log('\nCredentials:');
        console.log('Admin: hire-me@anshumat.org / HireMe@2025!');
        console.log('Employee: john.doe@company.com / Employee@2025!');

        process.exit(0);
    } catch (err) {
        console.error('Seed error:', err.message);
        process.exit(1);
    }
}

seed();
