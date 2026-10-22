---
title: How it works
description: What linuxlive makes, how a spec and its art become a tested ISO, and where the build runs.
---

linuxlive turns a short description of a distro into a live ISO. You choose a base, a desktop, apps and your own art. linuxlive builds the system, boots it in a virtual PC five different ways, installs it to a disk, checks the result against what you asked for, and only then hands you the ISO.

## What you get

The ISO is one file you write to a USB stick or open in a virtual machine.

- **It runs live.** Start a PC from the stick and your distro runs without touching the PC's disk. Nothing is saved when you shut down, unless an Ubuntu-based distro has **Save files and settings on the USB stick** turned on.
- **It starts on old and new PCs.** The same ISO boots under BIOS and under UEFI, from a USB stick or a DVD.
- **It works with Secure Boot on.** The boot path uses Ubuntu's or Fedora's own signed boot loader, so you do not have to turn Secure Boot off. See [Secure Boot](/help/secure-boot/).
- **It can install itself.** An "Install" icon on the live desktop and an "Install" entry in the boot menu put the distro on a computer's disk. The installer erases one whole disk. Fedora-based distros install from a system image the build publishes, so installing them needs the internet. See [Installing](/help/installing/).

Underneath is Ubuntu 26.04 LTS or Fedora 44, with GNOME, KDE Plasma or Cinnamon on top. Apps come from Flathub. Your name, logo, wallpaper and accent colour replace Ubuntu's and Fedora's own branding, from the boot menu to the About screen.

## Spec plus art makes a kit

Every distro starts as a file called `linuxlive.yaml`, the spec. It lists the base, the desktop, the apps, the settings and where the art is. Here is a short one:

```yaml
schema_version: 1
name: My Distro
version: "0.1"
base: ubuntu
desktop: cinnamon
apps:
  - firefox
  - vlc
branding:
  wallpaper: assets/wallpaper.png
  logo: assets/logo.png
  accent_color: "#c2185b"
```

The spec and the files it names together are the **kit**:

| In the kit | What it is |
| --- | --- |
| `linuxlive.yaml` | The spec |
| `assets/` | The wallpaper, the logo, and a boot splash if you made one |
| `scripts/` | Your own scripts, if the distro has any |
| `files/` | Files the distro places in the system, if any |
| `README.md` | The steps to build it (only in the kit you download) |

The [Workshop](/workshop/) writes the kit for you, so you never have to open the spec. If you would rather write it by hand, see [Writing linuxlive.yaml](/spec/).

## From kit to ISO

Every build, wherever it runs, goes through the same steps of the open-source pipeline, [linuxlive](https://github.com/Eric-Ness/linuxlive).

1. **Check the spec.** The spec is checked against linuxlive's rules: known apps, an image of the right size, a version in the right form. Apps added by their Flathub ID are looked up on Flathub. A problem here stops the build before anything is built.
2. **Compile.** linuxlive turns the spec into build instructions for a system image, with your branding laid over it.
3. **Build the image.** Ubuntu-based distros start from Ubuntu's own image and install the desktop with Ubuntu's packages. Fedora-based ones start from Fedora's Atomic desktop images, so installed systems can later update as one image.
4. **Assemble the ISO.** The system is packed into one ISO that starts from a DVD or a USB stick, under BIOS or UEFI, with the signed boot loader for Secure Boot. The Flathub apps are already inside.
5. **Boot it.** The ISO is started in QEMU, a virtual PC, in five ways (below). A small service inside the image reports what it sees: the distro's name, the firmware, whether Secure Boot is on, the apps, the boot splash, the desktop, and any system service that failed.
6. **Install it.** The ISO installs itself to a blank virtual disk, and the installed system is started again from that disk, under UEFI with Secure Boot and under BIOS. Fedora-based builds skip this step when they publish no system image, as with **Build it for me**: those ISOs are live only. A distro with **Save files and settings on the USB stick** is also started twice from a stick, to check that the second start finds what the first one saved.
7. **Verify.** The reports and screenshots are checked against the spec. The build fails if the system shows the wrong name, the upstream boot splash, a failed system service, or a desktop without your wallpaper.

Only a build that passes every step gives you an ISO. When one fails, the step that failed says why: see [Failed builds](/help/failed-builds/) and [Build checks](/help/build-checks/).

## The five boot tests

| Boot test | What it stands for |
| --- | --- |
| UEFI from USB, to the desktop | A current PC started from a USB stick. This test waits for the desktop and takes the screenshot you see on the build's page. |
| UEFI with Secure Boot, from CD | A current PC with Secure Boot on. The test checks that Secure Boot really is on inside the running system. |
| UEFI from CD | A current PC started from a DVD. |
| BIOS from CD | An older PC, or one set to legacy boot, started from a DVD. |
| BIOS from USB | An older PC started from a USB stick. |

These run in a virtual PC, not on real hardware. See [Known limits](/help/known-limits/) for what that does and does not prove.

## Where builds run

The pipeline is the same everywhere. What differs is whose computer runs it.

- **GitHub Actions, in your own repository.** **Build it in my GitHub** and the [template](https://github.com/Eric-Ness/linuxlive-distro) run the build on GitHub's free runners for public repositories. Builds here can include an ARM ISO for Apple-silicon Macs, and distros with scripts or GitHub code of their own.
- **linuxlive.com's build server.** **Build it for me** runs the build on linuxlive.com's own server, one build at a time, each in a fresh virtual machine that is thrown away afterwards. It builds the PC ISO only, and only distros without code of their own.
- **Your own Linux machine.** With the kit and the pipeline, you can run every step yourself. See [Building locally](/spec/building-locally/).

[Ways to build](/start/ways-to-build/) compares the three side by side.
