#!/usr/bin/env node

const color = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m',
};

function colored(text, colorCode) {
    return `${colorCode}${text}${color.reset}`;
}


const https = require('https');
const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(colored('📦 GitHub Activity CLI', color.cyan));
    console.log();
    console.log(colored('Usage:', color.yellow));
    console.log('  github-activity <username>');
    console.log();
    console.log(colored('Examples:', color.yellow));
    console.log('  github-activity didierganthier');
    console.log('  github-activity torvalds');
    console.log();
    console.log(colored('Description:', color.yellow));
    console.log('  Fetch and display recent public GitHub activity (commits, issues, stars, etc.)');
    console.log('  for the specified user using the GitHub API.');
    console.log();
    console.log(colored('Options:', color.yellow));
    console.log('  --help, -h       Show this help message');

    process.exit(0);
}

const username = args[0];

if (!username) {
    console.error(colored("❌ Please provide a GitHub username.", color.red));
    console.error(colored("Usage: node index.js <username>", color.blue));
    process.exit(1);
}


const fetchGitHubActivity = (username) => {
    const options = {
        hostname: 'api.github.com',
        path: `/users/${username}/events`,
        method: 'GET',
        headers: {
            'User-Agent': 'github-activity-cli',
            'Accept': 'application/vnd.github.v3+json'
        }
    };

    const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            if (res.statusCode === 200) {
                try {
                    const events = JSON.parse(data);
                    if (events.length === 0) {
                        console.log(colored(`No recent activity found for user: ${username}`, color.red));
                    }
                    displayActivity(events);
                } catch (error) {
                    console.error(colored('❌ Error parsing response JSON.', color.red));
                }
            } else if (res.statusCode === 404) {
                console.error(colored('❌ User not found.', color.red));
            } else {
                console.error(colored(`❌ Failed to fetch activity. Status: ${res.statusCode}`, color.red));
            }
        });
    });

    req.on('error', (error) => {
        console.error(colored(`❌ Request error: ${error.message}`, color.red));
    });

    req.end();
}

const displayActivity = (events) => {
    if (events.length === 0) {
        console.log('No recent activity found');
        return;
    }

    for (const event of events) {
        switch (event.type) {
            case 'PushEvent':
                const commitCount = event.payload.commits?.length || 0;
                console.log(colored(`🔄 ${event.actor.login} pushed ${commitCount} commit(s) to ${event.repo.name} at ${new Date(event.created_at).toLocaleString()}`, color.green));
                break;
            case 'IssuesEvent':
                if (event.payload.action === 'opened') {
                    console.log(colored(`📖 ${event.actor.login} opened an issue in ${event.repo.name}: "${event.payload.issue.title}" at ${new Date(event.created_at).toLocaleString()}`, color.yellow));
                } else if (event.payload.action === 'closed') {
                    console.log(colored(`🔒 ${event.actor.login} closed an issue in ${event.repo.name}: "${event.payload.issue.title}" at ${new Date(event.created_at).toLocaleString()}`, color.red));
                }
                break;
            case 'PullRequestEvent':
                if (event.payload.action === 'opened') {
                    console.log(colored(`🔍 ${event.actor.login} opened a pull request in ${event.repo.name}: "${event.payload.pull_request.title}" at ${new Date(event.created_at).toLocaleString()}`, color.cyan));
                } else if (event.payload.action === 'closed') {
                    console.log(colored(`✅ ${event.actor.login} closed a pull request in ${event.repo.name}: "${event.payload.pull_request.title}" at ${new Date(event.created_at).toLocaleString()}`, color.magenta));
                }
                break;
            case 'WatchEvent':
                console.log(colored(`👀 ${event.actor.login} starred ${event.repo.name} at ${new Date(event.created_at).toLocaleString()}`, color.blue));
                break;
            case 'ForkEvent':
                console.log(colored(`🍴 ${event.actor.login} forked ${event.repo.name} at ${new Date(event.created_at).toLocaleString()}`, color.gray));
                break;
            case 'CreateEvent':
                const refType = event.payload.ref_type;
                const refName = event.payload.ref || '';
                let message = `✨ ${event.actor.login} created a ${refType}`;
                if (refName) {
                    message += ` (${refName})`;
                }
                message += ` in ${event.repo.name} at ${new Date(event.created_at).toLocaleString()}`;
                console.log(colored(message, color.blue));
                break;
            default:
                console.log(colored(`🔔 ${event.actor.login} performed an activity of type ${event.type} in ${event.repo.name} at ${new Date(event.created_at).toLocaleString()}`, color.bright));
                break;
        }
    }
}

fetchGitHubActivity(username);
