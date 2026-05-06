#!/usr/bin/env node
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load IDL
const idlPath = path.join(__dirname, "./anchor-prg/target/idl/darkbid.json");
const idl = JSON.parse(fs.readFileSync(idlPath, "utf-8"));

// Load keypair
const keypairPath = path.join(__dirname, "./anchor-prg/target/deploy/darkbid-keypair.json");
const keypair = anchor.web3.Keypair.fromSecretKey(
  new Uint8Array(JSON.parse(fs.readFileSync(keypairPath, "utf-8")))
);

const PROGRAM_ID = new PublicKey("7YWfupxWKmgekRxzrWUUgoWEGSoGS2kz9nyaEbzKHqFK");

async function initializeAuction() {
  // Connect to Devnet
  const connection = new anchor.web3.Connection(
    anchor.web3.clusterApiUrl("devnet"),
    "confirmed"
  );

  // Create provider
  const wallet = new anchor.Wallet(keypair);
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);

  // Create program instance
  const program = new anchor.Program(idl, PROGRAM_ID, provider);

  // Auction parameters
  const reservePrice = new anchor.BN(1_000_000); // 0.01 SOL in lamports
  const duration = new anchor.BN(3600); // 1 hour in seconds

  // Derive auction PDA
  const [auctionPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("auction"), keypair.publicKey.toBuffer()],
    PROGRAM_ID
  );

  console.log("🚀 Initializing Auction on Devnet...");
  console.log(`Program ID: ${PROGRAM_ID.toString()}`);
  console.log(`Authority: ${keypair.publicKey.toString()}`);
  console.log(`Auction PDA: ${auctionPda.toString()}`);
  console.log(`Reserve Price: ${reservePrice.toString()} lamports (0.01 SOL)`);
  console.log(`Duration: ${duration.toString()} seconds (1 hour)`);
  console.log("");

  try {
    // Call initialize_auction
    const tx = await program.methods
      .initializeAuction(reservePrice, duration)
      .accounts({
        auction: auctionPda,
        authority: keypair.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([keypair])
      .rpc();

    console.log(`✅ Auction initialized successfully!`);
    console.log(`Transaction: https://explorer.solana.com/tx/${tx}?cluster=devnet`);
    console.log("");
    console.log("📝 Use this auction PDA in your frontend:");
    console.log(`Auction PDA: ${auctionPda.toString()}`);
  } catch (error) {
    console.error("❌ Error initializing auction:", error.message);
    if (error.logs) {
      console.error("Logs:", error.logs);
    }
    process.exit(1);
  }
}

initializeAuction().catch(console.error);
