pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'spystra/camphunt' // Replace with your Docker Hub username and image name
        DOCKER_TAG = 'latest' // You can replace this with dynamic tags if needed, e.g., a Git commit hash
        REGISTRY_CREDENTIALS = 'aa5002d7-b7b7-4fdd-be65-bf63e8f1a980' // Replace with your Jenkins credentials ID for Docker Hub
        TRIVY_SEVERITY = 'CRITICAL,HIGH' // Define the vulnerability levels to scan
    }

    stages {
        stage('Build Docker Image') {
            steps {
                script {
                    echo 'Building the Docker image...'
                    sh 'docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} .'
                }
            }
        }

        stage('Scan for Vulnerabilities') {
            steps {
                script {
                    echo 'Scanning the Docker image for vulnerabilities using Trivy...'
                    sh '''
                    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                        aquasec/trivy image --severity ${TRIVY_SEVERITY} ${DOCKER_IMAGE}:${DOCKER_TAG}
                    '''
                }
            }
        }

        stage('Push Docker Image to Docker Hub') {
            steps {
                script {
                    echo 'Pushing the Docker image to Docker Hub...'
                    withCredentials([usernamePassword(credentialsId: "${REGISTRY_CREDENTIALS}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                        docker push ${DOCKER_IMAGE}:${DOCKER_TAG}
                        '''
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline execution completed.'
        }
        success {
            echo 'Pipeline executed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check the logs for details.'
        }
    }
}
