# 🔗 URL Shortener API

A production-grade URL Shortener REST API built with **Node.js + Express**, backed by **PostgreSQL**, secured with **JWT**, containerised with **Docker**, deployed to **AWS EC2** via a **Jenkins CI/CD pipeline**, and monitored with **Prometheus + Grafana**.

---

## 🌐 Live Production URLs

| Service | URL |
|---|---|
| 🟢 API | http://16.170.211.69:8000 |
| 📊 Grafana | http://16.170.211.69:3000 |
| 🔥 Prometheus | http://16.170.211.69:9090 |

---

## 🏗️ Architecture Overview

```
GitHub (main branch)
    │
    ▼ webhook / SCM poll
Jenkins CI/CD Pipeline
    ├── Install deps → Run tests
    ├── Build Docker image → Push to Docker Hub
    └── SSH deploy to EC2
            │
            ▼
        docker compose (EC2: eu-north-1)
        ├── app          (Node.js API  :8000)
        ├── db           (PostgreSQL   :5432)
        ├── prometheus   (Metrics      :9090)
        ├── grafana      (Dashboards   :3000)
        └── node-exporter(System stats :9100)
```

---

## 🧱 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Runtime | Node.js 22 + Express | REST API |
| Database | PostgreSQL 15 | Relational data store |
| ORM | Drizzle ORM | Type-safe DB queries & migrations |
| Auth | JWT + bcrypt | Secure authentication |
| Validation | Zod | Request body validation |
| Logging | Winston | Structured request logging |
| Security | Helmet | HTTP security headers |
| Metrics | prom-client | Prometheus metrics at `/metrics` |
| Containerisation | Docker + Docker Compose | Multi-service orchestration |
| CI/CD | Jenkins (Docker-based) | Automated build, test & deploy |
| Registry | Docker Hub | Image storage (`sainiprakhar23/url-shortener`) |
| Monitoring | Prometheus + Grafana | Live metrics & dashboards |
| System Metrics | Node Exporter | Host CPU / memory metrics |
| IaC | Terraform + CloudFormation | AWS infrastructure provisioning |
| Cloud | AWS EC2 (eu-north-1) | Production host |

---

## 📡 API Endpoints

### Auth Routes

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/user/signup` | Register a new user | ❌ |
| `POST` | `/user/login` | Login & receive JWT token | ❌ |

### URL Routes

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/shorten` | Create a short URL (optional custom code) | ✅ |
| `GET` | `/:shortCode` | Redirect to the original URL | ❌ |
| `GET` | `/codes` | List all short URLs for the logged-in user | ✅ |
| `DELETE` | `/:id` | Delete a short URL by ID | ✅ |

### System Routes

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/health` | Health check — returns `{ status: "healthy" }` | ❌ |
| `GET` | `/version` | App version & Node.js version | ❌ |
| `GET` | `/metrics` | Prometheus metrics endpoint | ❌ |

---

## 📖 Example Requests

### Register
```bash
curl -X POST http://16.170.211.69:8000/user/signup \
  -H "Content-Type: application/json" \
  -d '{"firstname":"John","lastname":"Doe","email":"john@example.com","password":"secret123"}'
```

### Login
```bash
curl -X POST http://16.170.211.69:8000/user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"secret123"}'
# → returns { token: "eyJ..." }
```

### Shorten a URL
```bash
curl -X POST http://16.170.211.69:8000/shorten \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"url":"https://www.google.com"}'
# → returns { id, shortCode, targetURL }
```

### Redirect via short code
```bash
curl -L http://16.170.211.69:8000/abc123
# → 302 redirect to the original URL
```

---

## 🚀 Local Development

### Prerequisites
- [Node.js](https://nodejs.org/) v22+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)

### 1. Clone & install

```bash
git clone https://github.com/sainiprakhar23/url-shortner-devops.git
cd URL-Shortener-API
npm install
```

### 2. Environment variables

Create a `.env` file:
```env
DATABASE_URL=postgres://postgres:admin@localhost:5432/postgres
JWT_SECRET=your-secret-key
PORT=8000
```

### 3. Start all services locally

```bash
docker compose up -d
```

This starts: **API** (`:8000`) + **PostgreSQL** (`:5432`) + **Prometheus** (`:9090`) + **Grafana** (`:3000`) + **Node Exporter** (`:9100`).

### 4. Run database migrations

```bash
npx drizzle-kit push
```

### 5. Run tests

```bash
npm test
```

---

## 🐳 Docker

### Build the image
```bash
docker build -t url-shortener .
```

### Run standalone
```bash
docker run -p 8000:8000 --env-file .env url-shortener
```

### Full stack with compose
```bash
# Local (builds from source)
docker compose up -d

