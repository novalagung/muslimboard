# build stage
FROM golang:1.18 as stage-builder
WORKDIR /app
COPY go.mod go.mod
COPY go.sum go.sum
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o binary .

# release stage
FROM gcr.io/distroless/static-debian11 as stage-release
COPY --from=stage-builder /app/binary /
ENTRYPOINT ["/binary"]
