#!/usr/bin/env bun
/**
 * KataGame Dev Runner
 * Interactive menu to run development services
 * Usage: bun dev or bun run dev.ts [option]
 */

import { spawn, type Subprocess } from "bun";
import * as readline from "readline";
import { readdir, rename } from "node:fs/promises";
import { join, basename, extname } from "node:path";

// ANSI Colors
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bgBlue: "\x1b[44m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgRed: "\x1b[41m",
};

const c = colors;

// Menu options
const menuOptions = [
  { key: "1", label: "All (Database + Backend + Frontend)", value: "all" },
  { key: "2", label: "Backend only (NestJS GraphQL)", value: "backend" },
  { key: "3", label: "Frontend only (Next.js)", value: "frontend" },
  { key: "4", label: "Database only (PostgreSQL Docker)", value: "database" },
  { key: "5", label: "Backend + Frontend (No DB)", value: "services" },
  { key: "6", label: "1sshauto.sh - SSH Manager", value: "ssh" },
  { key: "7", label: "2autogit.sh - Git Manager", value: "git" },
  { key: "8", label: "3deploy.sh - Deploy Manager", value: "deploy" },
  { key: "9", label: "4docsclean.sh - Clean Project", value: "clean" },
  { key: "10", label: "5killport.sh - Kill Port", value: "killport" },
  { key: "11", label: "6backupdocker.sh - Backup", value: "backup" },
  { key: "12", label: "7restoredocker.sh - Restore", value: "restore" },
  { key: "13", label: "8manage-backups.sh - Backups", value: "manage_backups" },
  { key: "14", label: "Reorder Markdown Files", value: "reorder" },
  { key: "0", label: "Exit", value: "exit" },
];

// Process tracking
const processes: Subprocess[] = [];

function printBanner() {
  console.log(`
${c.cyan}╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   ${c.yellow}██╗  ██╗ █████╗ ████████╗ █████╗  ██████╗  █████╗ ███╗   ███╗███████╗${c.cyan}   ║
║   ${c.yellow}██║ ██╔╝██╔══██╗╚══██╔══╝██╔══██╗██╔════╝ ██╔══██╗████╗ ████║██╔════╝${c.cyan}   ║
║   ${c.yellow}█████╔╝ ███████║   ██║   ███████║██║  ███╗███████║██╔████╔██║█████╗  ${c.cyan}   ║
║   ${c.yellow}██╔═██╗ ██╔══██║   ██║   ██╔══██║██║   ██║██╔══██║██║╚██╔╝██║██╔══╝  ${c.cyan}   ║
║   ${c.yellow}██║  ██╗██║  ██║   ██║   ██║  ██║╚██████╔╝██║  ██║██║ ╚═╝ ██║███████╗${c.cyan}   ║
║   ${c.yellow}╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝${c.cyan}   ║
║                                                            ║
║         ${c.white}🎮 Vietnamese History Gaming Platform 🇻🇳${c.cyan}          ║
║                     ${c.magenta}MVP2 - Production Ready${c.cyan}                   ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝${c.reset}
`);
}

function printMenu() {
  console.log(`${c.bright}${c.white}┌─────────────────────────────────────────────┐${c.reset}`);
  console.log(`${c.bright}${c.white}│        ${c.cyan}🚀 Development Menu${c.white}                │${c.reset}`);
  console.log(`${c.bright}${c.white}├─────────────────────────────────────────────┤${c.reset}`);
  console.log(`${c.bright}${c.white}│  ${c.yellow}📦 Services${c.white}                                │${c.reset}`);
  
  for (const opt of menuOptions.slice(0, 5)) {
    const icon = opt.value === "all" ? "🌐" :
                 opt.value === "backend" ? "⚙️ " :
                 opt.value === "frontend" ? "🎨" :
                 opt.value === "database" ? "🗄️ " :
                 opt.value === "services" ? "🔧" : "•";
    
    const color = opt.value === "all" ? c.green :
                  opt.value === "backend" ? c.blue :
                  opt.value === "frontend" ? c.magenta :
                  opt.value === "database" ? c.yellow :
                  c.cyan;
    
    console.log(`${c.bright}${c.white}│  ${color}[${opt.key}]${c.white} ${icon} ${opt.label.padEnd(32)}│${c.reset}`);
  }
  
  console.log(`${c.bright}${c.white}├─────────────────────────────────────────────┤${c.reset}`);
  console.log(`${c.bright}${c.white}│  ${c.yellow}🛠️  Tools${c.white}                                  │${c.reset}`);
  
  const tools = menuOptions.filter(o => parseInt(o.key) >= 6);
  for (const opt of tools) {
    const icon = opt.value === "ssh" ? "🔐" :
                 opt.value === "git" ? "📝" :
                 opt.value === "deploy" ? "🚀" :
                 opt.value === "clean" ? "🧹" :
                 opt.value === "killport" ? "💀" :
                 opt.value === "backup" ? "💾" :
                 opt.value === "manage_backups" ? "📊" :
                 opt.value === "reorder" ? "🔢" : "•";
    
    const color = opt.value === "ssh" ? c.cyan :
                  opt.value === "git" ? c.magenta :
                  opt.value === "deploy" ? c.green :
                  opt.value === "clean" ? c.blue :
                  opt.value === "killport" ? c.red :
                  opt.value === "backup" ? c.yellow :
                  opt.value === "restore" ? c.magenta :
                  opt.value === "reorder" ? c.cyan :
                  c.cyan;
    
    console.log(`${c.bright}${c.white}│  ${color}[${opt.key.padStart(2)}]${c.white} ${icon} ${opt.label.padEnd(31)}│${c.reset}`);
  }
  
  console.log(`${c.bright}${c.white}├─────────────────────────────────────────────┤${c.reset}`);
  console.log(`${c.bright}${c.white}│  ${c.red}[ 0]${c.white} ❌ Exit                                 │${c.reset}`);
  console.log(`${c.bright}${c.white}└─────────────────────────────────────────────┘${c.reset}`);
  console.log();
}

