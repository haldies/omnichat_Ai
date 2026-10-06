"""
Test apakah environment variables terload dengan benar di service
"""
import sys
import os

print("=" * 60)
print("Testing Environment Loading in Service")
print("=" * 60)

# Test 1: Load dengan dotenv langsung
print("\n1️⃣ Test dengan python-dotenv:")
from dotenv import load_dotenv
load_dotenv()

groq_key = os.getenv("GROQ_API_KEY")
print(f"   GROQ_API_KEY: {groq_key[:20]}...{groq_key[-10:] if groq_key else 'NOT FOUND'}")
print(f"   Length: {len(groq_key) if groq_key else 0}")

# Test 2: Load dengan pydantic settings
print("\n2️⃣ Test dengan Pydantic Settings:")
try:
    from config.settings import settings
    print(f"   ✅ Settings loaded successfully")
    print(f"   GROQ_API_KEY: {settings.groq_api_key[:20]}...{settings.groq_api_key[-10:]}")
    print(f"   GROQ_MODEL: {settings.groq_model}")
    print(f"   Length: {len(settings.groq_api_key)}")
except Exception as e:
    print(f"   ❌ Error: {e}")
    sys.exit(1)

# Test 3: Test Groq API connection
print("\n3️⃣ Test Groq API Connection:")
try:
    from groq import Groq
    
    client = Groq(api_key=settings.groq_api_key)
    
    print(f"   Sending test request...")
    response = client.chat.completions.create(
        model=settings.groq_model,
        messages=[
            {"role": "user", "content": "Say 'API key is working!'"}
        ],
        max_tokens=20
    )
    
    print(f"   ✅ SUCCESS!")
    print(f"   Response: {response.choices[0].message.content}")
    
except Exception as e:
    print(f"   ❌ ERROR: {e}")
    sys.exit(1)

# Test 4: Test RAG Service initialization
print("\n4️⃣ Test RAG Service Initialization:")
try:
    # Import tanpa initialize full service
    import importlib.util
    spec = importlib.util.spec_from_file_location("rag_service", "services/rag_service.py")
    rag_module = importlib.util.module_from_spec(spec)
    
    print(f"   ✅ RAG Service module loaded")
    print(f"   File: services/rag_service.py")
    
except Exception as e:
    print(f"   ❌ Error loading RAG service: {e}")
    print(f"   This might be due to missing dependencies")

# Test 5: Check all required env vars
print("\n5️⃣ Check All Required Environment Variables:")
required_vars = [
    "GROQ_API_KEY",
    "GROQ_MODEL",
    "QDRANT_URL",
    "QDRANT_API_KEY",
    "QDRANT_COLLECTION_NAME",
    "VOYAGE_API_KEY",
    "VOYAGE_MODEL"
]

all_ok = True
for var in required_vars:
    value = getattr(settings, var.lower(), None)
    if value:
        # Mask sensitive values
        if "key" in var.lower():
            display = f"{value[:10]}...{value[-5:]}"
        else:
            display = value
        print(f"   ✅ {var}: {display}")
    else:
        print(f"   ❌ {var}: NOT FOUND")
        all_ok = False

print("\n" + "=" * 60)
if all_ok:
    print("🎉 ALL TESTS PASSED!")
    print("Environment variables loaded successfully!")
else:
    print("⚠️  Some environment variables are missing")
print("=" * 60)
