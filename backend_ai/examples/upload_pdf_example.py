"""
Example: Upload PDF to RAG System
"""
import requests

# API endpoint
BASE_URL = "http://localhost:8000/api/v1"

def upload_pdf(file_path: str, metadata: dict = None):
    """
    Upload PDF file to RAG system
    
    Args:
        file_path: Path to PDF file
        metadata: Optional metadata dictionary
    """
    url = f"{BASE_URL}/documents/upload-pdf"
    
    # Prepare files
    with open(file_path, 'rb') as f:
        files = {
            'file': (file_path.split('/')[-1], f, 'application/pdf')
        }
        
        # Prepare form data
        data = {}
        if metadata:
            import json
            data['metadata'] = json.dumps(metadata)
        
        # Send request
        response = requests.post(url, files=files, data=data)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ PDF uploaded successfully!")
            print(f"   Filename: {result['filename']}")
            print(f"   Chunks created: {result['chunks_created']}")
            print(f"   Document ID: {result['doc_id']}")
            return result
        else:
            print(f"❌ Error: {response.status_code}")
            print(response.json())
            return None

def query_rag(question: str, top_k: int = 5):
    """
    Query the RAG system
    """
    url = f"{BASE_URL}/query"
    
    payload = {
        "query": question,
        "top_k": top_k
    }
    
    response = requests.post(url, json=payload)
    
    if response.status_code == 200:
        result = response.json()
        print("\n📝 Answer:")
        print(result['answer'])
        print(f"\n📚 Sources: {len(result['sources'])} documents")
        return result
    else:
        print(f"❌ Error: {response.status_code}")
        print(response.json())
        return None

if __name__ == "__main__":
    # Example 1: Upload PDF with metadata
    print("=" * 60)
    print("Example 1: Upload PDF")
    print("=" * 60)
    
    result = upload_pdf(
        file_path="DOKUMEN INFORMASI PRODUK.pdf",
        metadata={
            "category": "product_info",
            "language": "indonesian",
            "uploaded_by": "admin"
        }
    )
    
    # Example 2: Query the uploaded document
    if result:
        print("\n" + "=" * 60)
        print("Example 2: Query the document")
        print("=" * 60)
        
        query_rag("Apa itu Ingat Uang?")
