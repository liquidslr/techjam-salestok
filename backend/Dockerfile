##################
# Python builder #
##################

FROM python:3.9 as builder

ENV PYTHONUNBUFFERED=1
# - Activate the virtualenv (created later)
ENV PATH="/venv/bin:$PATH"
ENV VIRTUAL_ENV="/venv"

# - Install system-level packages
#   -  curl - For downloading get-pip.py
# - Create virtualenv using the `venv` module (already activated)
RUN apt-get update \
  && apt-get install -y curl \
  && rm -rf /var/lib/apt/lists/* \
  && python -m venv /venv

# Copy dependency files
COPY ./requirements.txt requirements.txt

# Install pip
RUN curl -sSL https://bootstrap.pypa.io/get-pip.py | python -

# Install Python dependencies using pip
RUN /venv/bin/pip install -r requirements.txt


####################
# Exports backend #
####################

FROM python:3.9-slim as retb

# - Activate the virtualenv (copied from builder)
ENV PATH="/venv/bin:$PATH"

WORKDIR /app

# Copy virtualenv from the builder image
COPY --from=builder /venv /venv

# Install system-level packages, always keep these to a minimum
# - libmagic1                               - For django-versatileimagefield
# - libpangocairo-1.0-0, libgdk-pixbuf2.0-0 - For weasyprint
RUN apt-get update \
  && apt-get install -y libmagic1 libpangocairo-1.0-0 libgdk-pixbuf2.0-0 \
  && rm -rf /var/lib/apt/lists/*

RUN mkdir /app/logs

# Add our application code to the image
COPY . /app/

# Exposes
# - 8000: Gunicorn server
EXPOSE 8000

# Set the working directory to the root of the project
WORKDIR /app

# Run Gunicorn, can be overridden from Docker Compose
CMD python manage.py migrate && gunicorn --workers=4 --threads=8 --reload --bind 0.0.0.0:8000 --access-logfile - backend.wsgi:application