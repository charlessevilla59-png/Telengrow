import { User, MoodEntry } from "./models/index.js";

async function checkMoodEntries() {
  try {
    const user = await User.findOne({ where: { email: "testmood@example.com" } });
    
    if (!user) {
      console.log("User testmood@example.com not found.");
      const count = await MoodEntry.count();
      console.log(`Total MoodEntry count in database: ${count}`);
    } else {
      console.log(`Found user: ${user.email} (ID: ${user.id || user.UserID})`);

      // Checking potential column names for foreign key
      const userIdKey = user.id ? "userId" : "UserID";

      const moods = await MoodEntry.findAll({
        where: { [userIdKey]: user.id || user.UserID },
        limit: 5,
        order: [["createdAt", "DESC"]]
      });

      if (moods.length === 0) {
        console.log("No mood entries found for this user.");
      } else {
        console.log(`Found ${moods.length} entries:`);
        moods.forEach(m => {
          console.log(`- Date: ${m.createdAt}, Mood: ${m.mood || m.category || JSON.stringify(m.toJSON())}`);
        });
      }
    }
  } catch (error) {
    console.error("Error querying database:", error.message);
  } finally {
    process.exit();
  }
}

checkMoodEntries();
