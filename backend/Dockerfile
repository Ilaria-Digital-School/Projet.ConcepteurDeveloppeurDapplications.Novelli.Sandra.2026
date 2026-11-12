FROM python:3.13-slim

WORKDIR /app

COPY backend/requirements.txt ./backend/

RUN pip install --no-cache-dir -r backend/requirements.txt

RUN pip install --no-cache-dir gunicorn

COPY backend/ ./backend/

COPY frontend/ ./frontend/

WORKDIR /app/backend

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
