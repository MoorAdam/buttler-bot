import { useState } from 'react';
import Head from "next/head";
import Link from "next/link";
import styles from "@/styles/Home.module.css";

interface Command {
  id: number;
  name: string;
  description: string;
}

export default function Commands() {
  // Test data - will be replaced with real data later
  const [commands] = useState<Command[]>([
    {
      id: 1,
      name: "test",
      description: "Basic command to check if the bot is responding. Returns a simple hello world message with a random emoji."
    },
    {
      id: 2,
      name: "explain",
      description: "Get AI-powered explanations of concepts and topics. Sends your question to an AI service and returns a detailed explanation."
    },
    {
      id: 3,
      name: "challenge",
      description: "Challenge someone to a match of rock paper scissors with extended rules. Includes rock, paper, scissors, cowboy, virus, computer, and wumpus."
    },
    {
      id: 4,
      name: "info",
      description: "Display information about the bot, including version, uptime, and server statistics."
    },
    {
      id: 5,
      name: "help",
      description: "Shows a list of all available commands with brief descriptions and usage examples."
    },
    {
      id: 6,
      name: "ping",
      description: "Check the bot's response time and connection status to Discord servers."
    },
    {
      id: 7,
      name: "ping",
      description: "Check the bot's response time and connection status to Discord servers."
    }
  ]);

  return (
    <>
      <Head>
        <title>Bot Commands</title>
        <meta name="description" content="View available bot commands" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.container}>
        <main className={styles.main}>
          <div className={styles.navigation}>
            <Link href="/" className={styles.navLink}>
              Configuration
            </Link>
            <Link href="/commands" className={`${styles.navLink} ${styles.navLinkActive}`}>
              Commands
            </Link>
          </div>

          <h1 className={styles.title}>Bot Commands</h1>
          <p className={styles.description}>Available commands and their descriptions</p>

          <div className={styles.commandsGrid}>
            {commands.map((command) => (
              <div key={command.id} className={styles.commandTile}>
                <div className={styles.commandHeader}>
                  <h3 className={styles.commandName}>/{command.name}</h3>
                </div>
                <p className={styles.commandDescription}>{command.description}</p>
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}
