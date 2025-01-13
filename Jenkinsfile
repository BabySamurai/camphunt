pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'spystra/camphunt' // Replace with your Docker Hub username and image name
        DOCKER_TAG = 'latest' // You can replace this with dynamic tags if needed, e.g., a Git commit hash
        REGISTRY_CREDENTIALS = 'b7395517-d211-4179-8f7f-017ee0e7ae24' // Replace with your Jenkins credentials ID for Docker Hub
        TRIVY_SEVERITY = 'CRITICAL,HIGH' // Define the vulnerability levels to scan
        KUBECONFIG = "%USERPROFILE%\\.kube\\config" // Path to kubeconfig for Minikube on Windows
    }

    stages {
        stage('Build Docker Image') {
            steps {
                script {
                    echo 'Building the Docker image...'
                    bat 'docker build -t %DOCKER_IMAGE%:%DOCKER_TAG% .'
                }
            }
        }

        stage('Scan for Vulnerabilities') {
            steps {
                script {
                    echo 'Scanning the Docker image for vulnerabilities using Trivy...'
                    bat '''
                    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock ^
                        aquasec/trivy image --severity %TRIVY_SEVERITY% %DOCKER_IMAGE%:%DOCKER_TAG%
                    '''
                }
            }
        }

        stage('Push Docker Image to Docker Hub') {
            steps {
                script {
                    echo 'Pushing the Docker image to Docker Hub...'
                    withCredentials([usernamePassword(credentialsId: "${REGISTRY_CREDENTIALS}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        bat '''
                        docker login -u "%DOCKER_USER%" -p "%DOCKER_PASS%"
                        docker push %DOCKER_IMAGE%:%DOCKER_TAG%
                        '''
                    }
                }
            }
        }

        stage('Start Minikube') {
            steps {
                script {
                    echo 'Starting Minikube...'
                    //bat '''
                    //minikube status || minikube start --driver=docker
                    //'''
                }
            }
        }

        stage('Deploy Application to Minikube using Helm') {
            steps {
                script {
                    echo 'Deploying the application to Minikube using Helm...'
                    bat '''
                    helm upgrade --install camphunt ./camphunt ^
                        --set image.repository=%DOCKER_IMAGE% ^
                        --set image.tag=%DOCKER_TAG%
                    '''
                }
            }
        }

        stage('Verify Deployment') {
            steps {
                script {
                    echo 'Verifying the application deployment...'
                    bat '''
                    kubectl rollout status deployment/camphunt
                    '''
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
