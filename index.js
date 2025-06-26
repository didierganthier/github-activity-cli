const https = require('https');
const username = process.argv[2];

if (!username) {
    console.error("❌ Please provide a GitHub username.");
    console.error("Usage: node index.js <username>");
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
                        console.log(`No recent activity found for user: ${username}`);
                    }
                    displayActivity(events);
                } catch (error) {
                    console.error('❌ Error parsing response JSON.');
                }
            } else if (res.statusCode === 404) {
                console.error('❌ User not found.');
            } else {
                console.error(`❌ Failed to fetch activity. Status: ${res.statusCode}`);
            }
        });
    });

    req.on('error', (error) => {
        console.error(`❌ Request error: ${error.message}`);
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
                console.log(`🔄 ${event.actor.login} pushed ${commitCount} commit(s) to ${event.repo.name} at ${new Date(event.created_at).toLocaleString()}`);
                break;
            case 'IssuesEvent':
                if (event.payload.action === 'opened') {
                    console.log(`📖 ${event.actor.login} opened an issue in ${event.repo.name}: "${event.payload.issue.title}" at ${new Date(event.created_at).toLocaleString()}`);
                } else if (event.payload.action === 'closed') {
                    console.log(`🔒 ${event.actor.login} closed an issue in ${event.repo.name}: "${event.payload.issue.title}" at ${new Date(event.created_at).toLocaleString()}`);
                }
                break;
            case 'PullRequestEvent':
                if (event.payload.action === 'opened') {
                    console.log(`🔍 ${event.actor.login} opened a pull request in ${event.repo.name}: "${event.payload.pull_request.title}" at ${new Date(event.created_at).toLocaleString()}`);
                } else if (event.payload.action === 'closed') {
                    console.log(`✅ ${event.actor.login} closed a pull request in ${event.repo.name}: "${event.payload.pull_request.title}" at ${new Date(event.created_at).toLocaleString()}`);
                }
                break;
            case 'WatchEvent':
                console.log(`👀 ${event.actor.login} starred ${event.repo.name} at ${new Date(event.created_at).toLocaleString()}`);
                break;
            case 'ForkEvent':
                console.log(`🍴 ${event.actor.login} forked ${event.repo.name} at ${new Date(event.created_at).toLocaleString()}`);
                break;
            default:
                console.log(`🔔 ${event.actor.login} performed an activity of type ${event.type} in ${event.repo.name} at ${new Date(event.created_at).toLocaleString()}`);
                break;
        }
    }
}

fetchGitHubActivity(username);
