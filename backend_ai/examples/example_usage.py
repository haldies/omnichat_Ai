"""
Example usage of the Agentic RAG API
"""
import asyncio
import httpx
import json

BASE_URL = "http://localhost:8000/api/v1"

async def example_basic_rag():
    """Example: Basic RAG workflow"""
    print("\n" + "="*60)
    print("Example 1: Basic RAG Workflow")
    print("="*60)
    
    async with httpx.AsyncClient() as client:
        # 1. Add documents
        print("\n1. Adding documents...")
        documents = [
            {
                "content": """
                LangChain is a framework for developing applications powered by language models.
                It provides tools for prompt management, chains, agents, and memory.
                LangChain supports multiple LLM providers including OpenAI, Anthropic, and Groq.
                """,
                "metadata": {"source": "langchain_intro", "doc_id": "doc1"}
            },
            {
                "content": """
                RAG (Retrieval Augmented Generation) is a technique that combines retrieval
                and generation. It retrieves relevant documents from a knowledge base and
                uses them as context for generating answers. This improves accuracy and
                reduces hallucinations.
                """,
                "metadata": {"source": "rag_intro", "doc_id": "doc2"}
            },
            {
                "content": """
                Groq provides ultra-fast LLM inference using custom LPU (Language Processing Unit)
                hardware. It offers significant speed improvements over traditional GPU inference
                while maintaining high quality outputs.
                """,
                "metadata": {"source": "groq_intro", "doc_id": "doc3"}
            }
        ]
        
        response = await client.post(
            f"{BASE_URL}/documents/add",
            json=documents
        )
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        # 2. Query the system
        print("\n2. Querying the system...")
        query = {
            "query": "What is RAG and why is it useful?",
            "top_k": 3
        }
        
        response = await client.post(
            f"{BASE_URL}/query",
            json=query
        )
        result = response.json()
        print(f"\nQuestion: {query['query']}")
        print(f"\nAnswer: {result['answer']}")
        print(f"\nSources used: {len(result['sources'])}")

async def example_agentic_rag():
    """Example: Agentic RAG with self-reflection"""
    print("\n" + "="*60)
    print("Example 2: Agentic RAG with Self-Reflection")
    print("="*60)
    
    async with httpx.AsyncClient() as client:
        query = {
            "query": "Explain how LangChain and Groq work together for RAG applications"
        }
        
        print(f"\nQuestion: {query['query']}")
        print("\nProcessing with agentic loop...")
        
        response = await client.post(
            f"{BASE_URL}/query/agentic",
            json=query,
            timeout=60.0
        )
        result = response.json()
        
        print(f"\nAnswer: {result['answer']}")
        print(f"\nIterations: {result['metadata'].get('iterations', 'N/A')}")
        print(f"Sources: {len(result['sources'])}")

async def example_context7_integration():
    """Example: Context7 library documentation"""
    print("\n" + "="*60)
    print("Example 3: Context7 Integration")
    print("="*60)
    
    async with httpx.AsyncClient() as client:
        # 1. Resolve library ID
        print("\n1. Resolving library ID...")
        response = await client.get(f"{BASE_URL}/context7/resolve/langchain")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        # 2. Add Context7 documentation
        print("\n2. Adding Context7 documentation...")
        request = {
            "library_name": "langchain",
            "topic": "chains",
            "tokens": 3000
        }
        
        response = await client.post(
            f"{BASE_URL}/documents/context7",
            json=request
        )
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        # 3. Query with Context7 context
        print("\n3. Querying with Context7 context...")
        query = {
            "query": "How do I create a custom chain in LangChain?",
            "use_context7": True,
            "library_name": "langchain"
        }
        
        response = await client.post(
            f"{BASE_URL}/query",
            json=query
        )
        result = response.json()
        print(f"\nAnswer: {result['answer']}")

async def example_evaluation():
    """Example: Evaluate RAG response"""
    print("\n" + "="*60)
    print("Example 4: Response Evaluation")
    print("="*60)
    
    async with httpx.AsyncClient() as client:
        evaluation_data = {
            "prediction": "RAG combines retrieval and generation to provide accurate answers based on a knowledge base.",
            "reference": "RAG (Retrieval Augmented Generation) is a technique that retrieves relevant documents and uses them for generation.",
            "retrieved_docs": [
                {"content": "RAG doc 1", "metadata": {"doc_id": "doc1"}},
                {"content": "RAG doc 2", "metadata": {"doc_id": "doc2"}}
            ],
            "relevant_doc_ids": ["doc1", "doc2"]
        }
        
        response = await client.post(
            f"{BASE_URL}/evaluate",
            json=evaluation_data
        )
        result = response.json()
        
        print("\nEvaluation Results:")
        print(json.dumps(result, indent=2))

async def main():
    """Run all examples"""
    print("\n" + "="*60)
    print("Agentic RAG API - Example Usage")
    print("="*60)
    
    try:
        # Check health
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{BASE_URL}/health")
            print(f"\nAPI Health: {response.json()['status']}")
        
        # Run examples
        await example_basic_rag()
        await example_agentic_rag()
        await example_context7_integration()
        await example_evaluation()
        
        print("\n" + "="*60)
        print("All examples completed!")
        print("="*60 + "\n")
        
    except Exception as e:
        print(f"\nError: {e}")
        print("Make sure the API is running on http://localhost:8000")

if __name__ == "__main__":
    asyncio.run(main())
