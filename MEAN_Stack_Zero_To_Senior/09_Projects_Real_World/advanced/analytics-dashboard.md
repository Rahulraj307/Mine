# Advanced Project: Real-Time Analytics Dashboard

> Build an enterprise-grade dashboard with real-time data visualization.

---

## 🎯 What You'll Learn

- WebSocket real-time updates
- MongoDB aggregation pipelines
- Data visualization with charts
- Performance optimization
- Caching strategies
- Microservices patterns

---

## 📋 Features

- [ ] Real-time metrics display
- [ ] Interactive charts (line, bar, pie)
- [ ] Date range filtering
- [ ] Multiple data sources
- [ ] Export to CSV/PDF
- [ ] Custom dashboards
- [ ] Alerting system

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client (Angular)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Dashboard   │  │   Charts     │  │   Alerts     │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP + WebSocket
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway (Express)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   REST API   │  │  Socket.IO   │  │    Auth      │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└────────────────────────────┬────────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ↓                   ↓                   ↓
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│    MongoDB     │  │     Redis      │  │   Message Q    │
│   (Storage)    │  │    (Cache)     │  │   (Events)     │
└────────────────┘  └────────────────┘  └────────────────┘
```

---

## 🗄️ Database Schema

```javascript
// Event Schema (time-series)
const eventSchema = new Schema({
  type: { type: String, required: true, index: true },
  source: { type: String, required: true },
  data: Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' }
});

// Create time-series collection
db.createCollection("events", {
  timeseries: {
    timeField: "timestamp",
    metaField: "source",
    granularity: "seconds"
  }
});

// Dashboard Schema
const dashboardSchema = new Schema({
  name: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  widgets: [{
    type: { type: String, enum: ['line', 'bar', 'pie', 'metric'] },
    title: String,
    query: {
      eventType: String,
      aggregation: String,
      groupBy: String,
      dateRange: String
    },
    position: { x: Number, y: Number, w: Number, h: Number }
  }],
  isPublic: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
```

---

## 📝 Backend Implementation

### Aggregation Service

```javascript
// server/src/services/analytics.service.js
class AnalyticsService {
  
  async getMetrics(eventType, dateRange, groupBy) {
    const { startDate, endDate } = this.parseDateRange(dateRange);
    
    const pipeline = [
      // Match date range and event type
      {
        $match: {
          type: eventType,
          timestamp: { $gte: startDate, $lte: endDate }
        }
      },
      
      // Group by time bucket
      {
        $group: {
          _id: this.getGroupExpression(groupBy),
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' },
          avgValue: { $avg: '$data.value' }
        }
      },
      
      // Format output
      {
        $project: {
          timestamp: '$_id',
          count: 1,
          uniqueUsers: { $size: '$uniqueUsers' },
          avgValue: { $round: ['$avgValue', 2] }
        }
      },
      
      // Sort by time
      { $sort: { timestamp: 1 } }
    ];
    
    return Event.aggregate(pipeline);
  }
  
  getGroupExpression(groupBy) {
    switch (groupBy) {
      case 'hour':
        return {
          $dateToString: {
            format: '%Y-%m-%d %H:00',
            date: '$timestamp'
          }
        };
      case 'day':
        return {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$timestamp'
          }
        };
      case 'week':
        return { $isoWeek: '$timestamp' };
      default:
        return { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } };
    }
  }
  
  parseDateRange(range) {
    const now = new Date();
    switch (range) {
      case '24h':
        return {
          startDate: new Date(now - 24 * 60 * 60 * 1000),
          endDate: now
        };
      case '7d':
        return {
          startDate: new Date(now - 7 * 24 * 60 * 60 * 1000),
          endDate: now
        };
      case '30d':
        return {
          startDate: new Date(now - 30 * 24 * 60 * 60 * 1000),
          endDate: now
        };
      default:
        return { startDate: new Date(0), endDate: now };
    }
  }
}

module.exports = new AnalyticsService();
```

### Real-Time Updates with Socket.IO

```javascript
// server/src/services/realtime.service.js
const { Server } = require('socket.io');
const redis = require('./redis');

class RealtimeService {
  init(httpServer) {
    this.io = new Server(httpServer, {
      cors: { origin: process.env.CLIENT_URL }
    });
    
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
      
      // Subscribe to dashboard updates
      socket.on('subscribe:dashboard', (dashboardId) => {
        socket.join(`dashboard:${dashboardId}`);
      });
      
      // Subscribe to specific metrics
      socket.on('subscribe:metric', (metricType) => {
        socket.join(`metric:${metricType}`);
      });
      
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
    
    // Listen for new events from Redis pub/sub
    this.subscribeToEvents();
  }
  
  async subscribeToEvents() {
    const subscriber = redis.duplicate();
    await subscriber.subscribe('new_event');
    
    subscriber.on('message', (channel, message) => {
      const event = JSON.parse(message);
      
      // Broadcast to subscribed clients
      this.io.to(`metric:${event.type}`).emit('metric:update', {
        type: event.type,
        value: event.data.value,
        timestamp: event.timestamp
      });
    });
  }
  
  emitDashboardUpdate(dashboardId, data) {
    this.io.to(`dashboard:${dashboardId}`).emit('dashboard:update', data);
  }
}

module.exports = new RealtimeService();
```

### Caching Layer

```javascript
// server/src/middleware/cache.middleware.js
const redis = require('../services/redis');

