import asyncio
import sys
sys.path.append('c:/APP/backend')
from app.db.session import AsyncSessionLocal
from app.db.models import User
from app.core.security import get_password_hash
from sqlalchemy import select
async def reset():
    db = AsyncSessionLocal()
    result = await db.execute(select(User).where(User.email == 'r.swathishreddy05@gmail.com'))
    user = result.scalars().first()
    if user:
        user.hashed_password = get_password_hash('Password@123')
        await db.commit()
        print('Password reset to Password@123')
    else:
        print('User not found')
asyncio.run(reset())
