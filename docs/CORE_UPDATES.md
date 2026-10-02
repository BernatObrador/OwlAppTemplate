# Updating the shared core

Generated applications keep an editable copy of the core. New applications record the source directory and installed SHA-256 hashes in `.owl-core.json`. Commit this file with your application. `core-files.json` in the source template explicitly lists managed files; new template files are not automatically managed.

From the application directory:

```bash
npm run core:update
npm run core:update -- --apply
npm test
npm run build
```

The first command previews changes without writing. The second applies them. The saved source path is relative to the application; use `--from ../../OwlAppTemplate` to select a different template checkout after moving either project. This reads local files only; it does not fetch releases from the internet. The revision is a content hash, not a published package version.

## Ownership and conflicts

Managed files include generic components, services, base pages/forms, router implementation, utilities, UI providers, selected generators and reference guides. App routes, navigation, feature pages, layouts, styles, environment, database, application configuration and package files remain application-owned. Extend base classes and add separate components for custom behavior.

If an installed file still matches its previous core hash, it can be updated. A local edit or deletion blocks the whole update when the same file also changes upstream. Local edits are preserved when the upstream file has not changed. New upstream files cannot overwrite existing app files. Review a conflict with a diff tool; move app behavior into an extension and align the managed file with upstream, then rerun. There is deliberately no force flag. Upstream deletions require manual migration and removal of the old hash entry. Dependency version changes require an explicit package/lockfile migration before retrying.

Updates save originals under `.owl-core-backups/<id>/`, with `changes.json` listing modified and newly created files. Ignore that backup directory in Git. Ordinary write failures restore the files; process termination or power loss is not transactional. To revert a completed update, restore backed-up files (including `.owl-core.json`) and remove the files listed as created. Keep a Git commit before updating and run the application checks afterwards. The command updates files; it does not prove API compatibility or run tests for you.

## Existing applications

Older apps have no baseline, so differing existing files are reported as conflicts instead of being assumed unmodified. From the template, preview with:

```bash
npm run core:update -- --from . --target ../TaskDesk/TaskDeskApp
```

When running from the template, also supply `--from .` for an application without a saved source. Review and migrate differences first; rerun with `--apply` to record the baseline. Add `"core:update": "node scripts/core-update.mjs"` to the existing app's package scripts. This one-time adoption was completed for TaskDesk, including use of `createRecord()` and `returnUrl` in its custom task pages.

## Architecture decision

A published npm core package would provide dependency-based versioning and is a useful future option when maintaining multiple released apps. It would require moving OWL XML assets, import aliases and extension points into a package contract. The current solution preserves the existing source layout with an explicit, conflict-aware local updater and no new dependencies. It is source synchronization, not a package manager or an automatic migration engine.

