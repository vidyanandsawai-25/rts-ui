# Live MIS API Extreme Vitest Suite: Report and Interpretation Guide

This document explains the live test implemented in
[`rtsmisdashboard.live.performance.test.ts`](./rtsmisdashboard.live.performance.test.ts).
It is written as a practical guide for engineers who need to run the test, read its output, and
avoid drawing incorrect conclusions from a single performance run.

## 1. What this test is for

The suite tests the real MIS API used by `getRtsMisDashboardData`. It has two separate purposes:

1. **Functional testing** checks that each API flag returns the expected response structure and
   that search, filter, and pagination parameters behave correctly.
2. **Load observation** sends controlled batches of simultaneous requests and records response
   time, throughput, payload, failures, Node.js CPU, Node.js heap, and event-loop delay.

This is a live integration and performance-observation test. It is not a unit test, and it is not
a formal capacity certification for the MIS server.

## 2. Safety: why normal test runs skip it

The suite is disabled unless this exact environment variable is set:

```powershell
$env:RUN_LIVE_RTS_MIS_TESTS = '1'
```

This guard is important because the suite:

- calls a real external server;
- depends on live data that can change;
- creates a deliberate concurrency ramp up to 50 simultaneous requests;
- takes much longer than an ordinary unit test; and
- should not run automatically on every developer machine or routine CI job.

When the variable is absent, Vitest discovers the file but skips all 25 tests. No MIS requests are
made.

## 3. How to run it

From the frontend directory:

```powershell
cd C:\Dev\Branch-RTS_NEW_DEV-23-06-2026\ntis-ui-demo2\ntis-ui-demo1\ntis-ui-demo2
$env:RUN_LIVE_RTS_MIS_TESTS = '1'
$env:RTS_MIS_TEST_SERVICE_ID = ''
npx vitest run "src/__tests__/lib/api/rts/rtsmisdashboard.live.performance.test.ts" --reporter=verbose --disableConsoleIntercept
```

To include the optional service filter test, provide a valid live MIS service ID:

```powershell
$env:RTS_MIS_TEST_SERVICE_ID = '123'
```

To return to safe, normal behavior:

```powershell
Remove-Item Env:RUN_LIVE_RTS_MIS_TESTS -ErrorAction SilentlyContinue
Remove-Item Env:RTS_MIS_TEST_SERVICE_ID -ErrorAction SilentlyContinue
```

## 4. What the three API flags mean

### `user`

This flag returns application records for a user-oriented search. The suite checks:

- exact application number `RTS00036239`;
- UPIC `AKLMC000011`;
- an intentionally unknown application number;
- the response contract when parameters not normally used by this flag are also supplied; and
- null fields and Unicode values without printing personal information.

The corresponding collection is `userApplicationDashboardData`.

### `admin`

This flag returns aggregate department and service information. The suite uses department ID `1`
and department name `Property Tax`, then checks:

- modules `RTS`, `AapleSarkar`, and `Offline`;
- no dates;
- `FromDate` only;
- `ToDate` only; and
- the complete range `2026-02-09` to `2026-04-20`.

The primary collections are `departmentWiseApplications` and `serviceWiseApplications`. Counts
must be numeric, non-negative, and internally consistent. The test does not require every module
or date range to contain records because live totals legitimately change.

`DeparmentId` and `DeparmentName` are intentionally misspelled in the request because that spelling
is part of the external API contract.

### `RTSApplicationDashboard`

This flag returns the paginated dashboard list. The suite checks:

- page sizes `1`, `10`, `50`, and `100`;
- an observational probe using page size `101`;
- page 1, page 2, and a page beyond the available data;
- application-number fragment `00011`;
- statuses `Pending`, `Approved`, `Rejected`, and `Reverted`;
- department plus date-range filtering; and
- optional service filtering when `RTS_MIS_TEST_SERVICE_ID` is supplied.

The corresponding collection is `rtsApplicationDashboardDetails`.

## 5. Functional results from this run

The supplied run produced the following important observations:

| Scenario | Observed result | Meaning |
| --- | ---: | --- |
| Exact user application search | 1 row | The exact application-number lookup returned a matching record. |
| User UPIC search | 16 rows | The UPIC can be linked to multiple application records. |
| Unknown user application | `status: false` | The live API represents “not found” as an unsuccessful status instead of a successful empty collection. The test accepts and documents this contract. |
| Admin `RTS` module | 13 departments, 7 services | Aggregate collections were structurally valid. |
| Admin `AapleSarkar` module | 3 departments, 2 services | The module returned a smaller but valid aggregate response. |
| Admin `Offline` module | 2 departments, 7 services | Empty or different-sized aggregates are allowed when structurally valid. |
| Dashboard page size `101` | Accepted, 101 rows | This server accepted 101 in this run. It must not be treated as a permanent documented limit. |
| Dashboard application fragment `00011` | 0 rows | An empty search result is valid; it does not prove the filter is broken. |
| Dashboard page 1 | 10 rows | Page-size behavior was correct. |
| Dashboard page 2 | 10 rows | The next page was available and respected the requested size. |
| Page beyond the result | Page 21, 0 rows | Out-of-range pagination returned an empty collection without corrupting the contract. |
| Service filter | Skipped | `RTS_MIS_TEST_SERVICE_ID` was empty, so the test correctly avoided guessing a service ID. |

