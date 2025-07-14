FROM python:3.11

WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install dependencies
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copy the rest of the application
COPY . .

# Set Python path to include the current directory
ENV PYTHONPATH=/app

# Expose port
EXPOSE 5000

CMD ["python", "wsgi.py"]
