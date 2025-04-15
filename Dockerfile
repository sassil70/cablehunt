# Production Dockerfile for CableHunt Networks on Google Cloud Run
FROM nginx:alpine-slim

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy web platform files and open-access academic research archive to webroot
COPY index.html /usr/share/nginx/html/
COPY CITATION.cff /usr/share/nginx/html/CITATION.cff
COPY assets/ /usr/share/nginx/html/assets/
COPY papers/ /usr/share/nginx/html/papers/

# Expose port 8080 (Google Cloud Run standard)
EXPOSE 8080

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
