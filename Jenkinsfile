pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'url-shortener'
        DOCKER_TAG = "${BUILD_NUMBER}"
        REGISTRY = 'rk936503'
    }

    tools {
        nodejs 'NodeJS-22'    
    }

    stages {
        stage('Checkout') {
            steps {
                echo ' Pulling source code...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo ' Installing packages...'
                sh 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                echo ' Running tests...'
                sh 'npm test'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo ' Building Docker image...'
                sh "docker build -t ${REGISTRY}/${DOCKER_IMAGE}:${DOCKER_TAG} ."
                sh "docker tag ${REGISTRY}/${DOCKER_IMAGE}:${DOCKER_TAG} ${REGISTRY}/${DOCKER_IMAGE}:latest"
            }
        }

        stage('Push to Registry') {
            steps {
                echo ' Pushing to Docker Hub...'
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh "echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin"
                    sh "docker push ${REGISTRY}/${DOCKER_IMAGE}:${DOCKER_TAG}"
                    sh "docker push ${REGISTRY}/${DOCKER_IMAGE}:latest"
                }
            }
        }

                stage('Deploy to EC2') {
            steps {
                echo '🚀 Deploying all services to production...'
                sshagent(['ec2-server-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ubuntu@16.170.211.69 '
                            set -e

                            # ── 0. Ensure Docker Compose V2 plugin is installed ──
                            if ! docker compose version > /dev/null 2>&1; then
                                sudo mkdir -p /usr/local/lib/docker/cli-plugins
                                sudo curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64" -o /usr/local/lib/docker/cli-plugins/docker-compose
                                sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
                            fi

                            # ── 1. Clone repo on first deploy, or pull latest ──
                            if [ -d /home/ubuntu/app/.git ]; then
                                cd /home/ubuntu/app
                                git fetch origin main
                                git reset --hard origin/main
                            else
                                git clone https://github.com/rk936503/URL-Shortener-API.git /home/ubuntu/app
                            fi

                            # ── 2. Write production .env ──
                            printf "DATABASE_URL=postgres://postgres:admin@db:5432/postgres\nJWT_SECRET=supersecret\nPORT=8000\n" > /home/ubuntu/app/.env

                            # ── 3. Pull the freshly built app image ──
                            docker pull ${REGISTRY}/${DOCKER_IMAGE}:${DOCKER_TAG}
                            docker tag ${REGISTRY}/${DOCKER_IMAGE}:${DOCKER_TAG} ${REGISTRY}/${DOCKER_IMAGE}:latest

                            # ── 3.5. Remove old standalone container holding port 8000 ──
                            docker stop url-shortener 2>/dev/null || true
                            docker rm   url-shortener 2>/dev/null || true

                            # ── 4. Bring up all production services ──
                            cd /home/ubuntu/app
                            # Remove stale grafana volume so it re-reads provisioning with correct uid
                            docker rm -f app-grafana-1 2>/dev/null || true
                            docker volume rm app_grafana_data 2>/dev/null || true
                            docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --remove-orphans app db prometheus grafana node-exporter
                        '
                    """
                }
            }
        }

    }

    post {
        success { echo '✅ Pipeline completed successfully!' }
        failure { echo '❌ Pipeline failed!' }
    }
}