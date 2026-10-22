---
title: Writing linuxlive.yaml by hand
description: Who writes a spec by hand, how its folder is laid out, a complete annotated example, and how to check it before you build.
sidebar:
  label: Writing linuxlive.yaml
---

Every distro on linuxlive.com is one file, `linuxlive.yaml`, plus the pictures and files it names. The Workshop writes that file for you. This section is for people who would rather write it themselves.

## Who writes a spec by hand

You do not need to. The Workshop covers almost everything a spec can say. Write or edit the file yourself when:

- you want more than the Workshop holds: several scripts of one kind, file permissions other than `0644` and `0755`, or more than 16 extra files (see [What the Workshop cannot hold](#what-the-workshop-cannot-hold));
- you keep your distro in a GitHub repository made from the template and prefer to edit it there;
- you build on your own Linux machine (see [Building locally](/spec/building-locally/));
- you want comments in the file. The Workshop does not keep them.

The pages in this section are the reference: [every field](/spec/reference/), [the catalog](/spec/catalog/) of bases, desktops, apps, languages and keyboards, [examples](/spec/examples/), [boot splashes](/spec/boot-splash/), [the dock](/spec/dock/), and building with [GitHub Actions](/spec/github-actions/) or [locally](/spec/building-locally/).

## The folder

A spec lives in a folder with everything it names. Paths in the spec are relative to `linuxlive.yaml`, and every file must be inside that folder.

```text
my-distro/
  linuxlive.yaml        the spec
  assets/               wallpaper and logo (and a boot splash, if you have one)
    wallpaper.png
    logo.png
    splash/
      splash.script
      dots.png
  files/                files copied into the system (files:)
    motd
  scripts/              your own scripts (scripts:)
    build.sh
    first-boot.sh
    first-login.sh
```

This is the layout the Workshop's kit uses and the template repository expects. Only `linuxlive.yaml`, the wallpaper and the logo are needed. The folder names are a convention, not a rule: any path inside the spec's folder works.

## A complete example

This spec uses most of what the format offers. Every part below `branding` is optional.

```yaml
schema_version: 1            # always 1
name: Classroom OS           # up to 40 characters; boot menu, About screen, os-release
id: classroom                # optional; made from name when left out
version: "2026.10"           # keep the quotes
base: ubuntu                 # ubuntu (26.04 LTS) or fedora (44)
desktop: gnome               # gnome, kde or cinnamon
apps:                        # catalog app ids, installed from Flathub
  - firefox
  - libreoffice
  - gcompris
flathub:                     # any other Flathub app, by its Flathub ID
  - org.gnome.Chess
branding:
  wallpaper: assets/wallpaper.png   # PNG or JPEG, at least 1280x720
  logo: assets/logo.png             # square PNG: 128, 256 or 512 pixels
  accent_color: "#1565c0"           # keep the quotes
  splash:                           # a boot splash of your own
    script: assets/splash/splash.script
    images:
      - assets/splash/dots.png
settings:
  language: en_GB             # a locale from the catalog
  keyboard: gb                # an XKB layout from the catalog
  timezone: Europe/London
  hostname: classroom-pc      # defaults to the id
  autologin: true             # installed computers log straight in
  hidden_apps:                # menu entries to hide, by desktop file name
    - org.gnome.Tour
  dock:                       # pinned after the file manager, in order
    - firefox
    - org.gnome.Chess
firefox:                      # needs firefox in apps
  homepage: https://example.org/
  bookmarks:
    - name: Example
      url: https://example.org/
persistence: true             # keep changes on the USB stick (Ubuntu only)
arches: [amd64, arm64]        # also an ISO for ARM virtual machines
packages:                     # from the base's own archive
  - htop
files:
  - src: files/motd
    dest: /etc/motd
scripts:
  build: [scripts/build.sh]              # root, while the image is built
  first-boot: [scripts/first-boot.sh]    # root, once, on an installed computer
  first-login: [scripts/first-login.sh]  # each user, once
repos:                                   # GitHub code at an exact commit
  - url: https://github.com/owner/name
    commit: 3f2a9c1e5b7d4e8a9c217d4e5f6a8b904c1d2e3f
    run: make install PREFIX=/usr
```

Two things catch most people out:

- **Quote `version` and `accent_color`.** Unquoted, YAML reads `0.1` as a number and treats `#` as the start of a comment.
- **Field names are exact.** Any field the format does not know is an error, which catches typos such as `desktops:` or `wallpapper:`.

`kiosk` is left out above because a kiosk starts one app with no desktop around it, which would make the dock and the other desktop settings pointless. See [kiosk in the reference](/spec/reference/#kiosk).

:::caution
Scripts and repos run as root on every computer that builds or installs your distro. Read them through before you share it. A spec with scripts or repos cannot be built with **Build it for me**; build it in your GitHub instead.
:::

## Check it before you build

The pipeline checks a spec before it builds anything, so most mistakes show up in seconds. You can run the same check yourself. It needs Python 3.11 or newer and a copy of the pipeline:

```bash
git clone https://github.com/Eric-Ness/linuxlive.git
cd linuxlive
python -m pip install -r requirements.txt
python -m linuxlive validate ../my-distro/linuxlive.yaml
```

This works on Windows, macOS and Linux. A good spec prints one line:

```text
../my-distro/linuxlive.yaml: valid (Classroom OS 2026.10, ubuntu, gnome, 3 apps and 1 from Flathub)
```

A bad one prints `invalid spec` and lists every problem it found, each starting with where it is in the file:

```text
../my-distro/linuxlive.yaml: invalid spec
  - version: 0.1 is not of type 'string'
```

The check runs in two passes. The first checks the shape of the file: field names, types, patterns and limits. The second checks what a schema cannot: that each app is in the catalog, that the desktop exists on the base, that the pictures are the right size and format, and that every file is inside the spec's folder. If the first pass finds problems, fix them and run it again to see the second.

### Checking Flathub apps

Offline, `validate` only checks that each `flathub` ID has the right shape. Add `--online` to ask Flathub's API about each one:

```bash
python -m linuxlive validate --online ../my-distro/linuxlive.yaml
```

Each app must exist on Flathub, be an app (not a runtime) and be built for every CPU in `arches`. Flathub's verified mark is shown but not required. If an app is built on a runtime that gets no more updates, `validate --online` warns that Flathub may list it under a new ID. The build in GitHub always runs `validate --online` first.

### Messages you may see

| Message | What to do |
| --- | --- |
| `version: 0.1 is not of type 'string'` | Quote it: `version: "0.1"`. |
| `branding/accent_color: None is not of type 'string'` | Quote the colour: `accent_color: "#2e7d32"`. |
| `Additional properties are not allowed ('desktops' was unexpected)` | That field name is misspelled or does not exist. |
| `apps: unknown app 'gimp2' (known apps: ...)` | Use an id from the [catalog](/spec/catalog/#apps). |
| `flathub/0: org.mozilla.firefox is in the catalog; list it in apps as 'firefox'` | Catalog apps go in `apps`, by their short id. |
| `branding/logo: 'logo.png' is 1920x1080; it must be square, 128, 256, 512 pixels` | Resize the logo to a square of 128, 256 or 512 pixels. |
| `branding/wallpaper: 'wallpaper.png' is 256x256; it must be at least 1280x720` | Use a bigger wallpaper. |
| `branding/wallpaper: file 'wallpaper.png' not found` | Paths are relative to the spec file. Check the folder and the spelling, including upper and lower case. |
| `id: could not derive a valid id from name ...; set id explicitly` | Add an `id:` line yourself. |
| `settings/dock/0: 'vlc' is not one of the spec's apps or flathub apps; only apps the distro has can be pinned` | Add the app to `apps` or `flathub`, or take it off the dock. |
| `persistence: only Ubuntu-based distros can save changes to the USB stick so far ...` | Use `base: ubuntu`, or remove `persistence`. |

## Opening a spec in the Workshop

The Workshop can open a spec you wrote by hand. Zip the spec's folder (or download your distro's repository from GitHub as a zip) and use **Open its kit (.zip)** at the top of the Workshop, next to "Made one before?". The zip is read in your browser. The Workshop finds the `linuxlive.yaml` nearest the top of the zip and reads the files it names. Kits can unpack to at most 60 MB. See [Open and remix](/workshop/open-and-remix/).

### What the Workshop cannot hold

The Workshop keeps one script of each kind and offers only two file permissions. When a spec has more than that, the Workshop lists what it would change when it opens it. If you opened a kit, the new version you make differs from the spec. If you opened your distro from your GitHub to change it, saving there from the Workshop is turned off. It reports, for example:

- "It has 2 build scripts, and the Workshop holds one of each kind."
- "files/tool has permissions 0700, and the Workshop sets 0644 or 0755."
- "Comments in its linuxlive.yaml are not kept."

The Workshop also accepts at most 16 extra files, fewer than the 100 a spec allows, so that **Build it in my GitHub** can send them all at once. Edit the file on GitHub instead when you need more than the Workshop holds.