### Why page size 101 is observational

The documented sizes stop at 100, but the test deliberately probes 101 to learn what the current
server does. In this run the server accepted it. A future server version might cap it at 100 or
reject it. Therefore application code should continue to rely only on the documented limit unless
the API contract is officially changed.

## 6. How the load test runs

Each of the following workloads is tested separately and sequentially:

| Workload | Request used | Why it is included |
| --- | --- | --- |
| `user-small-response` | Exact application-number search | Represents a very small result and payload. |
| `admin-aggregate-response` | Property Tax, `RTS` module | Represents aggregate department/service data. |
| `dashboard-page-size-100` | Dashboard page 1 with 100 rows | Represents the largest normal list payload used by the test. |

For each workload, the test performs:

1. One **cold request** to capture an initial observation.
2. Two **warm-up requests** so connection setup and runtime initialization have less influence on
   the following batches.
3. One batch at concurrency `1`.
4. A two-second cooldown.
5. One batch each at concurrency `5`, `10`, `25`, and `50`, with cooldowns between levels.

The number in the `concurrency` column is also the number of requests in that batch. Therefore one
workload sends this many measured stress requests:

```text
1 + 5 + 10 + 25 + 50 = 91 requests
```

Across three workloads, the measured ramp contains:

```text
91 × 3 = 273 requests
```

Cold and warm-up requests are additional requests and are not included in the 273 measured batch
successes.

The test stops escalating a workload when a batch has a failure rate of at least 20%, or when a
throttling/service-unavailable response is detected. Every request also has a 30-second timeout.

## 7. Cold-request results

| Workload | Elapsed | Decoded payload | Returned collection count |
| --- | ---: | ---: | --- |
| `user-small-response` | 293.03 ms | 0.48 KiB | 1 user application |
| `admin-aggregate-response` | 87.38 ms | 4.19 KiB | 13 departments and 7 services |
| `dashboard-page-size-100` | 123.42 ms | 116.40 KiB | 100 dashboard applications |

The cold result is only one sample. It is useful for spotting a very large initialization penalty,
but it is not a stable average. DNS, TLS connection reuse, network state, server cache state, and
other traffic can all change this number.

## 8. Concurrency results from this run

### Small user response

| Concurrency | Success | Failure | Avg ms | p95 ms | Max ms | Requests/sec | Total payload KiB |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 1 | 0 | 247.37 | 247.37 | 247.37 | 4.04 | 0.48 |
| 5 | 5 | 0 | 344.32 | 418.07 | 418.07 | 11.93 | 2.42 |
| 10 | 10 | 0 | 515.33 | 626.10 | 626.10 | 15.93 | 4.84 |
| 25 | 25 | 0 | 956.83 | 1088.99 | 1092.71 | 22.81 | 12.11 |
| 50 | 50 | 0 | 1619.47 | 1783.31 | 1838.22 | 27.15 | 24.22 |

Interpretation:

- All 91 measured requests succeeded.
- Throughput increased as concurrency increased, reaching 27.15 requests/second.
- Average response time also increased from 247.37 ms to 1619.47 ms. This means the server or
  network handled more total work per second, but each individual caller waited longer.
- The response itself is very small, so the growth is unlikely to be caused by JSON payload size.
  Queueing, upstream processing, connection limits, or shared server resources are more likely
  contributors, but this client-only test cannot identify which one.

### Admin aggregate response

| Concurrency | Success | Failure | Avg ms | p95 ms | Max ms | Requests/sec | Total payload KiB |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 1 | 0 | 83.77 | 83.77 | 83.77 | 11.93 | 4.19 |
| 5 | 5 | 0 | 134.59 | 136.41 | 136.41 | 36.53 | 20.94 |
| 10 | 10 | 0 | 177.27 | 209.03 | 209.03 | 47.54 | 41.88 |
| 25 | 25 | 0 | 207.62 | 255.86 | 264.02 | 93.90 | 104.69 |
| 50 | 50 | 0 | 389.41 | 618.20 | 2026.66 | 24.62 | 209.38 |

Interpretation:

