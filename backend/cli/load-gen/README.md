# Balance load-test data generator

Fills a dedicated MariaDB (`sudosos-balance-lt`, `127.0.0.1:3307`, db `balance_lt`) with a large,
realistic, reproducible ledger for load-testing the balance query.

## Run

```bash
cd backend
source cli/load-gen/env.sh          # TYPEORM_* env vars for the load-test DB
pnpm exec ts-node cli/load-gen/generate.ts --tier S|M|L|XL --seed N [--reset] [--cache]
# or: pnpm loadgen --tier M --seed 1 --reset
```

- `--reset` drops and recreates the database, then loads `schema.sql` (prod-identical schema).
  Without it the generator refuses to run against a non-empty DB.
- `--cache` additionally seeds the `balance` cache table (default off = cold cache).
  It does not change the ledger: same tier + seed gives identical ledger rows with or without it.
- Same tier + seed => identical data (mulberry32 PRNG, ids assigned sequentially).

| Tier | Transactions | Users | Transfers | Sellers / POS / products |
|------|--------------|-------|-----------|--------------------------|
| S    | 1k           | 50    | 100 (min) | 4 / 3 / 40               |
| M    | 200k         | 1k    | 16k       | 8 / 6 / 150              |
| L    | 5M           | 5k    | 400k      | 12 / 10 / 400            |
| XL   | 30M          | 10k   | 2.4M      | 16 / 14 / 800            |

Transfers are 8% of the transaction count (minimum 100). "Users" is the total `user` row count.

## How it loads

No TypeORM. Rows are generated in a stream and sent as multi-row `INSERT`s (2000 events per
flush, at most 10k rows per statement) over one `mysql2` connection per table, with
`FOREIGN_KEY_CHECKS=0, UNIQUE_CHECKS=0`. All references are still valid (verified with orphan
queries). Memory is bounded: only per-user running totals (typed arrays) are kept.

Files: `generate.ts` (CLI + ledger), `catalogue.ts` (users, VAT, products, containers, POS),
`bulk.ts` (writer), `rng.ts`, `time.ts`.

## Data shape

- Timestamps are `datetime(6)` spanning 4 years, ending at `2026-10-01 00:00:00.000000` UTC. Ids
  increase with time within each of `transaction` and `transfer`.
- Activity per user is power-law (rank^-1.1): at tier L the top buyer has ~780k transactions and 6
  users have more than 100k. Half of the transfers pick a user uniformly so the tail still gets
  deposits.
- Each transaction has 1-3 sub_transactions (distinct sellers, from the point of sale's container
  revisions; 3% of transactions have no point of sale), each with 1-6 rows of amount 0-10 that
  point at a product revision contained in that container revision.
- Products have 1-6 revisions with varying `priceInclVat` (some 0, some products always free).
- Transfer kinds: deposit (NULL -> user), payout / fine / write-off (user -> NULL), user or
  organ -> user or organ, invoice (NULL -> user), seller payout (seller -> NULL). 15% have a VAT
  group. Amounts are positive integer cents. Deposits are sized from the user's running deficit
  times a per-user "diligence" factor, so a good share of users end negative (about 60% at tier M).
- Users: LOCAL_ADMIN, ORGAN sellers, POINT_OF_SALE, INVOICE, VOUCHER, INTEGRATION, then regular
  MEMBER / LOCAL_USER / ORGAN buyers. The first regular user is always deleted (`deleted=1`), the
  second always inactive (`active=0`); beyond that ~3% deleted and ~6% inactive.
- Transfer side rows (`invoice`, `stripe_deposit`, `payout_request`, ...) are not created; transfers
  carry only a description.

## Planted edge cases

1. **Shared timestamps.** 3.5% of body events reuse the previous event's exact `createdAt`
   (about 7% of events end up sharing an instant). Half of those are forced onto the same user, so
   tx/tx, tx/transfer and transfer/transfer ties exist for the same user and for different users.
   The final 6 events (3 transactions, 3 transfers) all sit at the latest instant, pairing a
   transaction and a transfer for the same user (3 users).
2. **Buyer == seller.** 2% of transactions are bought by the owner of their first sub_transaction's
   container (`sub_transaction.toId = transaction.fromId`).
3. **Zero amounts.** 2% of rows have `amount = 0`; some price revisions are 0; every 37th transfer
   (plus ~1%) has `amountInclVat = 0`.
4. **NULL-sided transfers.** `fromId IS NULL` (deposits, invoices) and `toId IS NULL` (payouts,
   fines, write-offs, seller payouts).
5. **Users without events.** ~5% of regular users (at least 2) never appear in any transaction or
   transfer. Admin, VOUCHER, INTEGRATION, INVOICE and POS users have no events either.
6. **Latest timestamp.** 3 transactions (with their sub_transactions and rows) and 3 transfers have
   `createdAt = 2026-10-01 00:00:00.000000`, the maximum in the ledger.

## `--cache` semantics

About 60% of non-POS users get a `balance` row; 40% have none ("missing"). Of the cached rows:

| State                      | Share | Content                                                         |
|----------------------------|-------|-----------------------------------------------------------------|
| correct                    | 40%   | cursors = latest transaction / transfer of the user, full total |
| stale                      | 35%   | cursors = latest events with `createdAt <= T`, T random in span |
| `lastTransactionId` NULL   | 12.5% | only transfers counted; half of them also stale                 |
| `lastTransferId` NULL      | 12.5% | only transactions counted; half of them also stale              |

Definition of `amount`: the sum of the user's events of a type with `createdAt <=` the
`createdAt` of that type's cursor row, summed over both types; a NULL cursor contributes 0.
Transaction events are rows bought by the user (negative) and rows sold by the user as seller
(`sub_transaction.toId`, positive). Transfer events are `toId` (positive) and `fromId` (negative).
Cursors are real ids; a user with no events of a type before T gets a NULL cursor. Because the
comparison is on `createdAt`, rows tied with the cursor's timestamp are included. Rows whose amount
would overflow `int(11)` are skipped. Verified on tier S with an independent SQL recomputation
(0 mismatches).

## Reference numbers (this machine, docker MariaDB, 2 GB buffer pool)

- S: ~2 s. M: ~10-45 s. L: ~7 min (slows once the indexes outgrow the buffer pool). XL untested.
- L row counts: 5,000,000 transactions, 7,479,147 sub_transactions, 18,101,946 rows, 400,000 transfers.
