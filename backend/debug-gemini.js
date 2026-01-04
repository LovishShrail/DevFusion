import 'dotenv/config';

const apiKey = process.env.GOOGLE_AI_KEY;

if (!apiKey) {
    console.error("❌ ERROR: GOOGLE_AI_KEY is missing from .env file");
    process.exit(1);
}

console.log(`🔑 Testing API Key: ${apiKey.substring(0, 5)}...`);

async function testConnection() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        console.log("\n✅ SUCCESS! Your API Key works. Here are your available models:");
        console.log("---------------------------------------------------------------");
        
        const availableModels = data.models
            .filter(m => m.supportedGenerationMethods.includes("generateContent"))
            .map(m => m.name.replace("models/", ""));
            
        console.log(availableModels.join("\n"));
        console.log("---------------------------------------------------------------");
        
        if (availableModels.includes("gemini-1.5-flash")) {
            console.log("\n🚀 GOOD NEWS: 'gemini-1.5-flash' IS available to you.");
        } else {
            console.log("\n⚠️ BAD NEWS: 'gemini-1.5-flash' is NOT in your list.");
            console.log(`👉 Please update ai.service.js to use: "${availableModels[0]}"`);
        }

    } catch (error) {
        console.error("\n❌ CONNECTION FAILED:");
        console.error(error.message);
        console.log("\n💡 SOLUTION: Your API Key might be invalid, or you haven't enabled the 'Generative Language API' in Google Cloud Console.");
    }
}

testConnection();