- All 91 requests succeeded with no timeout or throttling.
- Concurrency 25 produced the highest observed throughput in this single run.
- At concurrency 50, average and tail latency rose, throughput fell, and one request took about
  2.03 seconds. That pattern suggests a possible saturation or queueing point above 25 concurrent
  requests.
- It is not enough evidence to declare 25 the permanent capacity limit. Several repeated runs and
  server-side telemetry are required before making that decision.

### Dashboard response with 100 rows

| Concurrency | Success | Failure | Avg ms | p95 ms | Max ms | Requests/sec | Total payload KiB |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 1 | 0 | 90.20 | 90.20 | 90.20 | 11.07 | 116.40 |
| 5 | 5 | 0 | 151.39 | 197.92 | 197.92 | 25.19 | 582.01 |
| 10 | 10 | 0 | 518.45 | 621.32 | 621.32 | 16.08 | 1164.02 |
| 25 | 25 | 0 | 911.35 | 1888.48 | 1918.62 | 13.03 | 2910.06 |
| 50 | 50 | 0 | 1224.58 | 2324.03 | 2540.02 | 19.68 | 5820.12 |

Interpretation:

- All 91 requests succeeded.
- Each successful response was approximately 116.40 KiB after JSON decoding.
- At concurrency 50, the client decoded about 5.68 MiB of JSON across the batch.
- Tail latency increased substantially: p95 reached 2324.03 ms and the slowest request took
  2540.02 ms.
- Throughput did not increase smoothly. That is normal in a one-off live test because network and
  server activity vary during the run. It also shows why one table must not be treated as a precise
  capacity curve.

## 9. Every performance column explained

| Column | Plain-language meaning | How to use it |
| --- | --- | --- |
| `workload` | The flag and response type currently being tested. | Compare like-for-like workloads. A 0.48 KiB user response should not be directly compared with a 116.40 KiB dashboard response without considering payload size. |
| `concurrency` | Requests started together in this batch. | Concurrency 50 means 50 simultaneous requests, not 50 requests per second. |
| `successCount` | Requests that completed and returned valid parsed data. | It should normally equal concurrency. |
| `failureCount` | Requests that threw an error or could not complete normally. | Any value above zero fails the final workload assertion. |
| `timeoutCount` | Failures caused by the 30-second client timeout. | A timeout means the client did not finish in 30 seconds; it does not prove where the delay occurred. |
| `throttledCount` | Failures recognized as rate limiting or service unavailability, such as HTTP 429 or 503. | A value above zero stops higher concurrency levels to avoid continuing pressure on an unhealthy service. |
| `errorRatePercent` | `failureCount ÷ total requests × 100`. | A value of 20% or more stops escalation. Zero is the desired result. |
| `throughputRequestsPerSecond` | Total attempts divided by the wall-clock duration of the whole batch. | Shows how much work completed per second. Higher is better only when latency and error rate remain acceptable. |
| `minMs` | Fastest successful request. | Shows the best observed case, not normal performance. |
| `averageMs` | Mean duration of successful requests. | Easy to understand, but sensitive to very slow outliers. Read it with p95 and max. |
| `p50Ms` | Median successful duration. Half completed at or below this time. | A useful “typical request” measurement. |
| `p90Ms` | 90% completed at or below this time. | Begins to show slower user experiences. |
| `p95Ms` | 95% completed at or below this time. | Common tail-latency indicator. With small batches it may equal the maximum. |
| `p99Ms` | 99% completed at or below this time. | Represents extreme tail latency, but a 50-request sample is too small for a statistically strong p99. |
| `maxMs` | Slowest successful request. | Useful for spotting an outlier, but one maximum alone should not define an SLA. |
| `averagePayloadKiB` | Average size of `JSON.stringify(response.data)` for successful responses. | Approximates how much decoded JSON the Node client handled per response. |
| `maximumPayloadKiB` | Largest decoded JSON payload in the batch. | Helps detect a response that is unexpectedly much larger than the others. |
| `totalPayloadKiB` | Sum of decoded JSON payloads for all successful requests. | Indicates total JSON-processing pressure on the Vitest client during that batch. |
| `cpuMs` | User plus system CPU time consumed by the Vitest Node.js process during the batch. | This is client CPU, not MIS API-server CPU and not SQL Server CPU. |
| `heapDeltaKiB` | Node.js heap after the batch minus heap before the batch. | Positive means more heap remained allocated; negative means garbage collection freed memory. It is not a direct memory-leak measurement. |
| `eventLoopMeanMs` | Average scheduling delay observed in the Vitest Node.js event loop. | Large growth can indicate the test client is struggling to parse/process concurrent responses. |
| `eventLoopMaxMs` | Largest observed event-loop scheduling delay. | Read as a client-side responsiveness signal, not server latency. |
| `responseCounts` | Sum of returned rows in each flag-specific collection across successful requests. | Confirms which collection supplied the tested response and helps detect unexpectedly empty or oversized data. |
| `stoppedEscalation` | Whether failures reached 20% or throttling was detected. | `false` at every level means the ramp was allowed to reach concurrency 50. |
| `errors` | Deduplicated, sanitized error descriptions. | Used for diagnosis without printing complete responses or personal data. |

