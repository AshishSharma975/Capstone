import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

redis.on('connect', ()=>{
    console.log('connect to redis successfully')
})

redis.on('error',(err)=>{
    console.log('redis connection error',err)
})

export async function refreshTTL(sandboxId) {
    await redis.expire(`sandbox:${sandboxId}`, 120)
}