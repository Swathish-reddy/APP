import asyncio
from app.db.session import AsyncSessionLocal
from app.db.models import User
from app.core.security import get_password_hash
from sqlalchemy import select

async def create_user():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.email == "test@test.com"))
        user = result.scalars().first()
        if not user:
            user = User(
                email="test@test.com",
                full_name="Test User",
                hashed_password=get_password_hash("password")
            )
            session.add(user)
        else:
            user.hashed_password = get_password_hash("password")
        await session.commit()
        print("User test@test.com created/updated with password 'password'")

if __name__ == "__main__":
    asyncio.run(create_user())
