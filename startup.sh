#!/bin/bash

# Created with the help of ChatGPT

# Function to check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo "Docker is not installed. Please install it."
        exit 1
    fi
}

# Function to set up a Docker container
setup_container() {
    local language=$1
    local image=$2
    
    echo "Setting up Docker container for $language..."

    if ! docker image inspect $image &> /dev/null; then
        echo "Pulling $image..."
        docker pull $image
    fi

    container_name="${language}_dev"

    if ! docker ps -a --format "{{.Names}}" | grep -q "^${container_name}$"; then
        echo "Creating container $container_name..."
        docker create --name $container_name -it $image
    else
        echo "Container $container_name already exists."
    fi
}

# Check Docker installation
check_docker

# List of languages and their Docker images
languages=(
    "python:python:latest"
    "javascript:node:latest"
    "java:openjdk:latest"
    "c:gcc:latest"
    "cpp:gcc:latest"
    "ruby:ruby:latest"
    "go:golang:latest"
    "php:php:latest"
    "swift:swift:latest"
    "kotlin:openjdk:latest"
    "r:r-base:latest"
    "rust:rust:latest"
)

# Set up Docker containers for each language
for entry in "${languages[@]}"; do
    IFS=":" read -r language image <<< "$entry"
    setup_container "$language" "$image"
done

echo "All Docker containers have been set up!"
