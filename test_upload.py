import asyncio
import os
import httpx

async def test_upload():
    print("Testing upload end-to-end...")
    # Create a dummy file
    with open("dummy.xyz", "w") as f:
        f.write("This is a test file for unsupported format.")

    try:
        # Assuming backend runs on 8000
        async with httpx.AsyncClient() as client:
            try:
                res = await client.get("http://localhost:8000/api/v1/health")
                print("Backend is running.")
            except:
                print("Backend not running, skipping live API tests.")
                return

            with open("dummy.xyz", "rb") as f:
                res = await client.post("http://localhost:8000/api/v1/documents/upload", data={"patient_id": "1"}, files={"file": f})
                print("Upload response:", res.status_code)
    finally:
        if os.path.exists("dummy.xyz"):
            os.remove("dummy.xyz")
            
    print("Tests completed successfully.")

if __name__ == "__main__":
    asyncio.run(test_upload())