## 10. Important statistical cautions

### One request does not produce meaningful percentiles

At concurrency 1 there is only one duration. Therefore minimum, average, p50, p90, p95, p99, and
maximum all equal the same value. This is mathematically expected and does not mean the API has
perfectly stable latency.

### A 50-request batch is still a small p99 sample

With 50 measurements, p99 is effectively near the slowest request. Stable production percentiles
normally require hundreds or thousands of samples across multiple time periods.

### Throughput and latency must be read together

Higher concurrency can increase requests per second while making each request slower. For example,
the small user workload increased from 4.04 to 27.15 requests/second, but average latency increased
from 247.37 ms to 1619.47 ms. That is increased throughput with increased waiting time, not a free
performance improvement.

### Negative heap delta is allowed

The report contains negative heap deltas in some batches. JavaScript garbage collection can run
during a batch and leave the process with less allocated heap than it had at the start. A reliable
memory-leak investigation requires repeated workloads, forced-GC-aware methodology, heap snapshots,
and a trend over time.

### Decoded JSON is not network transfer size

Payload is measured by serializing the parsed response data. It does not include HTTP headers and
does not account for gzip or Brotli compression. Browser developer tools or server telemetry are
needed to measure actual bytes transferred over the network.

## 11. What passed, and what that proves

In the supplied run:

- the functional scenarios completed successfully;
- one optional ServiceId scenario was skipped because no service ID was configured;
- all 273 measured stress requests succeeded;
- there were zero measured failures;
- there were zero measured timeouts;
- there were zero measured throttling responses; and
- every workload reached concurrency 50 without triggering the safety cutoff.

This proves that the tested API contracts and filters behaved consistently for the data and server
state present during this run, and that the endpoint survived this particular staged workload.

It does **not** prove:

- the server can sustain concurrency 50 indefinitely;
- the server has no database bottleneck;
- all users will see the same latency;
- page size 101 is a supported permanent contract;
- there is no Node.js or server-side memory leak; or
- the current numbers are suitable as a production SLA.

## 12. How to investigate an unhealthy future run

Use this order when a future table contains failures or poor latency:

1. **Check `failureCount`, `timeoutCount`, and `throttledCount`.** Correctness and availability come
   before latency.
2. **Read `errors`.** The JSON report stores sanitized distinct error messages.
3. **Find the first concurrency level where behavior changes.** Compare it with the preceding level.
4. **Compare average, p95, and max.** A normal average with a very high max may be one outlier;
   simultaneous growth across all three is broader degradation.
5. **Check payload size.** A data-volume increase may explain additional client parsing and transfer
   time.
6. **Check event-loop delay and CPU.** If these remain low while end-to-end latency grows, the delay
   is more likely outside the Vitest Node process.
7. **Correlate with server evidence.** Review MIS web-server request duration, SQL query duration,
   connection-pool usage, CPU, memory, and rate-limiter logs for the same timestamp.
8. **Repeat the test.** A single internet-facing run can be affected by temporary network or server
   conditions.

## 13. Pass/fail policy

Latency is observational. The suite does not fail simply because a request takes more than an
arbitrary target such as 200 ms.

The suite does fail for meaningful problems such as:

- an invalid or missing documented response collection;
- malformed records or invalid aggregate counts;
- filter results that contradict the requested status, department, service, or application number;
- unexpected HTTP/service failures;
- a request exceeding the 30-second timeout;
- any measured workload failure; or
- failure to reach concurrency 50 when the safety cutoff is triggered.

## 14. Output files and privacy

The full sanitized machine-readable report is written to:

```text
test-results/rts-mis-live-performance.json
```

If only functional tests run and no stress batches are produced, the file is:

```text
test-results/rts-mis-live-functional.json
```

The test intentionally does not print applicant names, mobile numbers, remarks, or complete API
responses. Performance reports should remain sanitized if new fields are added later.

## 15. Recommended next steps for reliable benchmarking

For a stronger performance baseline:

1. Run the suite several times during controlled periods.
2. Keep the same data filters and server version for comparable runs.
3. Store report files with a timestamp instead of overwriting the previous report.
4. Compare median and p95 trends, not only averages.
5. Capture server and SQL telemetry during the same test window.
6. Define an SLA only after product requirements and repeated measurements are available.
7. Run high-concurrency tests only with authorization and outside peak production traffic.
