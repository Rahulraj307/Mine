# 📘 MASTER INTERVIEW Q&A: MongoDB (Zero to Hero)
> **Section 7: MongoDB (Document Databases, Aggregation, Scaling – 2025)**
> From "What is a Document?" to Aggregation Pipelines, Indexing, and Sharding.

---

## 🟢 Part 1: The Core (Documents & CRUD)

### 1️⃣ What is MongoDB? SQL vs NoSQL?
**Answer:**
MongoDB is a **document-oriented NoSQL database**. Data is stored in flexible, JSON-like documents (BSON).

| Feature | SQL (Relational) | NoSQL (MongoDB) |
| :--- | :--- | :--- |
| **Data Model** | Tables with Rows | Collections with Documents |
| **Schema** | Fixed Schema | Flexible Schema |
| **Joins** | `JOIN` clause | `$lookup` (Aggregation) or Embedding |
| **Scaling** | Vertical (bigger server) | Horizontal (Sharding) |
| **Best For** | Complex relationships, Transactions | Rapid development, Unstructured data |

### 2️⃣ BSON vs JSON
**Answer:**
*   **JSON**: JavaScript Object Notation. Text-based.
*   **BSON**: Binary JSON. MongoDB's internal storage format. Faster to parse, supports more types (`Date`, `ObjectId`, `Binary`).

### 3️⃣ Document Modeling: Embed vs Reference
**Answer:**
This is a **critical design decision**.
*   **Embedding**: Nest related data inside a single document. Fast reads (1 query). Best when data is always accessed together.
*   **Referencing**: Store a reference (`_id`) to another document. Avoids data duplication. Best for many-to-many or large sub-documents.

```javascript
// Embedding (1-to-Few)
{ _id: 1, name: 'Rahul', addresses: [{ city: 'Delhi' }, { city: 'Mumbai' }] }

// Referencing (1-to-Many, Many-to-Many)
{ _id: 1, name: 'Rahul', addressIds: [101, 102] }
// In 'addresses' collection: { _id: 101, city: 'Delhi' }
```

**Rule of Thumb:**
*   Embed if data is queried together and rarely changes.
*   Reference if data is large, changes frequently, or accessed independently.

### 4️⃣ Basic CRUD Operations
**Answer:**
```javascript
// CREATE
db.users.insertOne({ name: 'Rahul', age: 30 });

// READ
db.users.find({ age: { $gte: 25 } }); // age >= 25
db.users.findOne({ _id: ObjectId('...') });

// UPDATE
db.users.updateOne({ _id: id }, { $set: { age: 31 } }); // Update specific fields
db.users.updateMany({}, { $inc: { age: 1 } }); // Increment all ages

// DELETE
db.users.deleteOne({ _id: id });
```

---

## 🟡 Part 2: Aggregation Framework (Interview Gold 🔥)

### 5️⃣ What is the Aggregation Pipeline?
**Answer:**
A powerful framework for data transformation and analysis. Data passes through a series of **stages**, each transforming the documents.

### 6️⃣ Key Aggregation Stages
**Answer:**
| Stage | Description |
| :--- | :--- |
| `$match` | Filters documents (like `find`). **Always use early** to reduce data. |
| `$project` | Reshapes documents (include, exclude, add fields). |
| `$group` | Groups documents by a key and performs aggregations (`$sum`, `$avg`). |
| `$sort` | Sorts documents. |
| `$limit` / `$skip` | Pagination. |
| `$lookup` | Performs a left outer join with another collection. |
| `$unwind` | Deconstructs an array field into multiple documents. |

### 7️⃣ Aggregation Example: Sales Report
**Answer:**
**Goal:** Get total revenue per product category.
```javascript
db.orders.aggregate([
  { $match: { status: 'completed' } },           // 1. Filter completed orders
  { $unwind: '$items' },                          // 2. Flatten items array
  { $group: {                                     // 3. Group by category
      _id: '$items.category',
      totalRevenue: { $sum: '$items.price' },
      count: { $sum: 1 }
    }
  },
  { $sort: { totalRevenue: -1 } }                 // 4. Sort by revenue descending
]);
```

