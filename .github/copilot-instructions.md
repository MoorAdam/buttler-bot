# GitHub Copilot Instructions

## Core Principles

### Environment
- Target Node.js environment with JavaScript/TypeScript
- Ensure compatibility with n8n workflows

### Minimal Dependencies
- Use as little external libraries as possible
- Avoid npm libraries if not needed
- Prefer built-in Node.js modules and native JavaScript

### Language
- Use English as the main language for all code, comments, and documentation

### n8n Integration
- Keep in mind that n8n will be used for workflows
- This can mean usage of webhooks with responses
- Or simple Discord node responses
- Design code to be compatible with n8n automation patterns

### Documentation
- Every step must be described to the developer
- Add clear comments explaining the purpose and logic
- Document any non-obvious behavior or decisions

### Simplicity
- Keep everything as simple and understandable as possible
- Favor readability over clever solutions
- Use straightforward patterns and avoid over-engineering

### Documentation
- Always create clear and concise documentation
- Use these documentations to understand the code better
- Ensure that the documentation is easy to follow for future developers