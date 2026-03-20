# grep.app Search Endpoint Stress Test

## Scope

These findings are from direct test runs against `https://grep.app/api/search` using the query `import`.

## Summary

- The endpoint handled short, isolated bursts reliably at `5` to `12` concurrent requests.
- Typical successful latency was about `500 ms` average with `p95` generally between `570 ms` and `720 ms`.
- Earlier back-to-back burst tests triggered heavy `429 Too Many Requests` responses, which indicates a rolling or stateful rate-limit window rather than a simple hard concurrency threshold.
- After a cooldown, lighter traffic recovered cleanly.

## Clean Ramp Results

These runs used `40` requests per stage with a `20s` cooldown between stages.

| Concurrency | Success | Failures | Throughput | Avg Latency | P95 Latency | Notes |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| 5 | 40/40 | 0 | 9.55 req/s | 489 ms | 571 ms | Clean |
| 8 | 40/40 | 0 | 14.25 req/s | 540 ms | 723 ms | Clean |
| 10 | 40/40 | 0 | 18.03 req/s | 500 ms | 572 ms | Clean |
| 12 | 40/40 | 0 | 19.85 req/s | 501 ms | 577 ms | Clean |

## Burst Tests That Triggered Rate Limiting

- `100` requests at `10` concurrency: `100/100` succeeded, `19.1 req/s`, `avg 501 ms`, `p95 596 ms`.
- `500` requests at `50` concurrency: `21/500` succeeded, `479` responses were `429`, `avg 987 ms`, `p95 1392 ms`.
- `200` requests at `20` concurrency after that heavier burst: `60/200` succeeded, `140` responses were `429`.
- `120` requests at `12` concurrency immediately after repeated bursts: `15/120` succeeded, `105` responses were `429`.
- After a `15s` cooldown, `50` requests at `5` concurrency recovered to `50/50` success with `avg 482 ms`, `p95 545 ms`.

## Interpretation

- Safe short-burst operation appears to include at least `12` concurrent requests when stages are separated by cooldowns.
- Sustained or repeated bursts can poison later runs and trigger `429` responses even at lower concurrency.
- The limiting behavior appears tied to recent request history, not only the instantaneous worker count.

## Practical Guidance

- Treat `5` to `12` concurrent requests as a reasonable short-burst range.
- Avoid consecutive high-volume bursts without a cooldown period.
- If a client needs higher sustained throughput, it should expect rate limiting and implement backoff and retry behavior.