### 8️⃣ `$lookup` Example (Joining Collections)
**Answer:**
```javascript
// Join 'orders' with 'users' to get user details
db.orders.aggregate([
  {
    $lookup: {
      from: 'users',           // The collection to join
      localField: 'userId',    // Field in 'orders'
      foreignField: '_id',     // Field in 'users'
      as: 'userDetails'        // Output array field
    }
  },
  { $unwind: '$userDetails' }  // Flatten the array to a single object
]);
```

---

## 🔵 Part 3: Indexing (Performance)

### 9️⃣ Why are Indexes Important?
**Answer:**
Without an index, MongoDB performs a **Collection Scan** (reads every document). With an index, it uses a **B-Tree** structure for fast lookups.
*   **Analogy:** Index in a book vs reading every page.

### 🔟 Types of Indexes
**Answer:**
| Type | Description | Command |
| :--- | :--- | :--- |
| **Single Field** | Index on one field | `db.col.createIndex({ name: 1 })` |
| **Compound** | Index on multiple fields | `db.col.createIndex({ name: 1, age: -1 })` |
| **Text** | For full-text search | `db.col.createIndex({ description: 'text' })` |
| **Unique** | Enforces uniqueness | `db.col.createIndex({ email: 1 }, { unique: true })` |
| **TTL** | Auto-deletes documents after time | `db.logs.createIndex({ createdAt: 1 }, { expireAfterSeconds: 3600 })` |

### 1️⃣1️⃣ Compound Index Order Matters
**Answer:**
For a compound index `{ a: 1, b: 1 }`:
*   ✅ Supports queries on `{ a: ... }` or `{ a: ..., b: ... }`.
*   ❌ Does **NOT** efficiently support queries on `{ b: ... }` alone.

**Rule:** Place high-cardinality (many unique values) and frequently filtered fields first.

### 1️⃣2️⃣ `explain()` – Analyzing Query Performance
**Answer:**
```javascript
db.users.find({ age: { $gt: 25 } }).explain('executionStats');
```
**Key Metrics to Check:**
*   `winningPlan.stage`: `IXSCAN` (good) vs `COLLSCAN` (bad).
*   `totalDocsExamined`: Should be close to `nReturned`.

---

## 🔴 Part 4: Scaling (Replication & Sharding)

### 1️⃣3️⃣ Replica Sets (High Availability)
**Answer:**
A group of `mongod` instances that maintain the same data set.
*   **Primary**: Receives all writes.
*   **Secondaries**: Replicate data from Primary. Can serve reads.
*   **Arbiter**: Votes in elections but holds no data.
*   **Automatic Failover**: If Primary dies, a Secondary is elected as the new Primary.

### 1️⃣4️⃣ Sharding (Horizontal Scaling)
**Answer:**
Distributes data across multiple machines.
*   **Shard Key**: The field used to distribute documents (e.g., `userId`). Chosen at design time. **Hard to change later.**
*   **Chunks**: Ranges of shard key values. MongoDB auto-balances chunks across shards.
*   **Use When:** Data is too large for one server or read/write load is too high.

---

## 🔥 Part 5: Rapid Fire (Senior Check)

*   **What is `ObjectId`?**
    *   A 12-byte unique identifier: 4-byte timestamp, 5-byte random, 3-byte counter.
*   **Transactions in MongoDB?**
    *   Supported since v4.0 for replica sets and v4.2 for sharded clusters. Use for multi-document atomicity.
*   **`$push` vs `$addToSet`?**
    *   `$push`: Adds element (allows duplicates). `$addToSet`: Adds only if not present.
*   **How to prevent N+1 queries?**
    *   Use `$lookup` in aggregation or embed data to fetch everything in one query.
