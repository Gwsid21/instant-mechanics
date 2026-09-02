const { faker } = require('@faker-js/faker');
const Booking = require('../models/Booking');
const Mechanic = require('../models/Mechanic');
const Customer = require('../models/Customer');
const { SERVICE_CATEGORIES } = require('../models/Booking');
const {
  emitBookingCreated,
  emitBookingUpdated,
  emitMechanicUpdated,
} = require('../sockets');

const NEXT_STATUS = {
  pending: 'assigned',
  assigned: 'on_the_way',
  on_the_way: 'completed',
};

async function nextBookingCode() {
  const last = await Booking.findOne().sort({ createdAt: -1 }).select('bookingCode');
  const lastNum = last ? parseInt(last.bookingCode.split('-')[1], 10) : 10000;
  return `IM-${lastNum + 1}`;
}

// Moves a handful of in-flight bookings one step forward in their lifecycle.
// This is what makes "Pending -> Assigned -> On The Way -> Completed" happen
// live on screen without anyone clicking a button.
async function tickAdvanceBookings() {
  const inFlight = await Booking.find({
    status: { $in: ['pending', 'assigned', 'on_the_way'] },
  })
    .limit(40)
    .lean();

  if (!inFlight.length) return;

  const sample = faker.helpers.arrayElements(
    inFlight,
    Math.min(3, inFlight.length)
  );

  for (const b of sample) {
    const target = NEXT_STATUS[b.status];
    if (!target) continue;

    const update = { status: target, $push: { statusHistory: { status: target, at: new Date() } } };
    if (target === 'completed') update.completedAt = new Date();

    // Assign a mechanic the first time a pending booking is picked up.
    let mechanicId = b.mechanic;
    if (target === 'assigned' && !mechanicId) {
      const freeMechanic = await Mechanic.findOne({
        status: 'available',
        city: b.city,
      });
      if (freeMechanic) {
        mechanicId = freeMechanic._id;
        update.mechanic = mechanicId;
        freeMechanic.status = 'on_job';
        freeMechanic.currentBookingId = b._id;
        await freeMechanic.save();
        emitMechanicUpdated(freeMechanic.toObject());
      }
    }

    const updated = await Booking.findByIdAndUpdate(b._id, update, { new: true })
      .populate('customer', 'name email phone city')
      .populate('mechanic', 'name status rating')
      .lean();

    if (updated) emitBookingUpdated(updated);

    if (target === 'completed' && mechanicId) {
      const mechanic = await Mechanic.findById(mechanicId);
      if (mechanic) {
        mechanic.status = 'available';
        mechanic.jobsCompleted += 1;
        mechanic.currentBookingId = null;
        await mechanic.save();
        emitMechanicUpdated(mechanic.toObject());
      }
    }
  }
}

// Occasionally creates a brand new incoming booking, like a customer
// booking a service live through the app.
async function tickCreateBooking() {
  const customersCount = await Customer.countDocuments();
  if (!customersCount) return;

  const randomCustomer = await Customer.aggregate([{ $sample: { size: 1 } }]);
  const customer = randomCustomer[0];
  if (!customer) return;

  const bookingCode = await nextBookingCode();

  const booking = await Booking.create({
    bookingCode,
    customer: customer._id,
    vehicle: {
      make: faker.vehicle.manufacturer(),
      model: faker.vehicle.model(),
      plate: faker.vehicle.vrm(),
    },
    service: {
      category: faker.helpers.arrayElement(SERVICE_CATEGORIES),
      notes: '',
    },
    status: 'pending',
    amount: faker.number.int({ min: 800, max: 12000 }),
    scheduledAt: new Date(),
    city: customer.city,
    statusHistory: [{ status: 'pending', at: new Date() }],
  });

  await Customer.findByIdAndUpdate(customer._id, {
    $inc: { totalBookings: 1, totalSpend: booking.amount },
  });

  const populated = await booking.populate([
    { path: 'customer', select: 'name email phone city' },
    { path: 'mechanic', select: 'name status rating' },
  ]);

  emitBookingCreated(populated.toObject());
}

function startSimulator({ advanceIntervalMs = 6000, createIntervalMs = 15000 } = {}) {
  const advanceTimer = setInterval(() => {
    tickAdvanceBookings().catch((e) => console.error('[simulator] advance error', e));
  }, advanceIntervalMs);

  const createTimer = setInterval(() => {
    tickCreateBooking().catch((e) => console.error('[simulator] create error', e));
  }, createIntervalMs);

  console.log('[simulator] live booking simulator started');

  return () => {
    clearInterval(advanceTimer);
    clearInterval(createTimer);
  };
}

module.exports = { startSimulator };
