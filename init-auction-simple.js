#!/usr/bin/env node
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load keypair
const keypairPath = path.join(__dirname, "./anchor-prg/target/deploy/darkbid-keypair.json");
const keypairData = JSON.parse(fs.readFileSync(keypairPath, "utf-8"));
const keypair = Keypair.fromSecretKey(new Uint8Array(keypairData));

const PROGRAM_ID = new PublicKey("7YWfupxWKmgekRxzrWUUgoWEGSoGS2kz9nyaEbzKHqFK");

function encodeInstruction(reservePrice, duration) {
  // Discriminator for initialize_auction
  const discriminator = Buffer.from([37, 10, 117, 197, 208, 88, 117, 62]);
  
  // Encode u64 and i64 as little-endian
  const reservePriceBuffer = Buffer.allocUnsafe(8);
  reservePriceBuffer.writeBigUInt64LE(BigInt(reservePrice), 0);
  
  const durationBuffer = Buffer.allocUnsafe(8);
  durationBuffer.writeBigInt64LE(BigInt(duration), 0);
  
  return Buffer.concat([discriminator, reservePriceBuffer, durationBuffer]);
}

async function initializeAuction() {
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");

  console.log("🚀 Initializing Auction on Devnet...");
  console.log(`Program ID: ${PROGRAM_ID.toString()}`);
  console.log(`Authority: ${keypair.publicKey.toString()}`);

  // Derive auction PDA
  const [auctionPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("auction"), keypair.publicKey.toBuffer()],
    PROGRAM_ID
  );

  console.log(`Auction PDA: ${auctionPda.toString()}`);

  // Instruction parameters
  const reservePrice = 1_000_000; // 0.01 SOL
  const duration = 3600; // 1 hour

  console.log(`Reserve Price: ${reservePrice} lamports (0.01 SOL)`);
  console.log(`Duration: ${duration} seconds (1 hour)`);
  console.log("");

  try {
    // Create instruction data
    const instructionData = encodeInstruction(reservePrice, duration);

    // Create instruction
    const instruction = {
      programId: PROGRAM_ID,
      keys: [
        {
          pubkey: auctionPda,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: keypair.publicKey,
          isSigner: true,
          isWritable: true,
        },
        {
          pubkey: SystemProgram.programId,
          isSigner: false,
          isWritable: false,
        },
      ],
      data: instructionData,
    };

    // Get latest blockhash
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash();

    // Create transaction
    const messageV0 = new TransactionMessage({
      payerKey: keypair.publicKey,
      recentBlockhash: blockhash,
      instructions: [instruction],
    }).compileToV0Message();

    const transaction = new VersionedTransaction(messageV0);
    transaction.sign([keypair]);

    // Send transaction
    const txid = await connection.sendTransaction(transaction);

    console.log(`✅ Transaction sent!`);
    console.log(`Signature: ${txid}`);
    console.log(
      `View: https://explorer.solana.com/tx/${txid}?cluster=devnet`
    );
    console.log("");

    // Wait for confirmation
    const confirmation = await connection.confirmTransaction({
      signature: txid,
      blockhash,
      lastValidBlockHeight,
    });

    if (confirmation.value.err) {
      console.error("❌ Transaction failed:", confirmation.value.err);
      process.exit(1);
    }

    console.log(`✅ Auction initialized successfully!`);
    console.log("");
    console.log("📝 Use this auction PDA in your frontend:");
    console.log(`Auction PDA: ${auctionPda.toString()}`);
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.logs) {
      console.error("Logs:", error.logs);
    }
    process.exit(1);
  }
}

initializeAuction().catch(console.error);
