FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

RUN apt-get update && apt-get install -y dos2unix
RUN dos2unix /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app/