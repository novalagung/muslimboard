# build stage
FROM golang:1.25.0 as stage-builder
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
COPY go.mod go.mod
COPY go.sum go.sum
RUN go mod download
COPY . .
RUN sh utility/scripts/build-geonames-db.sh
RUN CGO_ENABLED=0 go build -o binary .

# release stage
FROM gcr.io/distroless/static-debian11 as stage-release
COPY --from=stage-builder /app/binary /
COPY --from=stage-builder /app/data /data
ENTRYPOINT ["/binary"]
