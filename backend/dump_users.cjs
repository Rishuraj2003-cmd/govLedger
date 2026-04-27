const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/bihar-fund-tracker');
  
  const db = mongoose.connection.useDb('bihar-fund-tracker');
  const users = await db.collection('users').find({}).toArray();
  console.log(users.map(u => ({ email: u.email, role: u.role })));
  process.exit(0);
}
run();
