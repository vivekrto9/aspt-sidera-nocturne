import assert from "node:assert/strict";
import test from "node:test";

import { databaseNameForEnvironment } from "../../scripts/wrangler-deploy-target.mjs";

const config = {
  d1_databases: [
    { binding: "DB", database_name: "sidera-warm-modern-site" },
  ],
  env: {
    preview: {
      d1_databases: [
        { binding: "DB", database_name: "sidera-warm-modern-preview-site" },
      ],
    },
    production: {
      d1_databases: [
        { binding: "DB", database_name: "sidera-warm-modern-production-site" },
      ],
    },
  },
};

test("selects the D1 database from the requested deployment environment", () => {
  assert.equal(
    databaseNameForEnvironment(config, "preview"),
    "sidera-warm-modern-preview-site",
  );
  assert.equal(
    databaseNameForEnvironment(config, "production"),
    "sidera-warm-modern-production-site",
  );
});

test("does not fall back to the local top-level D1 database", () => {
  assert.throws(
    () => databaseNameForEnvironment(config, "missing"),
    /missing environment/i,
  );
});
