import Redis from 'ioredis';


const redisClient = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,   
    retryStrategy: (times) => {
        if (times > 3) return null; // Stop retrying after 3 attempts
        return 2000; 
    }
});


redisClient.on('connect', () => {
    console.log('Redis connected');
})

export default redisClient;