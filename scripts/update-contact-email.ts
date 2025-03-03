
import { db } from "@db";
import { contactInfo } from "@db/schema";
import { eq } from "drizzle-orm";

async function updateContactEmail() {
  const contactInfoRecord = await db.query.contactInfo.findFirst();
  
  if (!contactInfoRecord) {
    console.log("No contact info record found. Creating a new one...");
    await db.insert(contactInfo).values({
      email: "littlewayacresmi@gmail.com",  // Update this to your preferred email
      phone: "2699219888",
      facebook: "https://www.facebook.com/profile.php?id=61557289214925",
      instagram: null
    });
    console.log("Created new contact info record");
  } else {
    // Update the existing record
    await db.update(contactInfo)
      .set({ 
        email: "littlewayacresmi@gmail.com",  // Update this to your preferred email 
        updatedAt: new Date()
      })
      .where(eq(contactInfo.id, contactInfoRecord.id));
    console.log("Updated contact email successfully");
  }
}

updateContactEmail()
  .then(() => process.exit(0))
  .catch(error => {
    console.error("Failed to update contact email:", error);
    process.exit(1);
  });
