# Use the version you specified
FROM python:3.14.3-alpine3.23

# Set the working directory
WORKDIR /app

# Install system dependencies (Alpine needs these for some python libs)
RUN apk add --no-cache gcc musl-dev linux-headers

# Copy requirements and install
# Create a requirements.txt with 'Faker' and any other libs inside
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your generator code
COPY . .

CMD ["python", "main.py"]