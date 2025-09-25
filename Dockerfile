# Use the official lightweight Nginx image
FROM nginx:alpine

# Copy all your website files to the Nginx web server directory
COPY . /usr/share/nginx/html

# Expose port 80 (REQUIRED for Azure Web App)
EXPOSE 80

# Start Nginx in foreground (REQUIRED for containers)
CMD ["nginx", "-g", "daemon off;"]