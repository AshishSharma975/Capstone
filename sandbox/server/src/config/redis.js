import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);
const subscriber = new Redis(process.env.REDIS_URL);

redis.on('error', (err) => console.error('Redis Client Error:', err.message));
subscriber.on('error', (err) => console.error('Redis Subscriber Error:', err.message));


export async function createSandboxKey(sandboxId) {
    await redis.set(`sandbox:${sandboxId}`, JSON.stringify({
        status:'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }),"EX",120)
}

subscriber.config('SET','notify-keyspace-events','Ex').catch(err => {
    console.warn('Failed to set notify-keyspace-events via CONFIG command (this is normal for managed Redis like Redis Cloud/Upstash):', err.message);
});

subscriber.subscribe('__keyevent@0__:expired').catch(err => {
    console.error('Failed to subscribe to keyspace events:', err.message);
});

subscriber.on('message', (channel, key) => {
    if (channel === '__keyevent@0__:expired') {
        console.log('EXPIRED KEY EVENT:', key);
    }
});


export  { redis, subscriber}