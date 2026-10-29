FROM python:3.13.5-slim

WORKDIR /usr/src/app

COPY requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt


# Step 2.

COPY . .

EXPOSE 8000

CMD ["gunicorn", "--bind=0.0.0.0:8000", "app:app"]