function printStatus(service: string, status: "starting" | "running" | "stopped" | "error") {
  const statusColors = {
    starting: `${c.yellow}⏳ Starting`,
    running: `${c.green}✅ Running`,
    stopped: `${c.white}⏹️  Stopped`,
    error: `${c.red}❌ Error`,
  };
  console.log(`${c.bright}[${service}]${c.reset} ${statusColors[status]}${c.reset}`);
}

async function startDatabase(): Promise<boolean> {
  printStatus("Database", "starting");
  console.log(`${c.cyan}   → Starting PostgreSQL via Docker...${c.reset}`);
  
  const proc = spawn({
    cmd: ["docker", "compose", "up", "-d", "postgres"],
    cwd: process.cwd(),
    stdout: "inherit",
    stderr: "inherit",
  });
  
  await proc.exited;
  
  if (proc.exitCode === 0) {
    printStatus("Database", "running");
    console.log(`${c.green}   → PostgreSQL: localhost:11103${c.reset}`);
    return true;
  } else {
    printStatus("Database", "error");
    return false;
  }
}

async function startBackend(): Promise<Subprocess | null> {
  printStatus("Backend", "starting");
  console.log(`${c.cyan}   → Starting NestJS GraphQL Server...${c.reset}`);
  
  const proc = spawn({
    cmd: ["npm", "run", "dev"],
    cwd: `${process.cwd()}/backend`,
    stdout: "inherit",
    stderr: "inherit",
    env: { ...process.env, FORCE_COLOR: "1" },
  });
  
  processes.push(proc);
  
  // Wait a bit for server to start
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  printStatus("Backend", "running");
  console.log(`${c.green}   → GraphQL API: http://localhost:11101/graphql${c.reset}`);
  
  return proc;
}

async function startFrontend(): Promise<Subprocess | null> {
  printStatus("Frontend", "starting");
  console.log(`${c.cyan}   → Starting Next.js Development Server...${c.reset}`);
  
  const proc = spawn({
    cmd: ["npm", "run", "dev"],
    cwd: `${process.cwd()}/frontend`,
    stdout: "inherit",
    stderr: "inherit",
    env: { ...process.env, FORCE_COLOR: "1" },
  });
  
  processes.push(proc);
  
  // Wait a bit for server to start
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  printStatus("Frontend", "running");
  console.log(`${c.green}   → Web App: http://localhost:11100${c.reset}`);
  
  return proc;
}

async function runScript(scriptName: string, label: string): Promise<void> {
  console.log();
  console.log(`${c.bright}${c.bgBlue}${c.white} 🛠️  Running ${label} ${c.reset}`);
  console.log();
  
  const proc = spawn({
    cmd: ["bash", `./${scriptName}`],
    cwd: process.cwd(),
    stdout: "inherit",
    stderr: "inherit",
    stdin: "inherit",
  });
  
  await proc.exited;
}

