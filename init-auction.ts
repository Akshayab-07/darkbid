import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Connection, Keypair } from "@solana/web3.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  // Manually set up connection and wallet
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  
  // Load keypair
  const home = process.env.HOME || process.env.USERPROFILE || "";
  const keypairPath = path.join(home, ".config/solana/id.json");
  const keypairData = JSON.parse(fs.readFileSync(keypairPath, "utf-8"));
  const keypair = Keypair.fromSecretKey(new Uint8Array(keypairData));

  const provider = new anchor.AnchorProvider(connection, new anchor.Wallet(keypair), {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);

  const PROGRAM_ID = new PublicKey(
    "7YWfupxWKmgekRxzrWUUgoWEGSoGS2kz9nyaEbzKHqFK"
  );

  // Load IDL with proper types
  const idlPath = path.join(__dirname, "./anchor-prg/target/idl/darkbid.json");
  const idlData = JSON.parse(fs.readFileSync(idlPath, "utf-8"));

  // Ensure types exist in IDL
  if (!idlData.types) {
    idlData.types = [];
  }

  const program = new anchor.Program(idlData, PROGRAM_ID, provider);

  const authority = keypair.publicKey;

  // Derive auction PDA
  const [auctionPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("auction"), authority.toBuffer()],
    PROGRAM_ID
  );

  console.log("🚀 Initializing Auction on Devnet...");
  console.log(`Auction PDA: ${auctionPda.toString()}`);
  console.log(`Authority: ${authority.toString()}`);
  console.log("");

  try {
    const tx = await program.methods
      .initializeAuction(
        new anchor.BN(1_000_000), // reserve_price: 0.01 SOL
        new anchor.BN(3600) // duration: 1 hour
      )
      .accounts({
        auction: auctionPda,
        authority: authority,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log(`✅ Auction initialized!`);
    console.log(`TX: https://explorer.solana.com/tx/${tx}?cluster=devnet`);
    console.log("");
    console.log("📝 Auction PDA for frontend:");
    console.log(auctionPda.toString());
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.logs) {
      console.error("Program logs:", error.logs);
    }
    process.exit(1);
  }
}

main();
