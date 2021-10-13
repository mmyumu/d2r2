# First stage use dvelopment python full image
FROM python:3.10.0-bullseye AS builder
COPY . /code

# COPY poetry.lock .
RUN pip install --user /code/

# Install poetry
# RUN pip install poetry

#RUN poetry config virtualenvs.create false \
#  && poetry install $(test "$YOUR_ENV" == production && echo "--no-dev") --no-interaction --no-ansi

# RUN poetry config virtualenvs.create false \
  # && poetry install --no-interaction --no-ansi

# Install dependencies to the cache user directory (eg. /root/.cache)
# RUN poetry install

# Second stage use runtime python slim image
FROM python:3.10.0-slim-bullseye
WORKDIR /code

# Copy only the dependencies installation from the 1st stage image
COPY --from=builder /root/.local /root/.local
# COPY --from=builder /code .

ENV PATH=/root/.local/bin:$PATH
# ENV PYTHONPATH=/root/.cache:$PATH

CMD [ "d2r2" ]