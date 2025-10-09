// backend/src/migrations/beneficiaries-numberNorm.migration.js
// Idempotent migration for beneficiaries collection:
// - Drop legacy unique indexes that cause false duplicates
// - Backfill digits-only numberNorm
// - (Optional) auto-archive duplicates per user
// - Create unique index { userId: 1, numberNorm: 1 } with partial filter

const { collections } = require("../db/collections");
const { ObjectId } = require("mongodb");

const normalizeMsisdn = (s) => (s || "").replace(/\D/g, "");

const AUTO_ARCHIVE_DUPES = false; // set to true if you want to auto-resolve duplicates

async function dropLegacyIndexes(beneficiaries, log) {
  const idx = await beneficiaries.indexes();
  const toDrop = idx
    .filter((ix) => {
      const key = ix.key || {};
      const name = ix.name || "";
      const isNumberOnly = Object.keys(key).length === 1 && key.number === 1;
      const isLegacyByName = /^uniq_user_number$/i.test(name);
      return isNumberOnly || isLegacyByName;
    })
    .map((ix) => ix.name);

  for (const name of toDrop) {
    try {
      await beneficiaries.dropIndex(name);
      log.info({ index: name }, "dropped_legacy_index");
    } catch (e) {
      log.warn({ index: name, err: e?.message }, "drop_legacy_index_failed_ignored");
    }
  }
}

async function backfillNumberNorm(beneficiaries, log) {
  const cursor = beneficiaries.find(
    { numberNorm: { $exists: false }, number: { $type: "string" } },
    { projection: { _id: 1, number: 1 } }
  );

  const bulkOps = [];
  let processed = 0;

  while (await cursor.hasNext()) {
    const d = await cursor.next();
    const norm = normalizeMsisdn(d.number);
    bulkOps.push({
      updateOne: { filter: { _id: d._id }, update: { $set: { numberNorm: norm } } },
    });

    if (bulkOps.length >= 1000) {
      await beneficiaries.bulkWrite(bulkOps, { ordered: false });
      processed += bulkOps.length;
      bulkOps.length = 0;
      log.info({ processed }, "backfill_progress");
    }
  }
  if (bulkOps.length) {
    await beneficiaries.bulkWrite(bulkOps, { ordered: false });
    processed += bulkOps.length;
    log.info({ processed }, "backfill_progress");
  }
  log.info({ processed }, "backfill_done");
}

async function findDuplicates(beneficiaries) {
  // Find duplicates by userId + numberNorm (ignoring archived ones for resolution step)
  const pipeline = [
    { $match: { numberNorm: { $type: "string" } } },
    {
      $group: {
        _id: { userId: "$userId", numberNorm: "$numberNorm" },
        ids: { $push: "$_id" },
        docs: { $push: { _id: "$_id", archived: "$archived", createdAt: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $match: { count: { $gt: 1 } } },
  ];
  return beneficiaries.aggregate(pipeline).toArray();
}

async function resolveDuplicates(beneficiaries, log) {
  const dups = await findDuplicates(beneficiaries);
  if (!dups.length) return { resolved: 0, remaining: 0 };

  let resolved = 0;
  for (const g of dups) {
    // Keep the newest non-archived, archive the rest
    const sorted = [...g.docs].sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta; // newest first
    });

    const toArchive = sorted.slice(1).map((d) => d._id);
    if (AUTO_ARCHIVE_DUPES && toArchive.length) {
      await beneficiaries.updateMany(
        { _id: { $in: toArchive } },
        { $set: { archived: true, updatedAt: new Date() } }
      );
      resolved += toArchive.length;
      log.warn(
        {
          group: g._id,
          archivedCount: toArchive.length,
          archivedIds: toArchive.map((x) => x.toString()),
        },
        "auto_archived_duplicate_beneficiaries"
      );
    } else {
      log.warn(
        {
          group: g._id,
          duplicates: sorted.map((d) => ({ id: d._id.toString(), archived: !!d.archived })),
        },
        "duplicate_beneficiaries_detected_manual_action_may_be_required"
      );
    }
  }
  const remaining = AUTO_ARCHIVE_DUPES ? (await findDuplicates(beneficiaries)).length : dups.length;
  return { resolved, remaining };
}

async function createTargetIndex(beneficiaries, log) {
  await beneficiaries.createIndex(
    { userId: 1, numberNorm: 1 },
    {
      name: "uniq_user_numberNorm",
      unique: true,
      background: true,
      // Only enforce uniqueness when numberNorm exists and is a string
      partialFilterExpression: { numberNorm: { $type: "string" } },
    }
  );
  log.info("created_unique_index_userId_numberNorm");
}

async function runBeneficiariesMigration(logger) {
  const log = logger || console;
  const { beneficiaries } = collections();

  log.info("beneficiaries_migration_start");

  await dropLegacyIndexes(beneficiaries, log);
  await backfillNumberNorm(beneficiaries, log);

  const { resolved, remaining } = await resolveDuplicates(beneficiaries, log);
  if (remaining && !AUTO_ARCHIVE_DUPES) {
    log.warn(
      { remaining },
      "duplicates_still_present_set_AUTO_ARCHIVE_DUPES_true_or_clean_manually_before_index_creation"
    );
  }

  // Attempt to create index; if duplicates still exist and AUTO_ARCHIVE_DUPES=false, this may throw
  try {
    await createTargetIndex(beneficiaries, log);
  } catch (e) {
    log.error({ err: e?.message }, "create_unique_index_failed");
    if (/E11000/i.test(e?.message || "")) {
      log.error(
        "duplicate_keys_blocking_index_creation_run_with_AUTO_ARCHIVE_DUPES=true_or_clean_duplicates_manually"
      );
    }
    throw e;
  }

  log.info("beneficiaries_migration_complete");
}

module.exports = { runBeneficiariesMigration };
