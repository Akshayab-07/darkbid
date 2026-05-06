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

const __dirname = fileURLToPath(import.meta.url);
const home = process.env.HOME || process.env.USERPROFILE || "";

async function main() {
  // Load keypair
  const keypairPath = path.join(home, ".config/solana/id.json");
  const keypairData = JSON.parse(fs.readFileSync(keypairPath, "utf-8"));
  const keypair = Keypair.fromSecretKey(new Uint8Array(keypairData));

  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  const PROGRAM_ID = new PublicKey("7YWfupxWKmgekRxzrWUUgoWEGSoGS2kz9nyaEbzKHqFK");

  // Derive auction PDA
  const [auctionPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("auction"), keypair.publicKey.toBuffer()],
    PROGRAM_ID
  );

  console.log("🚀 Initializing Auction on Devnet...");
  console.log(`Auction PDA: ${auctionPda.toString()}`);
  console.log(`Authority: ${keypair.publicKey.toString()}`);

  // Encode instruction data
  // Discriminator: [37, 10, 117, 197, 208, 88, 117, 62]
  // reserve_price: u64 (8 bytes LE)
  // duration: i64 (8 bytes LE)
  
  const discriminator = Buffer.from([37, 10, 117, 197, 208, 88, 117, 62]);
  
  const reservePriceBuffer = Buffer.allocUnsafe(8);
  reservePriceBuffer.writeBigUInt64LE(BigInt(1_000_000), 0);
  
  const durationBuffer = Buffer.allocUnsafe(8);
  durationBuffer.writeBigInt64LE(BigInt(3600), 0);
  
  const instructionData = Buffer.concat([
    discriminator,
    reservePriceBuffer,
    durationBuffer,
  ]);

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

  try {
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
    console.log("\n📡 Sending transaction...");
    const txid = await connection.sendTransaction(transaction, { maxRetries: 3 });

    console.log(`✅ Transaction sent!`);
    console.log(`Signature: ${txid}`);
    console.log(
      `View: https://explorer.solana.com/tx/${txid}?cluster=devnet`
    );

    // Wait for confirmation
    await connection.confirmTransaction(
      {
        signature: txid,
        blockhash,
        lastValidBlockHeight,
      },
      "confirmed"
    );

    console.log(`\n✅ Auction initialized successfully!`);
    console.log("\n📝 Add this to your frontend:");
    console.log(`const AUCTION_PDA = "${auctionPda.toString()}";`);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

main();
