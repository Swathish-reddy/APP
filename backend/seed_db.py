import asyncio
from app.db.session import AsyncSessionLocal, engine
from app.db.models import Base, User, Patient
import uuid

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
async def seed_data():
    async with AsyncSessionLocal() as session:
        # Create a user
        admin = User(
            email="admin@cognivuex.com",
            full_name="System Admin",
            hashed_password="hashed_password",
        )
        session.add(admin)
        await session.commit()
        await session.refresh(admin)

        # Create a patient
        patient = Patient(
            owner_id=admin.id,
            full_name="John Doe",
            age=45,
            gender="Male",
            blood_group="O+",
        )
        session.add(patient)
        await session.commit()
        print("Successfully seeded the database!")

if __name__ == "__main__":
    asyncio.run(init_db())
    asyncio.run(seed_data())
