// Seeds the database with realistic demo data so the whole system can be
// explored (and screenshotted for a portfolio) in under a minute.
//
// Usage:  npm run seed          (from the backend/ folder, with MONGO_URI set)
//
// It is safe to re-run: it wipes and recreates the demo collections each time.

const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");

const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const Medicine = require("../models/Medicine");
const Appointment = require("../models/Appointment");
const Billing = require("../models/Billing");
const Notification = require("../models/Notification");
const Counter = require("../models/Counter");

const DEMO_PASSWORD = "Demo@1234";

const daysFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};

const run = async () => {
  await connectDB();
  console.log("Connected. Wiping existing demo collections...");

  await Promise.all([
    User.deleteMany({}),
    Doctor.deleteMany({}),
    Patient.deleteMany({}),
    Medicine.deleteMany({}),
    Appointment.deleteMany({}),
    Billing.deleteMany({}),
    Notification.deleteMany({}),
    Counter.deleteMany({}),
  ]);

  console.log("Creating users...");

  const admin = await User.create({
    name: "Amaya Perera",
    email: "admin@medicare.health",
    password: DEMO_PASSWORD,
    phone: "+94 77 123 4567",
    role: "admin",
    gender: "female",
    address: "12 Galle Road, Colombo 03",
  });

  const receptionist = await User.create({
    name: "Sanduni Fernando",
    email: "reception@medicare.health",
    password: DEMO_PASSWORD,
    phone: "+94 71 222 3344",
    role: "receptionist",
    gender: "female",
    address: "8 Kandy Road, Kadawatha",
  });

  const doctorSeeds = [
    {
      name: "Dr. Ruwan Jayasinghe",
      email: "ruwan.jayasinghe@medicare.health",
      specialization: "Cardiology",
      qualification: "MBBS, MD (Cardiology)",
      department: "Cardiology",
      experienceYears: 14,
      consultationFee: 4500,
      bio: "Specialist in interventional cardiology and heart failure management.",
    },
    {
      name: "Dr. Nadeesha Wickramasinghe",
      email: "nadeesha.w@medicare.health",
      specialization: "Pediatrics",
      qualification: "MBBS, DCH",
      department: "Pediatrics",
      experienceYears: 9,
      consultationFee: 3000,
      bio: "Focused on childhood development and vaccination care.",
    },
    {
      name: "Dr. Kasun Bandara",
      email: "kasun.bandara@medicare.health",
      specialization: "Orthopedics",
      qualification: "MBBS, MS (Ortho)",
      department: "Orthopedics",
      experienceYears: 11,
      consultationFee: 5000,
      bio: "Joint replacement and sports injury specialist.",
    },
    {
      name: "Dr. Ishara Gunawardena",
      email: "ishara.g@medicare.health",
      specialization: "Dermatology",
      qualification: "MBBS, MD (Dermatology)",
      department: "Dermatology",
      experienceYears: 7,
      consultationFee: 3500,
      bio: "Clinical and cosmetic dermatology.",
    },
  ];

  const availability = [
    { day: "Monday", startTime: "09:00", endTime: "13:00" },
    { day: "Wednesday", startTime: "09:00", endTime: "13:00" },
    { day: "Friday", startTime: "14:00", endTime: "17:00" },
  ];

  const doctors = [];
  for (const seed of doctorSeeds) {
    const user = await User.create({
      name: seed.name,
      email: seed.email,
      password: DEMO_PASSWORD,
      phone: "+94 76 555 " + Math.floor(1000 + Math.random() * 9000),
      role: "doctor",
      gender: "male",
    });
    const doctor = await Doctor.create({
      user: user._id,
      specialization: seed.specialization,
      qualification: seed.qualification,
      department: seed.department,
      experienceYears: seed.experienceYears,
      consultationFee: seed.consultationFee,
      bio: seed.bio,
      availability,
    });
    doctors.push(doctor);
  }

  const patientSeeds = [
    { name: "Tharindu Silva", email: "tharindu@example.com", bloodGroup: "O+" },
    { name: "Dilani Rathnayake", email: "dilani@example.com", bloodGroup: "A+" },
    { name: "Chamara De Silva", email: "chamara@example.com", bloodGroup: "B+" },
  ];

  const patients = [];
  const patientUsers = [];
  for (const seed of patientSeeds) {
    const user = await User.create({
      name: seed.name,
      email: seed.email,
      password: DEMO_PASSWORD,
      phone: "+94 70 444 " + Math.floor(1000 + Math.random() * 9000),
      role: "patient",
      gender: "male",
      address: "Colombo, Sri Lanka",
    });
    const patient = await Patient.create({
      user: user._id,
      bloodGroup: seed.bloodGroup,
      allergies: ["Penicillin"],
      emergencyContact: { name: "Family Contact", phone: "+94 70 000 0000", relation: "Sibling" },
    });
    patients.push(patient);
    patientUsers.push(user);
  }

  console.log("Creating medicines...");
  await Medicine.insertMany([
    {
      name: "Paracetamol 500mg",
      genericName: "Paracetamol",
      category: "Painkiller",
      batchNumber: "PCM-2301",
      unitPrice: 5,
      quantityInStock: 500,
      reorderLevel: 100,
      expiryDate: daysFromNow(300),
    },
    {
      name: "Amoxicillin 250mg",
      genericName: "Amoxicillin",
      category: "Antibiotic",
      batchNumber: "AMX-1187",
      unitPrice: 12,
      quantityInStock: 40,
      reorderLevel: 50,
      expiryDate: daysFromNow(180),
    },
    {
      name: "Cetirizine 10mg",
      genericName: "Cetirizine",
      category: "Antihistamine",
      batchNumber: "CTZ-0099",
      unitPrice: 8,
      quantityInStock: 15,
      reorderLevel: 30,
      expiryDate: daysFromNow(400),
    },
    {
      name: "Vitamin C 1000mg",
      genericName: "Ascorbic Acid",
      category: "Vitamin",
      batchNumber: "VTC-5521",
      unitPrice: 15,
      quantityInStock: 200,
      reorderLevel: 40,
      expiryDate: daysFromNow(500),
    },
  ]);

  console.log("Creating appointments...");
  const appointments = [];
  appointments.push(
    await Appointment.create({
      patient: patients[0]._id,
      doctor: doctors[0]._id,
      appointmentDate: daysFromNow(2),
      timeSlot: "09:00 - 09:30",
      reasonForVisit: "Routine heart checkup",
      status: "confirmed",
      createdBy: receptionist._id,
    })
  );
  appointments.push(
    await Appointment.create({
      patient: patients[1]._id,
      doctor: doctors[1]._id,
      appointmentDate: daysFromNow(-3),
      timeSlot: "09:30 - 10:00",
      reasonForVisit: "Child vaccination follow-up",
      status: "completed",
      notes: "Vaccination administered without complications.",
      createdBy: receptionist._id,
    })
  );
  appointments.push(
    await Appointment.create({
      patient: patients[2]._id,
      doctor: doctors[2]._id,
      appointmentDate: daysFromNow(5),
      timeSlot: "14:00 - 14:30",
      reasonForVisit: "Knee pain evaluation",
      status: "pending",
      createdBy: patientUsers[2]._id,
    })
  );

  console.log("Creating an invoice...");
  const items = [
    { description: "Consultation Fee", quantity: 1, unitPrice: 3000, total: 3000 },
    { description: "Blood Test", quantity: 1, unitPrice: 1500, total: 1500 },
  ];
  const subTotal = items.reduce((s, i) => s + i.total, 0);
  const seq = await Counter.getNextSequence("invoiceNumber");
  await Billing.create({
    patient: patients[1]._id,
    appointment: appointments[1]._id,
    items,
    subTotal,
    discount: 200,
    tax: 100,
    grandTotal: subTotal - 200 + 100,
    amountPaid: subTotal - 200 + 100,
    paymentStatus: "paid",
    paymentMethod: "card",
    invoiceNumber: `INV-${String(seq).padStart(6, "0")}`,
    issuedBy: receptionist._id,
  });

  console.log("\nSeed complete! Demo accounts (all use the same password):\n");
  console.log(`  Password for every account: ${DEMO_PASSWORD}\n`);
  console.log(`  Admin:         ${admin.email}`);
  console.log(`  Receptionist:  ${receptionist.email}`);
  doctors.forEach((d, i) => console.log(`  Doctor:        ${doctorSeeds[i].email}`));
  patients.forEach((p, i) => console.log(`  Patient:       ${patientSeeds[i].email}`));

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
