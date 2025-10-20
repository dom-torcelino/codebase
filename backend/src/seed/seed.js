import { connectDB } from "../config/db.js";
import { User } from "../models/User.js"; // Assuming User is a named export

async function seedUser() {
  try {
    await connectDB();

    const existingUser = await User.findOne({ email: "admin@example.com" });
    if (existingUser) {
      console.log("User admin@example.com already exists, skipping creation.");
      process.exit(0);
      return; // Exit after logging
    }

    const user = new User({
      email: "admin@example.com",
      name: "Admin", // Changed username to name to match your model
      // The User model you sent doesn't have 'role' or 'username'
      // It has 'name', so I've adjusted it.
    });

    // Set the password directly to trigger the hashing hook in your model
    user.password = "Admin123!";

    await user.save();
    console.log("✅ Successfully seeded admin user: admin@example.com / Admin123!");

  } catch (error) {
    console.error("❌ Seeding failed:", error);
  }
  process.exit(0);
}

seedUser();