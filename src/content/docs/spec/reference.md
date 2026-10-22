---
title: Spec reference
description: Every field in linuxlive.yaml, with its type, limits, default, the pipeline version it arrived in and what the build does with it.
---

This page lists every field the spec format has, as of pipeline v0.9.1. The format itself is a JSON Schema, [spec.schema.json](https://github.com/Eric-Ness/linuxlive/blob/main/linuxlive/data/spec.schema.json); the limits below come from it and from the validator in the pipeline's `spec.py`, which checks what a schema cannot.

How to read the tables:

- **Since** is the pipeline release that added the field. A repository pinned to an older release rejects fields it does not know. See [pinning to a release](/spec/github-actions/#pin-a-release).
- Paths are relative to `linuxlive.yaml` and must point inside its folder.
- Any field not listed here is an error.

## Top level

| Field | Type | Required | Default | Limits | Since |
| --- | --- | --- | --- | --- | --- |
| `schema_version` | integer | yes | | must be `1` | v0.1.0 |
| `name` | string | yes | | 1 to 40 characters; pattern `^[A-Za-z0-9](?:[A-Za-z0-9 ._+-]*[A-Za-z0-9+])?$` | v0.1.0 |
| `id` | string | no | made from `name` | pattern `^[a-z][a-z0-9-]{1,29}$` (2 to 30 characters) | v0.1.0 |
| `version` | string | yes | | pattern `^[0-9A-Za-z][0-9A-Za-z.+~-]{0,19}$` (1 to 20 characters) | v0.1.0 |
| `base` | string | yes | | `ubuntu` or `fedora` | v0.1.0 |
| `desktop` | string | yes | | `gnome`, `kde` or `cinnamon` | v0.1.0 |
| `apps` | list of strings | no | none | at most 50, no repeats; each `^[a-z0-9][a-z0-9-]*$` and in the catalog | v0.1.0 |
| `flathub` | list of strings | no | none | at most 50, no repeats; each at most 255 characters, pattern `^[A-Za-z_][A-Za-z0-9_-]*(\.[A-Za-z_][A-Za-z0-9_-]*){2,}$` | v0.6.0 |
| `branding` | mapping | yes | | see [branding](#branding) | v0.1.0 |
| `settings` | mapping | no | the base's own | see [settings](#settings) | v0.5.0 |
| `firefox` | mapping | no | Firefox's own | see [firefox](#firefox) | v0.5.0 |
| `kiosk` | mapping | no | no kiosk | see [kiosk](#kiosk) | v0.5.0 |
| `persistence` | boolean | no | `false` | Ubuntu only | v0.7.0 |
| `arches` | list of strings | no | `[amd64]` | at least 1, no repeats; `amd64`, `arm64` | v0.8.0 |
| `packages` | list of strings | no | none | see [packages](#packages) | v0.4.0 |
| `files` | list of mappings | no | none | see [files](#files) | v0.4.0 |
| `scripts` | mapping | no | none | see [scripts](#scripts) | v0.4.0 |
| `repos` | list of mappings | no | none | see [repos](#repos) | v0.4.0 |

### name

The display name. It appears in the boot menu (`Try <name> <version>`), on the installer's icon (`Install <name>`), in the desktop's About screen and as `NAME` in `/etc/os-release`. It must start with a letter or digit and end with a letter, digit or `+`; in between, letters, digits, spaces and `. _ + -`.

### id

The machine-friendly name. It is used for the computer's default network name, the ISO's file name, `IMAGE_ID` in `/etc/os-release`, the disk label, and the names of the build's artifacts in GitHub.

When `id` is missing, the pipeline lower-cases `name`, turns every run of other characters into one `-`, and cuts the result to 30 characters. An id must start with a letter, so `os-` is added in front of a name that starts with a digit:

| name | id |
| --- | --- |
| `My Distro 2` | `my-distro-2` |
| `Lawn Darts Linux` | `lawn-darts-linux` |
| `2048 Arcade` | `os-2048-arcade` |

If no valid id comes out, the check says `could not derive a valid id from name ...; set id explicitly`.

### version

Your distro's own version, for example `"0.1"` or `"2026.10"`. Keep the quotes: YAML reads `0.1` as a number, and the check then says `version: 0.1 is not of type 'string'`. It goes into the boot menu and `IMAGE_VERSION` in `/etc/os-release`. Builds made in GitHub also get a `BUILD_ID` there (the date and the run number), so two builds of one version can be told apart.

The disk label is the id and version in capitals, with other characters turned into `_`, at most 32 characters: `testos` 0.1 becomes `TESTOS_0_1`.

### base and desktop

Every desktop is available on both bases. See the [catalog](/spec/catalog/#bases) for what each base and desktop installs. `ID` and `VERSION_ID` in `/etc/os-release` stay the base's own, so package tools keep working.

### apps

Catalog app ids, installed as Flatpaks from Flathub when the ISO is assembled. The same id works on both bases. The check rejects an id that is not in the catalog (`apps: unknown app 'gimp2' (known apps: ...)`) and, when `arches` includes `arm64`, an app Flathub does not build for ARM (`apps: steam is not built for arm64 on Flathub; take it out or drop arm64 from arches`). The [catalog](/spec/catalog/#apps) lists the ids.

### flathub

Any other Flathub app, by its Flathub ID, for example `org.gnome.Chess`. Offline the check only looks at the ID's shape. `validate --online`, which the GitHub build runs first, asks Flathub's API that each app exists, is an app and not a runtime, and is built for every CPU in `arches`. An app that is in the catalog must go in `apps` instead: `flathub/0: org.mozilla.firefox is in the catalog; list it in apps as 'firefox'`.

### persistence

`true` makes the boot menu's first entry keep the live system's changes (files, settings, apps added) on the USB stick. The first time, casper makes a partition labelled `writable` in the free space after the ISO, and finds it again on every boot. A second entry, "without saving anything", starts clean and leaves what was saved alone. **Install** always installs the clean system.

Ubuntu-based distros only. On Fedora the check says `persistence: only Ubuntu-based distros can save changes to the USB stick so far`, because Fedora's live boot keeps a saved layer only on a partition that nothing makes on a written stick.

CI boots a copy of the ISO on a bigger stick twice and checks that the second boot finds what the first saved.

### arches

Which CPUs to build ISOs for. Each gets its own ISO and its own build job.

| Value | For | Notes |
| --- | --- | --- |
| `amd64` | PCs, the default | Boots on BIOS and UEFI |
| `arm64` | Virtual machines on Apple-silicon Macs (UTM, Parallels, VMware Fusion) | UEFI only; ARM has no BIOS. Seven catalog apps are not built for it: see the [catalog](/spec/catalog/#apps). |

In GitHub the arm64 job is called `build arm64`, and its artifacts and image names end in `-arm64`.

## branding

| Field | Type | Required | Default | Limits | Since |
| --- | --- | --- | --- | --- | --- |
| `branding.wallpaper` | string (path) | yes | | PNG or JPEG, at least 1280x720 | v0.1.0 |
| `branding.logo` | string (path) | yes | | square PNG of exactly 128, 256 or 512 pixels | v0.1.0 |
| `branding.accent_color` | string | no | the desktop's own | pattern `^#[0-9a-fA-F]{6}$` | v0.1.0 |
| `branding.splash` | mapping | no | logo over a spinner | see [branding.splash](#brandingsplash) | v0.9.0 |

### wallpaper

The desktop background, also used on the lock screen and, on KDE and Cinnamon, the login screen.

A JPEG builds and boots, but the build in GitHub ends with a check that looks for the wallpaper's colour in screenshots of the running desktop, and that check reads only PNGs. Use an 8-bit PNG for a fully green build. For a colourful wallpaper, its main colour must cover at least a quarter of a screenshot. For a pale or grey one (since v0.8.2), its main colours must cover at least half, and the desktop must not be blank. See [Build checks](/help/build-checks/).

### logo

Your logo appears on the boot splash, as the system logo About screens read, on GNOME's login screen, as KDE's application launcher and as Cinnamon's menu button. Ubuntu's and Fedora's own logos, which are their trademarks, are replaced: Fedora builds use Fedora's neutral `generic-logos`, and Ubuntu's dock shows GNOME's grid icon for Show Apps.

### accent_color

The highlight colour, as `#rrggbb`. Quote it, because YAML treats an unquoted `#` as the start of a comment. What each desktop does with it:

| Desktop | Effect |
| --- | --- |
| KDE Plasma | Uses the colour exactly. |
| GNOME | Picks the nearest of GNOME's named accent colours (blue, teal, green, yellow, orange, red, pink, purple, or slate for greys and dark colours). |
| Cinnamon | Ignored: Cinnamon has no accent setting; its theme fixes the colours. |

On Ubuntu it also colours the text-mode boot splash.

### branding.splash

A boot splash of your own: a Plymouth script and the PNG images it draws. Without it, the splash is your logo over a spinner. [Boot splash](/spec/boot-splash/) explains how to write one.

| Field | Type | Required | Limits |
| --- | --- | --- | --- |
| `branding.splash.script` | string (path) | yes | a UTF-8 text file of at most 64 KB |
| `branding.splash.images` | list of strings (paths) | yes | at most 24 PNGs |

What the check enforces besides the schema:

- Each image's file name is letters, digits, `.`, `_` or `-`, at most 64 characters before `.png`, starting with a letter or digit (`^[A-Za-z0-9][A-Za-z0-9._-]{0,63}\.png$`).
- No image may be called `watermark.png`: that is the logo's name in the splash.
- No two images may have the same file name, even in different folders, because the script loads them by name.
- Each image must really be a PNG.
- The script and the images together are at most 8 MB, because the splash rides in the initramfs that every boot loads first.

On Fedora the build adds the `plymouth-plugin-script` package; Ubuntu's `plymouth` already has the script plugin.

## settings

How the system is set up. All of it is data: nothing here runs code of the spec's own, so a spec with settings can still be built with **Build it for me**. Anything left out keeps the base's own default: US English, a US keyboard and UTC.

| Field | Type | Default | Limits | Since |
| --- | --- | --- | --- | --- |
| `settings.language` | string | the base's own (US English) | pattern `^[a-z]{2,3}_[A-Z]{2}$`; a locale in the catalog | v0.5.0 |
| `settings.keyboard` | string | the base's own (US) | pattern `^[a-z]{2,5}$`; a layout in the catalog | v0.5.0 |
| `settings.timezone` | string | UTC | at most 40 characters; pattern `^(UTC\|[A-Z][A-Za-z_-]+(/[A-Z0-9][A-Za-z0-9_+-]+){1,2})$`; a name from the tz database | v0.5.0 |
| `settings.hostname` | string | the `id` | pattern `^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$` | v0.5.0 |
| `settings.autologin` | boolean | `false` | | v0.5.0 |
| `settings.hidden_apps` | list of strings | none | at most 50, no repeats; each `^[A-Za-z0-9][A-Za-z0-9._-]{0,99}$` | v0.5.0 |
| `settings.dock` | list of strings | the desktop's own | at most 12, no repeats; each 1 to 255 characters and in `apps` or `flathub` | v0.9.0 |

### language

A locale from the [catalog](/spec/catalog/#languages), for example `de_DE`. The system and the session run in it, and the build adds the base's translations: Ubuntu's language packs (and `cinnamon-l10n` on Cinnamon, and Noto CJK fonts for Japanese, Chinese and Korean), or Fedora's `langpacks-<language>`. Flatpak apps get their translations for that language too. An unknown locale gives `settings/language: 'xx_YY' is not one linuxlive knows (known: ...)`.

### keyboard

An XKB layout from the [catalog](/spec/catalog/#keyboards), for example `de`. It is set for the system and for each desktop's session; GNOME and KDE keep their own lists of layouts, which the build seeds with this one.

### timezone

A name from the tz database, such as `Europe/Berlin` or `America/Sao_Paulo`, or `UTC`. A name that is not a time zone gives `settings/timezone: 'Europe/Berln' is not a time zone; use a name like Europe/Berlin`. The installer starts with the same time zone.

### hostname

The computer's name on the network, for the live system and installed ones. Lower-case letters, digits and dashes, at most 63 characters, not starting or ending with a dash.

### autologin

`true` makes installed systems log their user in without a password: the installer's option starts ticked. The live session always logs in automatically, whatever this says.

### hidden_apps

Menu entries to hide, by desktop file name without `.desktop`, for example `org.gnome.Tour` or `org.kde.konsole`. The programs stay installed; only their menu entries are hidden. On Ubuntu the package's file is diverted, so upgrades keep it hidden. linuxlive's own entries (any name starting with `linuxlive`) cannot be hidden. A name that matches no entry is not an error.

### dock

Apps pinned to the dock or panel, in order, after the desktop's file manager. See [The dock](/spec/dock/). An id that is not in `apps` or `flathub` gives `settings/dock/0: 'x' is not one of the spec's apps or flathub apps; only apps the distro has can be pinned`.

## firefox

Firefox's home page and bookmarks, set as policies for everyone. Needs `firefox` in `apps`, or the check says `firefox: the home page and bookmarks are Firefox's; add firefox to apps`. Since v0.5.0.

| Field | Type | Required | Limits |
| --- | --- | --- | --- |
| `firefox.homepage` | string | no | an `http://` or `https://` address, at most 2000 characters, with no spaces, quotes, angle brackets, backslashes, backticks, braces, `\|` or `^` |
| `firefox.bookmarks` | list of mappings | no | at most 50 |
| `firefox.bookmarks[].name` | string | yes | 1 to 100 characters, no control characters |
| `firefox.bookmarks[].url` | string | yes | as `homepage` |

With a home page, Firefox starts on it and its Home button opens it, instead of Firefox's welcome or what's-new pages. Bookmarks go on the bookmarks toolbar, in order, and the toolbar is always shown. With bookmarks, Firefox's own default bookmarks are left out, because on a new profile (every live session's) their import can replace the first of yours.

Either way the policies also stop Firefox asking to be the default browser and skip its first-run dialogs: terms of use, onboarding, importing from another browser and Mozilla's suggestions. The policies go where Flathub's Firefox reads them (`org.mozilla.firefox.systemconfig`). A `firefox` mapping with neither field does nothing.

## kiosk

Kiosk mode: the computer starts straight into one app, full screen, with no desktop around it. Since v0.5.0; a Flathub ID as the app since v0.6.0.

| Field | Type | Required | Limits |
| --- | --- | --- | --- |
| `kiosk.app` | string | yes | a catalog id (`^[a-z0-9][a-z0-9-]*$`) or a Flathub ID; must be in `apps` or `flathub` |

The app runs in Cage on the first console, as the user `linuxlive-kiosk`, instead of the login screen. If it closes, it starts again two seconds later. The other consoles stay reachable with Ctrl+Alt+F2. The boot menu's **Install** entry still starts the desktop, so the installer works. Firefox and Chromium start in their own kiosk modes. On Ubuntu the app runs through Xwayland, because Ubuntu 26.04's Cage crashes when a Wayland app asks for full screen. An app that is not in `apps` or `flathub` gives `kiosk/app: 'x' must be one of the spec's apps or flathub apps`.

`desktop` is still required: it is what **Install** starts and what an installed system uses.

## packages

Packages from the base's own archive: Ubuntu's apt or Fedora's dnf. Since v0.4.0.

| Type | Limits |
| --- | --- |
| list of strings | at most 100, no repeats; each `^[A-Za-z0-9][A-Za-z0-9+._-]{0,99}$` |

They are installed after the desktop, the installer and linuxlive's own packages. Names differ between the bases: `vim` on Ubuntu is `vim-enhanced` on Fedora. A name the archive does not have fails the image build, not the check.

## files

Files copied into the system. Since v0.4.0.

| Field | Type | Required | Default | Limits |
| --- | --- | --- | --- | --- |
| `files` | list of mappings | | | at most 100; 20 MB in all |
| `files[].src` | string (path) | yes | | inside the spec's folder |
| `files[].dest` | string | yes | | at most 200 characters; pattern `^/(etc\|usr)/[A-Za-z0-9._+@-][A-Za-z0-9._+@/-]*$` |
| `files[].mode` | string | no | `"0644"` | pattern `^0?[0-7]{3}$`, for example `"0755"`; quote it |

What the check enforces besides the schema:

- `dest` is a plain path to a file: no trailing `/`, no `//`, no `.` or `..`.
- `dest` is not where linuxlive keeps its own files: `/etc/linuxlive`, `/usr/lib/linuxlive`, `/usr/libexec/linuxlive`, `/usr/lib/os-release` or `/etc/os-release`. A file linuxlive writes anywhere else cannot be replaced either.
- On Fedora, not under `/usr/local`, which is a link into `/var` on Fedora Atomic.
- No two files go to the same `dest`.

CI checks that each file has your contents in the live session and on the installed disk.

## scripts

Shell scripts of the distro's own, run in the order listed. Since v0.4.0.

| Field | Type | Limits | When it runs |
| --- | --- | --- | --- |
| `scripts.build` | list of paths | at most 20, no repeats | As root while the image is built, with the network, after packages, apps and files, and after `repos`. A failing script fails the build. |
| `scripts.first-boot` | list of paths | at most 20, no repeats | Once, as root, on an installed system before its first login screen. Not in the live session. A failing script is logged in `/var/lib/linuxlive/first-boot.log` and the others still run. |
| `scripts.first-login` | list of paths | at most 20, no repeats | Once for each user at their first login, as that user, in their home folder. In the live session, at every start. Logged in `~/.local/state/linuxlive/first-login.log`. |

Each script must be inside the spec's folder, a UTF-8 text file, and at most 256 KB. Scripts are run directly, so start each with `#!/bin/sh` or `#!/bin/bash`. Windows line endings are converted. Build scripts can read the distro's settings from environment variables such as `LL_NAME`, `LL_ID`, `LL_VERSION`, `LL_BASE` and `LL_DESKTOP`.

On Fedora the system is an image: a build script can write to `/usr` and `/etc`, but what it puts in `/var`, `/home` or `/usr/local` is not kept.

Scripts run before linuxlive's own last build step, so branding, the installer and the boot checks still come last. CI checks that each script ran and succeeded, in the live session and on the installed disk.

:::caution
A spec with scripts or repos runs code of its own as root, so **Build it for me** does not take it. Build it in your GitHub instead.
:::

## repos

Code from GitHub, fetched at an exact commit and built into the image. Since v0.4.0.

| Field | Type | Required | Limits |
| --- | --- | --- | --- |
| `repos` | list of mappings | | at most 10 |
| `repos[].url` | string | yes | `https://github.com/owner/name`; pattern `^https://github\.com/[A-Za-z0-9][A-Za-z0-9-]{0,38}/[A-Za-z0-9._-]{1,100}$` |
| `repos[].commit` | string | yes | the full 40-character commit, lower case (`^[0-9a-f]{40}$`) |
| `repos[].run` | string | yes | 1 to 2000 characters |

Repos are fetched from GitHub over HTTPS during the build, so the repository must be public. `run` is shell commands run as root in the unpacked source, for example `make install PREFIX=/usr`; a failure fails the build. Repos run before `scripts.build`. The same repository at the same commit may not be listed twice. Each repo and commit is added to the ISO's package list, so its source can be found.
