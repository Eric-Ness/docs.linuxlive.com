---
title: Building in GitHub
description: Building a distro with GitHub Actions from the template, the reusable build workflow and its inputs, pinning a release, publishing Fedora's image, and the artifacts a build leaves.
---

GitHub Actions can build your distro on GitHub's machines: it builds the ISO, boots it in QEMU in five ways, and checks the result against your spec. You need no Linux, and builds are free in a public repository. **Build it in my GitHub** in the Workshop makes a repository from the same template for you; this page is the reference for doing it by hand.

## The template

Start from the template repository, [Eric-Ness/linuxlive-distro](https://github.com/Eric-Ness/linuxlive-distro):

1. Click **Use this template**, then **Create a new repository**. Give it a name and create it.
2. Edit `linuxlive.yaml` (the pencil icon edits it in your browser).
3. Replace `assets/wallpaper.png` and `assets/logo.png` with your own, keeping their names, or change the paths in the spec.
4. Commit to `main`. That starts a build.

Keep the repository **public**. Builds in public repositories are free and the ISO can be downloaded. A private repository works too, but builds use your account's Actions minutes, and GitHub Free's 500 MB of artifact storage for private repositories is too small to hold an ISO.

GitHub may start a build of the unchanged example as soon as the repository is made. Let it run, or cancel it from the **Actions** tab.

A repository made from the template holds:

```text
linuxlive.yaml              the spec
assets/                     wallpaper.png and logo.png
.github/workflows/build.yml the workflow below
README.md
```

Put your own scripts in `scripts/` and files in `files/`, as in [the folder layout](/spec/#the-folder).

### The template's workflow

```yaml
name: build

on:
  push:
    branches: [main]
    paths-ignore: [README.md]
  # Monthly rebuild: the 7th at 06:41 UTC.
  schedule:
    - cron: "41 6 7 * *"
  workflow_dispatch:

permissions:
  contents: read
  packages: write

concurrency:
  group: build-${{ github.ref }}
  cancel-in-progress: true

jobs:
  build:
    uses: Eric-Ness/linuxlive/.github/workflows/build.yml@v0.9.1
    with:
      spec: linuxlive.yaml
      publish-image: true
```

It builds:

- on every push to `main`, except one that changes only `README.md`;
- once a month, on the 7th, so the ISO gets the newest packages and security fixes. GitHub pauses scheduled runs after 60 days without a commit. Click **Enable workflow** in the **Actions** tab, or **Rebuild now** on linuxlive.com's My distros page, to turn it back on. To stop monthly builds, delete the `schedule:` lines;
- by hand: **Actions** → **build** → **Run workflow**.

A newer push cancels a build still running for an older one. See [Rebuilds and updates](/distros/rebuilds-and-updates/).

## The reusable workflow

The template's one job calls the pipeline's reusable workflow, [.github/workflows/build.yml](https://github.com/Eric-Ness/linuxlive/blob/main/.github/workflows/build.yml) in Eric-Ness/linuxlive. Any repository can call it. Set its inputs under `with:`; all are optional.

| Input | Type | Default | What it does |
| --- | --- | --- | --- |
| `spec` | string | `linuxlive.yaml` | Path of the spec in your repository. Paths in the spec are relative to it. |
| `name` | string | the spec's `id` | Base name for the ISO and the artifacts: `<name>.iso`, `iso-<name>`, `results-<name>`. Letters, digits, `.`, `_` and `-`, at most 64 characters. |
| `keep-iso` | boolean | `true` | Upload the ISO as an artifact. `false` keeps only the test results. |
| `publish-image` | boolean | `false` | Fedora bases: publish the system image to your repository's packages on ghcr.io. See [Fedora: publish-image](#fedora-publish-image). Ubuntu bases ignore it. |
| `iso-retention-days` | number | `7` | Days GitHub keeps the ISO artifact. |
| `linuxlive-repository` | string | `Eric-Ness/linuxlive` | Where the pipeline is checked out from. Change it only to test a fork of linuxlive. |
| `linuxlive-ref` | string | `v0.9.1` | Pipeline version to build with: a tag, branch or commit. Its default is the release the workflow file belongs to. |

### Pin a release

The `@v0.9.1` after `build.yml` picks the release of linuxlive to build with. It fixes both the workflow and the pipeline it runs, because `linuxlive-ref` defaults to the same tag, so a build stays the same until you change it. To move to a newer release, change the tag in `.github/workflows/build.yml` and commit. The [Changelog](/changelog/) lists what each release added.

A spec can only use fields its pipeline release knows. A spec with `settings.dock` needs v0.9.0 or later, for example; an older release rejects it with `Additional properties are not allowed ('dock' was unexpected)`. The [reference](/spec/reference/) gives the release each field arrived in.

### Several distros in one repository

Give each spec its own file and build them side by side with a matrix. Each gets its own artifacts, named after its `id`:

```yaml
jobs:
  build:
    strategy:
      fail-fast: false
      matrix:
        spec: [kiosk.yaml, classroom.yaml]
    uses: Eric-Ness/linuxlive/.github/workflows/build.yml@v0.9.1
    with:
      spec: ${{ matrix.spec }}
```

## Fedora: publish-image

Fedora-based distros install by pulling their system image (a bootc image) from a registry, so they are installable only when the build publishes one. With `publish-image: true`, and `packages: write` in the calling workflow's permissions as the template has:

1. After the image is built, it is pushed to `ghcr.io/<owner>/<repository>/<name>` tagged `run-<run id>`.
2. The ISO's installer is told to install from `ghcr.io/<owner>/<repository>/<name>:latest`.
3. Only when the whole build passes the Verify step is the image copied to `:latest`.

Installed systems then follow `:latest` with `bootc upgrade`, so every later green build is an update for them. Installing needs the internet. Without `publish-image`, a Fedora-based ISO boots and runs live, but its installer says it cannot install this build, and the build's install test is skipped. Ubuntu-based ISOs install from the ISO itself and ignore `publish-image`. See [Installing](/help/installing/).

## What a build does

The workflow has two jobs. `arches` checks the spec and reads its `arches`. Then one `build` job runs for each CPU: `build` for amd64 on an Ubuntu 24.04 runner, and `build arm64` on GitHub's arm64 runners. The step names are the ones you see in the run:

| Step | What happens |
| --- | --- |
| Check the spec | `python -m linuxlive validate --online`: the spec, its files, and its Flathub apps with Flathub's API. A bad spec stops here with every problem listed. |
| Compile spec | `python -m linuxlive compile` writes the build context. |
| Build image | `podman build` installs the base system, the desktop, the kernel and your packages, and runs your build scripts and repos. |
| Publish the image for this run | Fedora with `publish-image` only. |
| Assemble ISO | Installs the Flatpak apps and writes the hybrid ISO, its SHA-256 and its package list. |
| Inspect ISO | `python -m linuxlive inspect-iso` records the ISO's boot structures. |
| Boot tests | Boots the ISO in QEMU: UEFI from USB (waiting for the desktop and taking screenshots), UEFI with Secure Boot from CD, UEFI from CD, BIOS from CD and BIOS from USB. If the first boot never reaches the running system, the other four are skipped. |
| Persistence test | Specs with `persistence` only: boots a bigger copy of the stick twice. |
| Install test | Installs onto a blank 64 GB disk, then boots it with UEFI Secure Boot and, on amd64, BIOS. Fedora only with `publish-image`. |
| Verify | `python -m linuxlive verify-results` checks everything against the spec. |
| Publish the image as latest | Fedora with `publish-image`, after a passing Verify. |
| Summary | The run's summary page: whether it passed, every check, and where to download the ISO. |

On arm64 the boot tests run UEFI from USB, UEFI with Secure Boot from CD and UEFI from CD, since ARM has no BIOS. GitHub's arm64 runners have no KVM, so these boots are emulated and much slower. A build takes about 20 minutes for Ubuntu and 40 for Fedora on amd64; the job's time limit is 340 minutes on amd64 and 360 on arm64.

[Build checks](/help/build-checks/) explains the checks, and [Failed builds](/help/failed-builds/) what to do when one fails. [The build page](/distros/build-page/) shows the same steps on linuxlive.com.



## Results and artifacts

Every build uploads its artifacts, whether it passed or not. Open the run and scroll to **Artifacts**. Artifacts can only be downloaded while signed in to GitHub.

| Artifact | Kept | Contents |
| --- | --- | --- |
| `iso-<name>` | `iso-retention-days`, 7 days by default | `<name>.iso`, `<name>.iso.sha256` and `<name>.iso.packages` (each installed package, its version and its source package, plus each repo and commit) |
| `results-<name>` | 14 days | the test results, below |

On arm64 the names end in `-arm64`, for example `iso-testos-arm64`. Save the ISO somewhere of your own to keep it longer than the artifact.

### What the results artifact holds

```text
results-<name>/
  meta.json            the run: your commit, run id, build id, base, CPU, spec path,
                       the pipeline's repository, ref and commit, and the published image
  iso.json             the inspect-iso report
  modes/<mode>/        one folder per boot
    result.json        what the system reported during that boot
    serial.log         the serial console
    qemu.log           QEMU's own output
    boot-1.png ...     screenshots from before the system was up (the boot splash)
    screenshot-1.png   screenshots of the desktop, for boots that wait for it
    stuck.png          where the boot stopped, if it never got there
```

The modes are `uefi-usb`, `uefi-sb-cd`, `uefi-cd`, `bios-cd` and `bios-usb`, plus `install`, `installed-uefi-sb` and `installed-bios` for the install test, and `persist-1` and `persist-2` for the persistence test. The screenshots in `modes/uefi-usb/` are the quickest way to see your distro without booting it.

You can re-run the verifier on your own computer, on any system, against a downloaded results artifact. It needs a copy of the pipeline with its requirements (see [Check it before you build](/spec/#check-it-before-you-build)). Unzip the artifact and point `--results` at the folder:

```bash
python -m linuxlive verify-results --spec ../my-distro/linuxlive.yaml --results results-my-distro
```

It prints a `PASS` or `FAIL` line for each check and ends with `VERIFY OK` when all pass. `--check` takes a comma-separated subset of `iso`, `boot`, `session`, `install` and `persistence`, and `--expect-commit <sha>` fails unless the results come from that commit.

:::note
GitHub releases are no help for keeping ISOs: a release file must be under 2 GiB, and linuxlive ISOs are larger.
:::
