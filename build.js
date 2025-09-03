#!/usr/bin/env node

// Build script to replace environment variables in config.js
// Usage: node build.js [environment]

const fs = require('fs');
const path = require('path');

// Get environment from command line or default to 'development'
const environment = process.argv[2] || 'development';

// Environment-specific configurations
const configs = {
    development: {
        accessPassword: 'matcha2024',
        appName: 'MatchaCode (Dev)',
        version: '1.0.0-dev'
    },
    production: {
        accessPassword: process.env.MATCHACODE_PASSWORD || 'matcha2024',
        appName: 'MatchaCode',
        version: '1.0.0'
    },
    staging: {
        accessPassword: process.env.MATCHACODE_PASSWORD || 'staging2024',
        appName: 'MatchaCode (Staging)',
        version: '1.0.0-staging'
    }
};

// Get config for current environment
const config = configs[environment] || configs.development;

// Read the template config file
const configTemplate = fs.readFileSync('config.js', 'utf8');

// Replace placeholders with actual values
let configContent = configTemplate
    .replace('matcha2024', config.accessPassword)
    .replace('MatchaCode', config.appName)
    .replace('1.0.0', config.version);

// Write the final config file
fs.writeFileSync('config.js', configContent);

console.log(`✅ Built config for environment: ${environment}`);
console.log(`📝 App Name: ${config.appName}`);
console.log(`🔐 Password: ${config.accessPassword.substring(0, 4)}****`);
console.log(`📦 Version: ${config.version}`);