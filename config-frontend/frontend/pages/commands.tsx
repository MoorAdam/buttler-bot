import { useState, useEffect } from 'react';
import Head from "next/head";
import Link from "next/link";
import styles from "@/styles/Home.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

// Discord parameter types
const DISCORD_OPTION_TYPES: { [key: number]: string } = {
  1: "Subcommand",
  2: "Subcommand Group",
  3: "String",
  4: "Integer",
  5: "Boolean",
  6: "User",
  7: "Channel",
  8: "Role",
  9: "Mentionable",
  10: "Number"
};

interface Command {
  id: number;
  name: string;
  description: string;
  active: boolean;
  options?: CommandOption[];
}

interface CommandOption {
  name: string;
  description: string;
  type: number;
  required: boolean;
}

export default function Commands() {
  const [commands, setCommands] = useState<Command[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch commands from API
  const fetchCommands = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/commands`);
      const data = await response.json();
      
      if (data.success) {
        setCommands(data.data);
        setError('');
      } else {
        setError(data.error || 'Failed to fetch commands');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommands();
  }, []);

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

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          {loading ? (
            <div className={styles.loading}>Loading commands...</div>
          ) : (
            <div className={styles.commandsGrid}>
              {commands.length === 0 ? (
                <div className={styles.empty}>
                  No commands found.
                </div>
              ) : (
                commands.map((command) => (
                  <div key={command.id} className={styles.commandTile}>
                    <div className={styles.commandHeader}>
                      <h3 className={styles.commandName}>
                        /{command.name}
                        {!command.active && (
                          <span className={styles.inactiveBadge}>Inactive</span>
                        )}
                      </h3>
                    </div>
                    <p className={styles.commandDescription}>{command.description}</p>
                    
                    {command.options && command.options.length > 0 && (
                      <div className={styles.parametersSection}>
                        <h4 className={styles.parametersTitle}>Parameters:</h4>
                        <div className={styles.parametersList}>
                          {command.options.map((option, idx) => (
                            <div key={idx} className={styles.parameter}>
                              <div className={styles.parameterHeader}>
                                <span className={styles.parameterName}>{option.name}</span>
                                <span className={styles.parameterType}>
                                  {DISCORD_OPTION_TYPES[option.type] || `Type ${option.type}`}
                                </span>
                                {option.required && (
                                  <span className={styles.requiredBadge}>Required</span>
                                )}
                              </div>
                              <p className={styles.parameterDescription}>{option.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
