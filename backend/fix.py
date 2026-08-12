import asyncio
from app.db.session import AsyncSessionLocal
from app.db.models import User
from app.core.security import get_password_hash
from sqlalchemy import select

async def fix():
    async with AsyncSessionLocal() as session:
        res = await session.execute(select(User).where(User.email=='admin@cognivuex.com'))
        u = res.scalars().first()
        if u:
            u.hashed_password = get_password_hash('admin123')
            await session.commit()
            print('fixed user')
        else:
            print('user not found')

asyncio.run(fix())
