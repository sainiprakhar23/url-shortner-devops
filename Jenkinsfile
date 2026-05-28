pipeline {
    agent any

    stages {

        stage('Verify Node.js') {
            steps {
                bat 'node -v'
                bat 'npm -v'
            }
        }

        stage('Verify Docker') {
            steps {
                bat 'docker version'
                bat 'docker compose version'
            }
        }

        stage('List Workspace Files') {
            steps {
                bat 'dir'
            }
        }
    }
}

