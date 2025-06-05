#!/usr/bin/env node

/**
 * Advanced Memory Bank MCP v3.2.4 - Zero-Dependency Entry Point
 * Built-in AI embeddings using internal algorithms - No API keys required
 * 
 * @author Andre Buzeli
 * @version 3.2.4
 * @since 2025
 */

// Wrapper for dynamic imports with fallback
async function startServer() {
  try {
    // Try to load MCP SDK
    const { StdioServerTransport } = await import('@modelcontextprotocol/sdk/server/stdio.js');
    const { AdvancedMemoryBankServer } = await import('./server.js');
    
    // Create and run the server with MCP SDK
    const server = new AdvancedMemoryBankServer();
    server.connect(new StdioServerTransport()).catch((error) => {
      process.stderr.write(`Server error: ${error}\n`);
      process.exit(1);
    });
  } catch (error) {
    // Fallback to standalone mode if MCP SDK is not available
    try {
      // Import the fallback implementation
      const { createStandaloneServer } = await import('./standalone.js');
      createStandaloneServer().catch((fallbackError) => {
        process.stderr.write(`Standalone server error: ${fallbackError}\n`);
        process.exit(1);
      });
    } catch (fallbackError) {
      process.stderr.write(`Failed to start server: ${error}\n`);
      process.stderr.write(`Advanced Memory Bank requires @modelcontextprotocol/sdk to be installed.\n`);
      process.stderr.write(`Please install it with: npm install @modelcontextprotocol/sdk\n`);
      process.exit(1);
    }
  }
}

// Start the server
startServer();