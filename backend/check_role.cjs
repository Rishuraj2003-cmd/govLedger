const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/bihar-fund-tracker');
  const db = mongoose.connection.useDb('bihar-fund-tracker');
  const users = await db.collection('users').find({}).toArray();
  for (const u of users) {
    console.log(`Email: '${u.email}', Role: '${u.role}', Length: ${u.role ? u.role.length : 0}`);
  }
  process.exit(0);
}
run();
