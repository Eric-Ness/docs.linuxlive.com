---
title: Extras
description: Packages, scripts, files and code from GitHub on the Workshop's optional Extras step, and what they mean for how you can build.
---

The sixth step, Extras, is optional and meant for people who know Linux. It adds packages from the base's own archive, files placed in the system, your own shell scripts, and code from GitHub. Skip it and nothing changes.

Each kind of extra except packages sits in a section you click open. On **Get it**, the Extras line of the summary sums up what you added, for example "2 packages, 1 file, build script".

## Packages

Package names from your base's own archive, separated by spaces: Ubuntu's apt archive, or Fedora's for a Fedora base. The field reminds you which: "Names are Ubuntu's, from its own archive: one word each, like vim". On Fedora the example becomes `vim-enhanced`, because Fedora names that package differently.

Under the field, the Workshop lists what it will install, word by word: "Will install 2: htop, vim." That makes it easy to spot a sentence typed by mistake.

### The word checks

A wrong package name stops the build, so the Workshop warns you about names that look wrong. It flags any word with a capital letter, and these ordinary words: and, the, a, an, or, with, for, of, to, font, fonts. The warning reads:

> Check fonts: package names are usually lower case and never ordinary words. A wrong name stops the build.

This is only a warning, and it does not block the buttons on **Get it**. These do:

- characters a package name cannot have. Names are letters, digits and `+ . _ -`, starting with a letter or digit ("Package names are letters, digits and + . _ - (not …).")
- more than 100 packages

The Workshop cannot check that a package exists. The build finds out.

## Scripts

Three boxes, one for each kind of script. Each is a shell script; start it with `#!/bin/sh` and `set -eu` as the examples in the boxes do.

| Script | When it runs |
| --- | --- |
| **Build script** | As root while the image is built, with the network, after the packages, apps and files are in |
| **First-boot script** | Once, as root, on an installed computer, before its login screen |
| **First-login script** | Once for each user, as that user. In the live session it runs at every start |

Each script can be up to 256 KB. In the kit they are saved as `scripts/build.sh`, `scripts/first-boot.sh` and `scripts/first-login.sh`.

The Workshop holds one script of each kind. A spec written by hand can list more; see [Open and remix](/workshop/open-and-remix/) for what happens when you open one.

## Files

Choose files from your computer to copy into the system. Each one gets a row with:

- its name
- a box for where it goes, starting as `/etc/<its name>`. Change it to the full path you want.
- **Executable**: tick it for a program or script. Ticked, the file is installed with permissions 0755; unticked, 0644.
- **Remove**

The rules for where a file goes:

- under `/etc` or `/usr`, as a full path to a file, like `/etc/motd`
- not a folder (no `/` at the end) and no `.` or `..` parts
- not where linuxlive keeps its own files: `/etc/linuxlive`, `/usr/lib/linuxlive`, `/usr/libexec/linuxlive`, `/etc/os-release` and `/usr/lib/os-release`
- on Fedora, not under `/usr/local`, which Fedora Atomic does not have in the image. Use `/usr` or `/etc`.
- no two files to the same place, and no two files with the same name

The Workshop takes at most 16 files, 20 MB in all. The first limit is lower than the spec allows so that **Build it in my GitHub** can send them all at once. If you need more, the problem says "add more to your repository by hand".

## Code from GitHub

Code from a public GitHub repository, fetched at an exact commit and built into the image. Fill in:

- **Repository**: `https://github.com/owner/name`
- **Branch, tag or commit**: leave it empty for the repository's default branch
- **Commands to run in it, as root**: for example `make install PREFIX=/usr`. Required, up to 2,000 characters.

Then press **Add this repository**.

### Branches become commits

A branch moves as people push to it, so the Workshop never saves one. When you press **Add this repository**, your browser asks GitHub which commit that branch or tag points at right now ("Asking GitHub which commit that is…"), and saves that commit:

> Added at commit 3f2a9c1e5b7d. The build always uses that commit; add it again to move to a newer one.

Every build of this version uses the same code. To move to newer code, remove the row and add the repository again.

Messages you may see here:

- "Give the repository as https://github.com/owner/name."
- "GitHub has no public repository owner/name with main." The repository is private, misspelt, or has no such branch. Private repositories do not work.
- "Say what to run in the repository, for example make install PREFIX=/usr."
- "That repository and commit are on the list already."

You can add up to 10 repositories.

## The warning about code that runs as root

As soon as you add a script or a repository, a warning appears at the bottom of the step:

> Scripts and GitHub code run as root, in the build and on every computer that installs your distro. Only add code you have read and trust. The Library reads every line before it publishes a distro with code of its own.

Root can do anything to a computer. Read every line before you add it, and before you share the distro.

## Code of its own rules out Build it for me

A distro with any script or any GitHub repository has code of its own. linuxlive.com's builder does not build those:

- **Build it for me** is greyed out on **Get it**. Hover over it and it says "This distro has scripts or GitHub code of its own: build it in your GitHub instead."
- **Build it in my GitHub** and **Download the kit (.zip)** work as usual.

Packages and files are not code of their own. A distro with only those can still use **Build it for me**.

See [Get it](/workshop/get-it/) for the three ways to build.
