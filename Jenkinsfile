pipeline {
agent any

stages {

    stage('Verify Environment') {
        steps {
            bat 'node -v'
            bat 'docker version'
            bat 'docker compose version'
        }
    }

    stage('Create Environment File') {
        steps {
            writeFile file: '.env', text: '''
```

DATABASE_URL=postgresql://postgres:admin@db:5432/postgres
PORT=8000
JWT_SECRET=mysecretkey
'''
}
}


    stage('Stop Existing Containers') {
        steps {
            bat 'docker compose down'
        }
    }

    stage('Build Containers') {
        steps {
            bat 'docker compose build'
        }
    }

    stage('Start Containers') {
        steps {
            bat 'docker compose up -d'
        }
    }

    stage('Verify Running Containers') {
        steps {
            bat 'docker ps'
        }
    }
}


}