const cacheMiddleware = (ttlSeconds = 60) => {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    
    try {
      const cached = await redis.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
      
      // Store original json method
      const originalJson = res.json.bind(res);
      
      // Override json method to cache response
      res.json = async (data) => {
        await redis.setex(key, ttlSeconds, JSON.stringify(data));
        return originalJson(data);
      };
      
      next();
    } catch (error) {
      next();  // Continue without cache on error
    }
  };
};

module.exports = cacheMiddleware;
```

---

## 📝 Frontend Implementation

### Dashboard Service with WebSocket

```typescript
// client/src/app/features/dashboard/services/dashboard.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, merge } from 'rxjs';
import { io, Socket } from 'socket.io-client';

export interface MetricData {
  type: string;
  value: number;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private socket: Socket;
  private metricsSubject = new Subject<MetricData>();
  
  metrics$ = this.metricsSubject.asObservable();
  
  constructor(private http: HttpClient) {
    this.initSocket();
  }
  
  private initSocket(): void {
    this.socket = io(environment.wsUrl, {
      transports: ['websocket']
    });
    
    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });
    
    this.socket.on('metric:update', (data: MetricData) => {
      this.metricsSubject.next(data);
    });
  }
  
  subscribeToMetric(metricType: string): void {
    this.socket.emit('subscribe:metric', metricType);
  }
  
  getHistoricalData(
    eventType: string,
    dateRange: string,
    groupBy: string
  ): Observable<MetricData[]> {
    return this.http.get<MetricData[]>('/api/analytics/metrics', {
      params: { eventType, dateRange, groupBy }
    });
  }
  
  getDashboard(id: string): Observable<Dashboard> {
    return this.http.get<Dashboard>(`/api/dashboards/${id}`);
  }
}
```

### Real-Time Chart Component

```typescript
// client/src/app/features/dashboard/components/realtime-chart.component.ts
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-realtime-chart',
  template: `
    <div class="chart-container">
      <div class="chart-header">
        <h3>{{ title }}</h3>
        <select [(ngModel)]="dateRange" (change)="loadData()">
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
      </div>
      <canvas #chartCanvas></canvas>
    </div>
  `
})
export class RealtimeChartComponent implements OnInit, OnDestroy {
  @Input() title!: string;
  @Input() metricType!: string;
  
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;
  
  private chart!: Chart;
  private destroy$ = new Subject<void>();
  dateRange = '24h';
  
  constructor(private dashboardService: DashboardService) {}
  
  ngOnInit(): void {
    this.loadData();
    this.subscribeToUpdates();
  }
  
  loadData(): void {
    this.dashboardService
      .getHistoricalData(this.metricType, this.dateRange, 'hour')
      .subscribe(data => {
        this.updateChart(data);
      });
  }
  
  private subscribeToUpdates(): void {
    this.dashboardService.subscribeToMetric(this.metricType);
    
    this.dashboardService.metrics$
      .pipe(takeUntil(this.destroy$))
      .subscribe(metric => {
        if (metric.type === this.metricType) {
          this.addDataPoint(metric);
        }
      });
  }
  
  private updateChart(data: MetricData[]): void {
    const labels = data.map(d => d.timestamp);
    const values = data.map(d => d.value);
    
    if (this.chart) {
      this.chart.data.labels = labels;
      this.chart.data.datasets[0].data = values;
      this.chart.update();
    } else {
      this.chart = new Chart(this.chartCanvas.nativeElement, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: this.title,
            data: values,
            borderColor: '#4a90d9',
            tension: 0.4,
            fill: true,
            backgroundColor: 'rgba(74, 144, 217, 0.1)'
          }]
        },
        options: {
          responsive: true,
          animation: { duration: 0 },
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    }
  }
  
  private addDataPoint(metric: MetricData): void {
    if (this.chart) {
      this.chart.data.labels!.push(metric.timestamp);
      this.chart.data.datasets[0].data.push(metric.value);
      
      // Keep last 100 points
      if (this.chart.data.labels!.length > 100) {
        this.chart.data.labels!.shift();
        this.chart.data.datasets[0].data.shift();
      }
      
      this.chart.update();
    }
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.chart?.destroy();
  }
}
```

---

## 🚀 Performance Optimizations

### 1. Aggregation Caching

```javascript
// Pre-compute and cache common aggregations
const CACHE_DURATIONS = {
  'realtime': 5,      // 5 seconds
  'hourly': 60,       // 1 minute
  'daily': 300,       // 5 minutes
  'weekly': 900       // 15 minutes
};
```

### 2. Data Sampling for Large Datasets

```javascript
// Sample data points for smooth visualization
function sampleData(data, maxPoints = 100) {
  if (data.length <= maxPoints) return data;
  
  const step = Math.ceil(data.length / maxPoints);
  return data.filter((_, index) => index % step === 0);
}
```

### 3. OnPush Change Detection

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ...
})
```

---

## 🎯 Challenges to Extend

1. **Custom Alerts:** Email/Slack when metrics exceed threshold
2. **Multi-tenant:** Separate data by organization
3. **Export Reports:** Scheduled PDF/Excel reports
4. **Machine Learning:** Anomaly detection
5. **Mobile App:** React Native companion

---

**Back to**: [Projects Overview](../)
