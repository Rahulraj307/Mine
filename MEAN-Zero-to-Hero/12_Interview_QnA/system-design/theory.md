# System Design for MEAN Stack

> Design scalable systems from end to end.

---

## 📚 Table of Contents
- [System Design Process](#system-design-process)
- [Common Patterns](#common-patterns)
- [Sample Problem: Design a URL Shortener](#sample-problem-design-a-url-shortener)
- [Sample Problem: Design a Real-Time Chat](#sample-problem-design-a-real-time-chat)

---

## System Design Process

### Step 1: Clarify Requirements (5 min)

**Functional:**
- What features are required?
- Who are the users?
- What are the use cases?

**Non-Functional:**
- Expected scale (users, requests/sec)
- Latency requirements
- Availability vs consistency trade-off

### Step 2: Capacity Estimation (5 min)

```
Users: 10 million
Active users/day: 1 million
Requests/day: 100 million
Requests/second: 100M / 86400 ≈ 1200 RPS

Storage/year: 100M * 365 * 1KB = 36.5 TB
```

### Step 3: High-Level Design (10 min)

Draw boxes for:
- Clients (web, mobile)
- Load balancer
- Application servers
- Database(s)
- Cache
- CDN (if applicable)

### Step 4: Deep Dive Components (15 min)

Pick critical components:
- Database schema
- API design
- Caching strategy
- Scaling approach

### Step 5: Address Bottlenecks (5 min)

- Single points of failure
- Hot spots
- Scaling database
- Cache invalidation

---

## Common Patterns

### Load Balancing

```
              ┌─────────────┐
              │   Client    │
              └──────┬──────┘
                     ↓
              ┌─────────────┐
              │Load Balancer│
              └──────┬──────┘
         ┌───────────┼───────────┐
         ↓           ↓           ↓
    ┌────────┐  ┌────────┐  ┌────────┐
    │Server 1│  │Server 2│  │Server 3│
    └────────┘  └────────┘  └────────┘
```

**Algorithms:**
- Round Robin
- Least Connections
- IP Hash
- Weighted

### Database Scaling

**Vertical:** Bigger machine (limited)
**Horizontal (Sharding):** Split data across machines

```javascript
// Shard by user ID
function getShard(userId) {
  return userId % NUM_SHARDS;
}
```

**Common strategies:**
- Range-based sharding
- Hash-based sharding
- Directory-based sharding

### Caching

```
Client → Cache (Redis) → Database

Cache hit: Return cached data (fast)
Cache miss: Fetch from DB, store in cache
```

**Strategies:**
- **Cache-Aside:** App checks cache, then DB
- **Write-Through:** Write to cache and DB
- **Write-Behind:** Write to cache, async to DB

**Cache Invalidation:**
- TTL (Time to Live)
- Event-based (on update, delete cache)

---

## Sample Problem: Design a URL Shortener

### Requirements

**Functional:**
- Create short URL from long URL
- Redirect short URL to original
- Track click analytics

**Non-Functional:**
- 100 million URLs/month
- Low latency (<100ms)
- High availability

### High-Level Design

```
┌────────────┐     ┌──────────────┐     ┌─────────────┐
│   Client   │────→│ API Gateway  │────→│   Servers   │
└────────────┘     └──────────────┘     └──────┬──────┘
                                               │
                          ┌────────────────────┼────────────────────┐
                          ↓                    ↓                    ↓
                   ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
                   │    Redis    │      │   MongoDB   │      │   Metrics   │
                   │   (cache)   │      │(URL storage)│      │  (clicks)   │
                   └─────────────┘      └─────────────┘      └─────────────┘
```

### Key Decisions

**1. Short URL Generation:**
```javascript
// Option A: Counter-based
// Simple but predictable
shortUrl = base62(counter++);

// Option B: Hash-based
// Collision possible, harder to guess
shortUrl = md5(longUrl).slice(0, 7);

// Option C: Random
// No collision check needed if random enough
shortUrl = randomBase62(7);
```

**2. Database Schema:**
```javascript
{
  _id: "abc1234",      // Short code (indexed)
  longUrl: "https://...",
  createdAt: Date,
  userId: ObjectId,
  clicks: 0
}
```

**3. Redirect Flow:**
```javascript
app.get('/:shortCode', async (req, res) => {
  // Check cache first
  let url = await redis.get(shortCode);
  
  if (!url) {
    url = await db.findOne({ _id: shortCode });
    if (url) {
      await redis.setex(shortCode, 3600, url.longUrl);
    }
  }
  
  if (url) {
    // Async analytics (don't block redirect)
    queueClickEvent(shortCode);
    return res.redirect(301, url.longUrl);
  }
  
  res.status(404).send('Not found');
});
```

### Scaling Considerations

- **Cache hot URLs:** Popular URLs in Redis
- **Shard by short code:** Distribute across DB instances
- **Async analytics:** Queue clicks, process in batch
- **CDN:** Cache redirects at edge (careful with analytics)

---

## Sample Problem: Design a Real-Time Chat

### Requirements

**Functional:**
- 1:1 and group messaging
- Online presence
- Read receipts
- Message history

**Non-Functional:**
- <100ms message delivery
- 10 million concurrent users
- Message persistence

### High-Level Design

```
┌────────────┐          ┌──────────────┐         ┌─────────────┐
│  Clients   │←───────→│  WebSocket   │←───────→│   Message   │
│            │         │   Servers    │         │   Queue     │
└────────────┘         └──────────────┘         └──────┬──────┘
                              │                        │
                              │                        ↓
                       ┌──────┴──────┐          ┌─────────────┐
                       │    Redis    │          │   MongoDB   │
                       │ (presence,  │          │ (messages,  │
                       │  sessions)  │          │   groups)   │
                       └─────────────┘          └─────────────┘
```

### WebSocket Connection Management

```javascript
// Connection handling with Socket.IO
const io = require('socket.io')(server);

io.on('connection', (socket) => {
  const userId = socket.handshake.auth.userId;
  
  // Track user's connection
  redis.sadd(`user:${userId}:connections`, socket.id);
  redis.set(`socket:${socket.id}`, userId);
  
  // Broadcast presence
  io.emit('user:online', userId);
  
  socket.on('message:send', async (data) => {
    // Store message
    const message = await Message.create({
      from: userId,
      to: data.to,
      text: data.text,
      timestamp: Date.now()
    });
    
    // Deliver to recipient(s)
    const recipientSockets = await redis.smembers(`user:${data.to}:connections`);
    recipientSockets.forEach(socketId => {
      io.to(socketId).emit('message:receive', message);
    });
  });
  
  socket.on('disconnect', () => {
    redis.srem(`user:${userId}:connections`, socket.id);
    // Check if user has other connections
    redis.scard(`user:${userId}:connections`).then(count => {
      if (count === 0) {
        io.emit('user:offline', userId);
      }
    });
  });
});
```

### Scaling WebSockets

```
                        ┌─────────────┐
                        │   Client    │
                        └──────┬──────┘
                               │
                        ┌──────┴──────┐
                        │    Nginx    │
                        │(sticky LB)  │
                        └──────┬──────┘
                ┌──────────────┼──────────────┐
                ↓              ↓              ↓
          ┌──────────┐  ┌──────────┐  ┌──────────┐
          │  WS Srv  │  │  WS Srv  │  │  WS Srv  │
          └────┬─────┘  └────┬─────┘  └────┬─────┘
               │             │             │
               └─────────────┴─────────────┘
                        ↓
                ┌──────────────┐
                │ Redis Pub/Sub│  ← Cross-server messaging
                └──────────────┘
```

**Challenge:** User A on Server 1, User B on Server 2

**Solution:** Redis Pub/Sub for cross-server messages
```javascript
// When message comes for user not on this server
redis.publish(`user:${recipientId}:messages`, JSON.stringify(message));

// All servers subscribe
redis.subscribe(`user:*:messages`, (channel, message) => {
  const userId = channel.split(':')[1];
  const sockets = localConnections.get(userId);
  sockets?.forEach(s => s.emit('message:receive', JSON.parse(message)));
});
```

---

## 🎯 System Design Interview Tips

1. **Start with requirements** — Never jump to solution
2. **Think out loud** — Share your thought process
3. **Draw diagrams** — Visual > verbal
4. **Consider scale** — What breaks at 100x?
5. **Discuss trade-offs** — No perfect solution
6. **Be honest** — "I'm not sure, but I'd approach it by..."

---

**Back to**: [Interview Master](../)
