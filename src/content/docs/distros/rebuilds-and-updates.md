---
title: Rebuilds and updates
description: Monthly rebuilds, moving a distro to a newer linuxlive release, and new versions, and what each one changes in your repository.
---

A live ISO never updates itself. A build that is months old still has the security holes of its day. There are three ways a distro's ISO gets newer, and they change different things:

| | What changes | What stays the same |
| --- | --- | --- |
| A rebuild | The packages: the newest from Ubuntu or Fedora | Your spec, and the linuxlive release |
| An update to a newer linuxlive | The pipeline that builds and checks the distro | Your spec |
| A new version | Your spec: whatever you changed, and its version number | The linuxlive release |

## Monthly rebuilds

A distro made with **Build it in my GitHub**, or from the [template](https://github.com/Eric-Ness/linuxlive-distro), rebuilds itself once a month: on the 7th, at 06:41 UTC. Nothing in the spec changes. The build runs the same checks and boot tests as always, and a new ISO with the newest packages and security fixes appears on the run.

The rebuild is a `schedule:` trigger in the repository's `.github/workflows/build.yml`:

```yaml
on:
  push:
    branches: [main]
    paths-ignore: [README.md]
  # Monthly rebuild: the 7th at 06:41 UTC. GitHub pauses it after 60 days
  # without a commit: Enable workflow in the Actions tab, or Rebuild now on
  # linuxlive.com's My distros page, turns it back on.
  schedule:
    - cron: "41 6 7 * *"
  workflow_dispatch:
```

To stop the monthly rebuilds, delete the `schedule:` lines.

### When GitHub pauses it

GitHub pauses scheduled workflows in a repository that has had no commit for 60 days. To turn it back on, do one of these:

- choose **Rebuild now** on [My distros](/distros/my-distros/), which turns the workflow back on and builds straight away, or
- open the repository's **Actions** tab and choose **Enable workflow**.

On My distros, a card whose newest good ISO is 45 days old or more shows an amber "Built N days ago" pill and a note to rebuild. That usually means a monthly rebuild was missed.

### Rebuild now

**Rebuild now** on My distros does the same as a monthly rebuild, at once. On GitHub you can do it yourself with **Actions**, **build**, **Run workflow**.

### Older distros without a monthly rebuild

Distros made before monthly rebuilds came in have no `schedule:` lines. My distros shows "Monthly rebuilds are off, so its ISO only gets new packages when you change it." and a **Turn on monthly rebuilds** button. It opens a pull request adding the lines above; merge it and the distro rebuilds every month from then on.

### Library and Build it for me

- **The Library** rebuilds every distro in it once a month, on the 3rd, with the newest packages. A distro whose rebuild fails keeps its last good ISO. See [The Library](/distros/library/).
- **Build it for me** builds are never rebuilt. They are deleted after 30 days.

## Updating to a newer linuxlive

Your repository's workflow builds with one fixed release of linuxlive, named in `.github/workflows/build.yml`:

```yaml
jobs:
  build:
    uses: Eric-Ness/linuxlive/.github/workflows/build.yml@v0.9.1
    with:
      spec: linuxlive.yaml
      publish-image: true
```

The `@v0.9.1` at the end is the release. A monthly rebuild uses the same release every time, so your distro never changes under you. New releases bring new features and fixes, listed in the [changelog](/changelog/) and on [linuxlive's releases page](https://github.com/Eric-Ness/linuxlive/releases). To use one, the pin has to move.

### From My distros

When a newer release is out, the distro's card says so, for example "linuxlive v0.9.1 is out; this distro builds with v0.8.1.", with a button, **Update to linuxlive v0.9.1**.

The button opens a pull request in your repository, on a branch named after the release, such as `linuxlive-v0.9.1`. It changes only `.github/workflows/build.yml`:

- the release in the `uses:` line, and the comment at the top that names it
- `packages: write` under `permissions:` and `publish-image: true` under `with:`, if they are missing (Fedora-based distros need them to install)
- the monthly rebuild's `schedule:` lines, if they are missing

Anything else in the file stays as it is. Nothing happens until you merge the pull request. Merging it builds and boot-tests the distro with the new release.

If you press the button again before merging, the same pull request is updated. If the workflow does not build with a linuxlive release, or is laid out so the monthly rebuild cannot be added, the page says so and you change the file by hand.

### By hand

Edit `.github/workflows/build.yml` on GitHub and change `@v0.9.1` to the new release. Committing to `main` starts the build.

A new release can add spec fields. Your existing spec keeps working with the old release, but a field only a newer release knows is refused by the old one's spec check. For example, a pinned dock (new in v0.9.0) fails the check on a distro that still builds with v0.8.1. Move the pin first.

## New versions

A distro's `version` in `linuxlive.yaml` is the number people see, for example on My distros and in the Library. Versions are letters, digits and `. + ~ -`, at most 20 characters, such as `0.2`, `1.0` or `2026.11`.

There are two ways to make a new version from My distros:

- **Edit the spec** opens the distro in the Workshop with the next number already filled in, such as 0.3 after 0.2. **Save** commits your changes and the new number together.
- **More**, then **New version**, changes only the number. It commits "Version 0.3 (was 0.2)" to `linuxlive.yaml`.

Either way, the commit starts a build. See [My distros](/distros/my-distros/) for both.

A new version in your repository does not change the Library's copy. When the two differ, My distros offers **Send 0.3 to the Library**, which opens a pull request with the new version for review.
