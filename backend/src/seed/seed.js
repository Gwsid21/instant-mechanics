require('dotenv').config();
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const connectDB = require('../config/db');
const Customer = require('../models/Customer');
const Mechanic = require('../models/Mechanic');
const Booking = require('../models/Booking');
const { SERVICE_CATEGORIES, BOOKING_STATUSES } = require('../models/Booking');
const { MECHANIC_STATUSES } = require('../models/Mechanic');

const CITIES = ['Delhi', 'Gurgaon', 'Noida', 'Mumbai', 'Bengaluru', 'Pune'];
const SPECIALTIES = [
  'Engine',
  'Brakes',
  'Electrical',
  'AC',
  'Tyres',
  'Bodywork',
  'Transmission',
];

const NUM_CUSTOMERS = 60;
const NUM_MECHANICS = 24;
const NUM_BOOKINGS = 560;

// Weighted so the dashboard has a realistic mix, not an even split.
const STATUS_WEIGHTS = [
  { value: 'completed', weight: 55 },
  { value: 'pending', weight: 15 },
  { value: 'assigned', weight: 10 },
  { value: 'on_the_way', weight: 8 },
  { value: 'cancelled', weight: 12 },
];

function weightedStatus() {
  return faker.helpers.weightedArrayElement(STATUS_WEIGHTS);
}

async function run() {
  await connectDB();

  console.log('[seed] clearing existing collections...');
  await Promise.all([
    Customer.deleteMany({}),
    Mechanic.deleteMany({}),
    Booking.deleteMany({}),
  ]);

  console.log(`[seed] creating ${NUM_CUSTOMERS} customers...`);
  const customers = await Customer.insertMany(
    Array.from({ length: NUM_CUSTOMERS }).map(() => ({
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      phone: faker.phone.number('9#########'),
      city: faker.helpers.arrayElement(CITIES),
      joinedAt: faker.date.past({ years: 2 }),
      totalBookings: 0,
      totalSpend: 0,
    }))
  );

  console.log(`[seed] creating ${NUM_MECHANICS} mechanics...`);
  const mechanics = await Mechanic.insertMany(
    Array.from({ length: NUM_MECHANICS }).map(() => ({
      name: faker.person.fullName(),
      avatarSeed: faker.string.uuid(),
      specialties: faker.helpers.arrayElements(SPECIALTIES, { min: 1, max: 3 }),
      status: faker.helpers.arrayElement(MECHANIC_STATUSES),
      rating: faker.number.float({ min: 3.5, max: 5, fractionDigits: 1 }),
      jobsCompleted: faker.number.int({ min: 5, max: 400 }),
      city: faker.helpers.arrayElement(CITIES),
      joinedAt: faker.date.past({ years: 3 }),
      location: {
        lat: faker.location.latitude({ min: 12, max: 30 }),
        lng: faker.location.longitude({ min: 72, max: 88 }),
      },
    }))
  );

  console.log(`[seed] creating ${NUM_BOOKINGS} bookings...`);
  const bookingDocs = [];
  for (let i = 0; i < NUM_BOOKINGS; i++) {
    const customer = faker.helpers.arrayElement(customers);
    const status = weightedStatus();
    const scheduledAt = faker.date.between({
      from: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      to: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    });
    // Skew scheduledAt toward the last 60 days for a believable "over time" chart.
    const createdAt = faker.date.recent({ days: 60 });

        const needsMechanic = ['assigned', 'on_the_way', 'completed'].includes(status);
    const cityMechanics = mechanics.filter((m) => m.city === customer.city);
    const mechanic = needsMechanic
      ? faker.helpers.arrayElement(cityMechanics.length ? cityMechanics : mechanics)
      : null;

    const amount = faker.number.int({ min: 500, max: 15000 });
    const completedAt = status === 'completed'
      ? faker.date.soon({ days: 1, refDate: createdAt })
      : null;

    bookingDocs.push({
      bookingCode: `IM-${10001 + i}`,
      customer: customer._id,
      mechanic: mechanic ? mechanic._id : null,
      vehicle: {
        make: faker.vehicle.manufacturer(),
        model: faker.vehicle.model(),
        plate: faker.vehicle.vrm(),
      },
      service: {
        category: faker.helpers.arrayElement(SERVICE_CATEGORIES),
        notes: faker.datatype.boolean(0.3) ? faker.lorem.sentence() : '',
      },
      status,
      amount,
      scheduledAt,
      completedAt,
      city: customer.city,
      createdAt,
      statusHistory: [{ status, at: createdAt }],
    });
  }

  // insertMany respects createdAt only if timestamps option allows override;
  // Booking schema uses {timestamps:true} which sets createdAt automatically,
  // so we set it explicitly per-doc after insert for realistic historical spread.
  const inserted = await Booking.insertMany(bookingDocs);
  await Promise.all(
    inserted.map((doc, i) =>
      Booking.updateOne(
        { _id: doc._id },
        { $set: { createdAt: bookingDocs[i].createdAt } }
      )
    )
  );

  console.log('[seed] backfilling customer totals...');
  for (const customer of customers) {
    const theirBookings = inserted.filter(
      (b) => String(b.customer) === String(customer._id)
    );
    const totalSpend = theirBookings
      .filter((b) => b.status === 'completed')
      .reduce((sum, b) => sum + b.amount, 0);
    await Customer.updateOne(
      { _id: customer._id },
      { $set: { totalBookings: theirBookings.length, totalSpend } }
    );
  }

  console.log('[seed] backfilling mechanic job counts from seeded bookings...');
  for (const mechanic of mechanics) {
    const theirJobs = inserted.filter(
      (b) => String(b.mechanic) === String(mechanic._id) && b.status === 'completed'
    );
    if (theirJobs.length) {
      await Mechanic.updateOne(
        { _id: mechanic._id },
        { $inc: { jobsCompleted: theirJobs.length } }
      );
    }
  }

  console.log(
    `[seed] done: ${customers.length} customers, ${mechanics.length} mechanics, ${inserted.length} bookings`
  );
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
