# Base image: official Python 3.11 slim
FROM python:3.11-slim

# Set working directory sa loob ng container
WORKDIR /app

# Copy lahat ng files ng current folder papunta sa /app sa container
COPY . /app

# Install dependencies kung meron kang requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# I-expose ang port 5000 (palitan kung ibang port ang gamit mo)
EXPOSE 5000

# Command to run the app kapag nag-start ang container
CMD ["python", "app.py"]
