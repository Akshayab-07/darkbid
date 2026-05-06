import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import {
  Connection,
  PublicKey,
} from "@solana/web3.js";

const home = process.env.HOME || process.env.USERPROFILE || "";

async function main() {
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  const PROGRAM_ID = new PublicKey("7YWfupxWKmgekRxzrWUUgoWEGSoGS2kz9nyaEbzKHqFK");

  // The auction PDA that was created
  const auctionPda = new PublicKey("9hvsG7Xhf4xbDJ4ycTymXbE9ENMYqE3gWd7Q4UrLzR69");

  console.log("🔍 Checking auction account...");
  
  try {
    const accountInfo = await connection.getAccountInfo(auctionPda);
    
    if (!accountInfo) {
      console.log("❌ Account does not exist");
      return;
    }

    console.log(`✅ Account exists!`);
    console.log(`Owner: ${accountInfo.owner.toString()}`);
    console.log(`Executable: ${accountInfo.executable}`);
    console.log(`Lamports: ${accountInfo.lamports}`);
    console.log(`Data size: ${accountInfo.data.length}`);
    console.log(`\n📝 Auction PDA:`);
    console.log(auctionPda.toString());
    
    // Parse auction data if possible
    if (accountInfo.data.length > 40) {
      // Skip discriminator (8 bytes) and read authority (32 bytes)
      const authority = accountInfo.data.slice(8, 40);
      console.log(`\n📊 Auction Authority: ${new PublicKey(authority).toString()}`);
    }
  } catch (error) {
    console.error("Error fetching account:", error.message);
  }
}

main();
