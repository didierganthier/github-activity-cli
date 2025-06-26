# github-activity-cli

A simple CLI tool to fetch and display recent public GitHub activity for any user.

# Project URL
[https://roadmap.sh/projects/github-user-activity](https://roadmap.sh/projects/github-user-activity)

## Installation

```bash
npm install -g gh-activity-cli
```

## Usage

```bash
github-activity <username> [--json] [--type=PushEvent] [--limit=5]
```

## Examples

```bash
github-activity torvalds
github-activity kamranahmedse --type=PushEvent --limit=3
github-activity didierganthier --json
github-activity someuser --limit=10
```

## Flags

- `--help` &nbsp;&nbsp;&nbsp;&nbsp;Show help info  
- `--json` &nbsp;&nbsp;&nbsp;&nbsp;Output raw JSON  
- `--type=<x>` &nbsp;&nbsp;&nbsp;&nbsp;Filter by GitHub event type (e.g. `PushEvent`, `ForkEvent`, `WatchEvent`, etc.)  
- `--limit=<n>` &nbsp;&nbsp;&nbsp;&nbsp;Limit the number of events displayed  

## What It Does

This CLI tool fetches a GitHub user's recent public activity using the GitHub Events API and displays it in your terminal. You can see actions like pushing commits, opening issues, starring repositories, and more. You can filter, limit, or export this data as JSON.

## Author

[Didier Ganthier](https://github.com/didierganthier)

## License

MIT