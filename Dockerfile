# Use the official lightweight Nginx image
FROM nginx:alpine

# Copy all your website files to the Nginx web server directory
# This OVERWRITES any existing files with the same name, which is what we want.
COPY . /usr/share/nginx/html