# Production (uses pre-built Docker Hub image)
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## 🔄 CI/CD Pipeline (Jenkins)

The pipeline runs on every push to `main`:

```
1. Checkout       → Pull latest code from GitHub
2. Install deps   → npm install
3. Run tests      → npm test (Jest)
4. Build image    → docker build -t sainiprakhar23/url-shortener:<build#>
5. Push to Hub    → docker push sainiprakhar23/url-shortener
6. Deploy to EC2  → SSH → docker compose up -d (all 5 services)
```

### Jenkins Setup
Jenkins runs inside Docker on your local machine:
```bash
docker compose up -d jenkins   # starts at http://localhost:8080
```

### Required Jenkins Credentials
| ID | Type | Used for |
|---|---|---|
| `ec2-server-key` | SSH private key | SSH into EC2 |
| `docker-hub-credentials` | Username/password | Docker Hub login |

---

## 📊 Monitoring

### Prometheus
- URL: http://16.170.211.69:9090
- Scrapes: `app:8000/metrics`, `node-exporter:9100`, `prometheus:9090`
- Retention: 7 days

### Grafana
- URL: http://16.170.211.69:3000  
- Login: `admin` / `admin`
- Auto-provisioned dashboard: **URL Shortener Dashboard** (13 panels)

**Dashboard panels:**
| Panel | Metric |
|---|---|
| Service Status | `up{job="url-shortener"}` |
| Request Rate | `rate(http_requests_total[5m])` |
| Error Rate | 5xx errors % |
| Heap Memory | `nodejs_heap_size_used_bytes` |
| Event Loop Lag | `nodejs_eventloop_lag_seconds` |
| Process Uptime | `process_uptime_seconds` |
| HTTP by Route | per-route request breakdown |
| Latency p50/p95/p99 | histogram quantiles |
| Memory (Used/Total) | heap + external |
| CPU Usage | `process_cpu_seconds_total` |
| Status Code Donut | 2xx / 4xx / 5xx breakdown |
| GC Duration | `nodejs_gc_duration_seconds` |
| Active Handles | `nodejs_active_handles_total` |

---

## 🏗️ Infrastructure as Code

### Terraform (AWS EC2)
```bash
cd terraform
terraform init
terraform plan
terraform apply
```
Provisions: EC2 (t2.micro, Ubuntu 25.04), Security Group (ports 22, 8000, 3000, 9090, 9100).

### CloudFormation
```bash
aws cloudformation deploy \
  --template-file cloudformation/template.yml \
  --stack-name url-shortener
```

---

## 📁 Project Structure

```
├── index.js                        # App entry point
├── routes/
│   ├── user.routes.js              # /user/signup, /user/login
│   └── url.routes.js               # /shorten, /:code, /codes, /:id
├── middlewares/
│   ├── auth.middleware.js          # JWT auth guard
│   ├── metrics.middleware.js       # Prometheus HTTP metrics
│   └── logging.middleware.js       # Winston request logging
├── utils/
│   └── metrics.js                  # prom-client registry & custom metrics
├── db/
│   └── index.js                    # Drizzle ORM DB connection
├── models/
│   └── index.js                    # Drizzle schema (users, urls tables)
├── validation/
│   └── request.validation.js       # Zod schemas
├── tests/
│   └── health.test.js              # Jest health check test
├── grafana/
│   └── provisioning/
│       ├── datasources/prometheus.yml   # Auto-provision Prometheus datasource
│       └── dashboards/
│           ├── dashboard.yml            # Dashboard provider config
│           └── json/url-shortener.json  # 13-panel dashboard
├── prometheus.yml                  # Prometheus scrape config
├── Jenkinsfile                     # CI/CD pipeline definition
├── Dockerfile                      # Multi-stage Node.js build
├── docker-compose.yml              # Local full-stack setup
├── docker-compose.prod.yml         # Production override (pre-built image)
├── terraform/
│   └── main.tf                     # AWS EC2 + Security Group
└── k8s/                            # Kubernetes manifests (HPA, Deployment, Service)
```

---

## 🔐 Environment Variables

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgres://postgres:admin@db:5432/postgres` |
| `JWT_SECRET` | Secret for signing JWT tokens | `supersecret` |
| `PORT` | Port the API listens on | `8000` |

---

## 📦 Docker Hub

Image: [`sainiprakhar23/url-shortener`](https://hub.docker.com/r/sainiprakhar23/url-shortener)

```bash
docker pull sainiprakhar23/url-shortener:latest
```