async function runOption(option: string) {
  console.log();
  console.log(`${c.bright}${c.bgBlue}${c.white} 🚀 Starting Services ${c.reset}`);
  console.log();
  
  switch (option) {
    case "all":
      await startDatabase();
      console.log();
      await startBackend();
      console.log();
      await startFrontend();
      break;
      
    case "backend":
      await startBackend();
      break;
      
    case "frontend":
      await startFrontend();
      break;
      
    case "database":
      await startDatabase();
      return; // Database doesn't need to keep running in foreground
      
    case "services":
      await startBackend();
      console.log();
      await startFrontend();
      break;
    
    case "ssh":
      await runScript("1sshauto.sh", "SSH Auto Manager");
      return;
      
    case "git":
      await runScript("2autogit.sh", "Auto Git Manager");
      return;
      
    case "deploy":
      await runScript("3deploy.sh", "Deploy Manager");
      return;
      
    case "clean":
      await runScript("4docsclean.sh", "Clean Project");
      return;
      
    case "killport":
      await runScript("5killport.sh", "Kill Port Manager");
      return;

    case "backup":
      await runScript("scripts/6backupdocker.sh", "Backup Docker");
      return;

    case "restore":
      await runScript("scripts/7restoredocker.sh", "Restore Docker");
      return;

    case "manage_backups":
      await runScript("scripts/8manage-backups.sh", "Manage Backups");
      return;
      
    case "reorder":
      await reorderFiles();
      return;
      
    case "exit":
      console.log(`${c.yellow}👋 Goodbye!${c.reset}`);
      process.exit(0);
      
    default:
      console.log(`${c.red}Invalid option: ${option}${c.reset}`);
      return;
  }
  
  // No need to check for "database" here as it already returned
  console.log();
  console.log(`${c.bright}${c.bgGreen}${c.white} ✅ All Services Started ${c.reset}`);
  console.log();
  console.log(`${c.cyan}Press Ctrl+C to stop all services${c.reset}`);
  console.log();
  
  // Keep process alive
  await new Promise(() => {});
}

async function promptUser(): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  return new Promise((resolve) => {
    rl.question(`${c.bright}${c.cyan}Enter your choice [1-13, 0 to exit]: ${c.reset}`, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function reorderFiles() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const dir = await new Promise<string>((resolve) => {
    rl.question(`${c.bright}${c.cyan}Enter directory path (e.g., docs/features): ${c.reset}`, (answer) => {
      resolve(answer.trim());
    });
  });

  rl.close();

  if (!dir) {
    console.log(`${c.red}No directory specified.${c.reset}`);
    return;
  }

  try {
    const fullPath = join(process.cwd(), dir);
    const files = await readdir(fullPath);
    
    // Filter only markdown files
    const mdFiles = files.filter(f => f.toLowerCase().endsWith('.md'))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

    if (mdFiles.length === 0) {
      console.log(`${c.yellow}No markdown files found in ${dir}.${c.reset}`);
      return;
    }

    console.log(`${c.cyan}Found ${mdFiles.length} markdown files. Renaming...${c.reset}`);

    let count = 0;
    for (const file of mdFiles) {
      // Remove existing number prefix if any (e.g., "106-name.md" or "01-name.md")
      let cleanName = file.replace(/^\d+[-_ ]*/, '');
      
      const newName = `${String(count + 1).padStart(3, '0')}-${cleanName}`;
      
      if (file !== newName) {
        await rename(join(fullPath, file), join(fullPath, newName));
        console.log(`  ${c.white}${file}${c.cyan} ➔ ${c.green}${newName}${c.reset}`);
        count++;
      } else {
        console.log(`  ${c.white}${file}${c.yellow} (no change)${c.reset}`);
      }
    }

    console.log(`\n${c.green}✅ Successfully reordered ${count} files.${c.reset}`);
  } catch (err: any) {
    console.log(`${c.red}Error reordering files: ${err.message}${c.reset}`);
  }
}

// Cleanup on exit
process.on("SIGINT", () => {
  console.log();
  console.log(`${c.yellow}🛑 Stopping all services...${c.reset}`);
  
  for (const proc of processes) {
    proc.kill();
  }
  
  console.log(`${c.green}✅ All services stopped${c.reset}`);
  process.exit(0);
});

process.on("SIGTERM", () => {
  for (const proc of processes) {
    proc.kill();
  }
  process.exit(0);
});

// Main
async function main() {
  const args = process.argv.slice(2);
  
  // Direct option from command line
  if (args.length > 0) {
    const option = args[0].toLowerCase();
    const validOptions = menuOptions.map(m => m.value);
    
    if (validOptions.includes(option)) {
      printBanner();
      await runOption(option);
      return;
    }
    
    // Try to match by number
    const menuItem = menuOptions.find(m => m.key === option);
    if (menuItem) {
      printBanner();
      await runOption(menuItem.value);
      return;
    }
    
    console.log(`${c.red}Unknown option: ${option}${c.reset}`);
    console.log(`${c.yellow}Valid options: all, backend, frontend, database, services, ssh, git, deploy, clean, killport, backup, restore, manage_backups${c.reset}`);
    process.exit(1);
  }
  
  // Interactive menu
  printBanner();
  printMenu();
  
  const choice = await promptUser();
  
  // Find option by key or value
  let selected = menuOptions.find(m => m.key === choice);
  if (!selected) {
    selected = menuOptions.find(m => m.value === choice.toLowerCase());
  }
  
  if (selected) {
    await runOption(selected.value);
  } else {
    console.log(`${c.red}Invalid choice. Please enter 1-13 or 0.${c.reset}`);
    process.exit(1);
  }
}

main().catch(console.error);
